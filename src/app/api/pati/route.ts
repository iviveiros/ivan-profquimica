import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const MODEL = "llama-3.3-70b-versatile"

export async function POST(req: NextRequest) {
  const { mensagem, historico, alunos, escola } = await req.json()
  if (!mensagem?.trim()) {
    return NextResponse.json({ type: "pergunta", mensagem: "Diga algo!" })
  }

  const alunosList = (alunos || []).map((a: any) => `- ${a.nome} (id:${a.id}) | ${a.turma_nome}`).join("\n")
  const hoje = new Date().toISOString().split("T")[0]

  const systemPrompt = `Você é a Pati, assistente do Prof. Ivan no sistema ProfQuímica.

CONTEXTO ATUAL:
- Escola ativa: ${escola?.nome || "N/A"}
- Data de hoje: ${hoje}
- Alunos cadastrados:
${alunosList || "Nenhum aluno cadastrado."}

REGRAS:
1. Se o nome do aluno estiver incompleto, PEÇA nome completo E turma.
2. Para NOTAS: precisa de nome completo, turma, valor numérico (0-10), descrição (tipo: Prova, Trabalho, Participação), bimestre (1-4).
3. Para FALTAS: precisa de nome completo, turma, data. Se data omitida, use ${hoje}.
4. Antes de executar ações, SEMPRE peça confirmação com resumo.

Responda SOMENTE com JSON, sem texto extra:
{
  "type": "pergunta" | "confirmacao" | "executar" | "cancelado" | "erro",
  "mensagem": "texto amigável em português para o usuário",
  "acao": { ... } // obrigatório em confirmacao e executar
}

FORMATO DAS AÇÕES:
LANÇAR NOTA:
{"tipo": "lancar_nota", "aluno_id": "uuid", "aluno_nome": "NOME COMPLETO", "turma": "TURMA", "disciplina": "Química", "valor": "7.5", "descricao": "Prova bimestral", "bimestre": 2}

MARCAR FALTA:
{"tipo": "marcar_falta", "alunos": [{"id": "uuid", "nome": "NOME COMPLETO"}], "data": "${hoje}"}

MARCAR PRESENÇA:
{"tipo": "marcar_presenca", "alunos": [{"id": "uuid", "nome": "NOME COMPLETO"}], "data": "${hoje}"}

Cancelar: {"type": "cancelado", "mensagem": "Ok, cancelei."}
Erro: {"type": "erro", "mensagem": "explique o erro"}

IMPORTANTE: Use o ALUNO_ID do aluno correto da lista. A lista acima tem "nome | turma" com os IDs no contexto, mas você precisa casar o nome digitado com um da lista. Se não achar correspondência exata, peça mais detalhes.`

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
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.1, max_tokens: 800 }),
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

    return NextResponse.json({ type: "pergunta", mensagem: "Não entendi. Pode reformular?" })
  } catch (err: any) {
    return NextResponse.json({ type: "erro", mensagem: `Erro: ${err.message}` })
  }
}

function extrairJson(texto: string): any {
  try {
    return JSON.parse(texto)
  } catch {}
  const match = texto.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
  if (match) {
    try { return JSON.parse(match[1]) } catch {}
  }
  const match2 = texto.match(/\{[\s\S]*?"type"[\s\S]*?"mensagem"[\s\S]*?\}/)
  if (match2) {
    try { return JSON.parse(match2[0]) } catch {}
  }
  return null
}
