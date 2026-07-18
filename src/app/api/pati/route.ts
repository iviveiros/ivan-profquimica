import { NextRequest, NextResponse } from 'next/server'
import { getGeminiModel, rebaixarModelo } from '@/lib/gemini'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const MODEL = "llama-3.3-70b-versatile"

// In-memory rate limiter: max 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 60_000 // 1 minute

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT_MAX) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  // Rate limit check
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { type: "erro", mensagem: "Muitas requisições. Aguarde um minuto antes de perguntar de novo." },
      { status: 429 }
    )
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ type: "pergunta", mensagem: "Formato inválido." })
  }

  const { mensagem, historico, alunos, escola, grade, acoesPendentes, todasEscolas } = body
  if (!mensagem?.trim()) {
    return NextResponse.json({ type: "pergunta", mensagem: "Diga algo!" })
  }

  // Se tem ações pendentes e usuário confirmou, executa direto sem chamar Groq
  const t = mensagem.trim().toLowerCase()
  if (acoesPendentes?.length) {
    const palavrasConfirmacao = ["sim", "pode", "confirma", "ok", "claro", "isso", "manda", "faz", "executa"]
    if (palavrasConfirmacao.some(p => t === p || t.startsWith(p + " ") || t.startsWith(p + ","))) {
      return NextResponse.json({ type: "executar", mensagem: "✅ Executando...", acoes: acoesPendentes })
    }
  }

  const alunosList = (alunos || []).map((a: any) => `- ${a.nome} (id:${a.id}) | ${a.turma_nome}`).join("\n")
  const gradeStr = grade ? JSON.stringify(grade, null, 2) : "N/A"
  const hoje = new Date().toISOString().split("T")[0]
  const dias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
  const diaSemana = dias[new Date().getDay()]

  const systemPrompt = `Você é a Pati, assistente do Prof. Ivan.

CONTEXTO:
- Escola ativa: ${escola?.nome || "N/A"} | Hoje: ${hoje} (${diaSemana}-feira)
- Escolas disponíveis: ${todasEscolas?.join(", ") || "N/A"}
- Alunos:\n${alunosList || "Nenhum"}
- Grade horarios (JSON):\n${gradeStr}

REGRAS:
- Se nome incompleto → peça nome completo E turma
- NOTAS: precisa nome, turma, valor, descricao (ex: Prova, Trabalho), bimestre
- ADICIONAR ALUNO: precisa nome completo, turma, e escola (use o nome exato da lista acima). Não precisa ID (é gerado automático). Se o usuário não disser a escola, PERGUNTE.
- REMOVER ALUNO: precisa nome do aluno. A Pati encontra o ID automaticamente.
- FALTAS: precisa nome, turma, data (padrão ${hoje})
- LISTAR: type="resposta" com acao listar_alunos + turma (opcional)
- SORTEAR: type="resposta" com acao sortear_aluno + turma (opcional)
- HORARIOS: type="resposta" com acao consultar_horarios + dia (opcional). Se "hoje" ou sem dia, usa o dia atual. Se pergunta sobre "proxima aula", inclua "proxima":true na acao.
- ADICIONAR AULA: type="confirmacao" com acao adicionar_aula + dia, inicio, fim, materia, turma. Ex: "adicionar aula de Quimica na segunda as 08h"
- EDITAR AULA: type="confirmacao" com acao editar_aula + dia, indice (numero da posicao na grade), e os campos que mudar (inicio, fim, materia, turma). Ex: "mudar a aula 2 de terca para Quimica"
- REMOVER AULA: type="confirmacao" com acao remover_aula + dia, indice. Ex: "remover a primeira aula de quinta"
- Detecte TODAS as ações pedidas pelo usuário
- Se faltar info → type="pergunta" SEM acoes
- Se tem tudo → type="confirmacao" COM acoes e peça confirmação
- Consultas (lista, sorteio, horarios) → type="resposta" direto SEM confirmacao
- Usuário confirmar → type="executar" com mesmas acoes

RESPONDA APENAS ESTE JSON (sem markdown, sem texto extra):
{"type":"pergunta"|"confirmacao"|"executar"|"resposta","mensagem":"texto amigavel","acoes":[{"tipo":"lancar_nota","aluno_id":"ID","aluno_nome":"NOME","turma":"TURMA","valor":"NOTA","descricao":"DESC","bimestre":NUM},{"tipo":"marcar_falta","alunos":[{"id":"ID","nome":"NOME"}],"data":"DATA"},{"tipo":"listar_alunos","turma":"TURMA"},{"tipo":"sortear_aluno","turma":"TURMA"},{"tipo":"consultar_horarios","dia":"segunda|terca|quarta|quinta|sexta","proxima":true},{"tipo":"adicionar_aluno","nome":"NOME COMPLETO","turma":"TURMA","escola":"NOME DA ESCOLA (opcional)"},{"tipo":"remover_aluno","nome":"NOME COMPLETO","turma":"TURMA (opcional)"},{"tipo":"adicionar_aula","dia":"segunda","inicio":"07:10","fim":"08:00","materia":"Quimica","turma":"9 Ano A"},{"tipo":"editar_aula","dia":"terca","indice":2,"materia":"Quimica"},{"tipo":"remover_aula","dia":"quinta","indice":0}]}

IMPORTANTE: Use os IDs reais dos alunos da lista! Não invente IDs.`

  const messages = [
    { role: "system", content: systemPrompt },
    ...(historico || []).map((m: any) => ({ role: m.role, content: m.content })),
    { role: "user", content: mensagem },
  ]

  // Try Groq first, fall back to Gemini on failure
  let content = ""
  let usadoGemini = false

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0, max_tokens: 1500 }),
    })

    if (!res.ok) {
      throw new Error(`Groq error: ${res.status}`)
    }

    const data = await res.json()
    content = data.choices?.[0]?.message?.content || ""
  } catch (groqErr: any) {
    console.warn("Groq falhou, tentando Gemini:", groqErr.message)
    const geminiModels = ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"]
    let geminiSuccess = false
    for (const modelName of geminiModels) {
      try {
        const ai = getGeminiModel(modelName)
        if (!ai) throw new Error("Sem API key do Gemini")
        const geminiMessages = messages.map(m => ({
          role: m.role === "system" ? "user" : m.role,
          parts: [{ text: m.content }],
        }))
        if (messages[0]?.role === "system") {
          geminiMessages[0] = {
            role: "user",
            parts: [{ text: `INSTRUÇÃO: ${messages[0].content}\n\nLEMBRE-SE: responda APENAS JSON válido, sem markdown.` }],
          }
        }
        const result = await ai.generateContent({ contents: geminiMessages })
        content = result.response?.text() || ""
        if (content) { geminiSuccess = true; break }
      } catch (gemErr: any) {
        console.warn(`Gemini ${modelName} falhou:`, gemErr.message)
      }
    }
    if (!geminiSuccess) {
      return NextResponse.json({ type: "erro", mensagem: `Groq esgotou (429) e Gemini também falhou sem resposta. Tente de novo em 1 minuto.` })
    }
    usadoGemini = true
  }

  const parsed = extrairJson(content)
  if (parsed) {
    return NextResponse.json({
      ...parsed,
      mensagem: parsed.mensagem || (parsed.type === "executar" ? "Pronto!" : "Como posso ajudar?"),
    })
  }

  return NextResponse.json({ type: "pergunta", mensagem: "Não consegui processar. Pode reformular de outro jeito?" })
}

function extrairJson(texto: string): any {
  const trimado = texto.trim()
  try { return JSON.parse(trimado) } catch {}

  const mdMatch = trimado.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (mdMatch) {
    try { return JSON.parse(mdMatch[1].trim()) } catch {}
  }

  const start = trimado.indexOf('{')
  if (start === -1) return null

  let depth = 0, inStr = false, escaped = false
  for (let i = start; i < trimado.length; i++) {
    const ch = trimado[i]
    if (escaped) { escaped = false; continue }
    if (ch === '\\' && inStr) { escaped = true; continue }
    if (ch === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (ch === '{') depth++
    if (ch === '}') depth--
    if (depth === 0) {
      try { return JSON.parse(trimado.substring(start, i + 1)) } catch { return null }
    }
  }
  return null
}
