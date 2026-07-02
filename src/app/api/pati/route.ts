import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const MODEL = "llama-3.3-70b-versatile"

export async function POST(req: NextRequest) {
  const { mensagem, historico, alunos, escola, acoesPendentes } = await req.json()
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
  const hoje = new Date().toISOString().split("T")[0]

  const systemPrompt = `Você é a Pati, assistente do Prof. Ivan no sistema ProfQuímica.

CONTEXTO ATUAL:
- Escola ativa: ${escola?.nome || "N/A"}
- Data de hoje: ${hoje}
- Alunos cadastrados:
${alunosList || "Nenhum aluno cadastrado."}

ESCOLHA DO type:
- "pergunta" → precisa de MAIS INFORMAÇÕES. NÃO inclua acao/acoes.
- "confirmacao" → tem TODOS os dados. Inclua acao (1 ação) ou acoes (várias ações).
- "executar" → usuário confirmou. Inclua acao ou acoes.
- "cancelado" → usuário desistiu.

REGRAS:
1. Se nome incompleto → "pergunta", peça nome completo E turma.
2. NOTAS: precisa nome, turma, valor, descricao, bimestre.
3. FALTAS: precisa nome, turma, data. Se omitida, use ${hoje}.
4. Quando tiver TODOS os dados → "confirmacao" com resumo + acao/acoes.
5. Usuário confirmar ("sim", "confirma") → "executar" com mesma acao/acoes.
6. O usuário pode PEDIR VÁRIAS AÇÕES numa frase. Detecte todas e use "acoes" (array).

FORMATO DE CADA AÇÃO individual:
LANÇAR NOTA: {"tipo":"lancar_nota","aluno_id":"uuid","aluno_nome":"NOME","turma":"TURMA","disciplina":"Química","valor":"7.5","descricao":"Prova","bimestre":2}
MARCAR FALTA: {"tipo":"marcar_falta","alunos":[{"id":"uuid","nome":"NOME"}],"data":"${hoje}"}
MARCAR PRESENÇA: {"tipo":"marcar_presenca","alunos":[{"id":"uuid","nome":"NOME"}],"data":"${hoje}"}

IMPORTANTE: Use o ALUNO_ID real da lista. Para várias ações, use {"type":"confirmacao","mensagem":"resumo","acoes":[...]}.
Cancelar: {"type":"cancelado","mensagem":"Ok, cancelei."}
Erro: {"type":"erro","mensagem":"explique o erro"}`

  const messages = [
    { role: "system", content: systemPrompt },
    ...(historico || []).map((m: any) => ({ role: m.role, content: m.content })),
    { role: "user", content: mensagem },
  ]

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.1, max_tokens: 1500 }),
    })

    if (!res.ok) {
      throw new Error(`Groq error: ${res.status}`)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ""

    const parsed = extrairJson(content)
    if (parsed) {
      return NextResponse.json({
        ...parsed,
        mensagem: parsed.mensagem || (parsed.type === "executar" ? "Pronto!" : "Como posso ajudar?"),
      })
    }

    return NextResponse.json({ type: "pergunta", mensagem: "Não consegui processar. Pode reformular de outro jeito?" })
  } catch (err: any) {
    return NextResponse.json({ type: "erro", mensagem: `Erro: ${err.message}` })
  }
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
