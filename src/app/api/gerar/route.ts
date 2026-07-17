import { NextRequest, NextResponse } from 'next/server'
import { getGeminiModel, rebaixarModelo } from '@/lib/gemini'

const GERAR_PROMPT = (sistema: string, turma: string, topico: string) => `
Você é um professor de Química do sistema ${sistema}.
Gere para a turma ${turma} sobre o tópico: "${topico}".

Sua resposta DEVE seguir EXATAMENTE este formato (seções separadas por "---"):

# Resumo da Aula

[texto didático com teoria, exemplos, dicas. Linguagem adequada à série.]

---

# Exercícios — Bateria de Estudo

1. [questão 1]
2. [questão 2]
...
15. [questão 15]

### Gabarito dos Exercícios
1. [resposta 1]
2. [resposta 2]
...

---

# Avaliação — 10 Questões de Múltipla Escolha

### Questão 01
[enunciado]
a) [opção]
b) [opção]
c) [opção]
d) [opção]
e) [opção]

### Questão 02
...

### Questão 10

### Gabarito da Avaliação
1. A
2. B
3. C
4. D
5. E
6. A
7. B
8. C
9. D
10. E

REGRAS DO GABARITO:
- As letras A-E acima são EXEMPLOS. Substitua cada uma pela resposta correta.
- Cada resposta é UMA letra: A, B, C, D ou E.
- NÃO deixe nenhuma linha em branco.`

async function gerarComGroq(sistema: string, turma: string, topico: string) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Você é um professor de Química experiente. Sua resposta deve seguir rigorosamente o formato solicitado pelo usuário, incluindo todas as seções e tabelas. Não omita nada.' },
        { role: 'user', content: GERAR_PROMPT(sistema, turma, topico) }
      ],
      temperature: 0.7,
      max_tokens: 8000,
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function gerarComGemini(sistema: string, turma: string, topico: string) {
  let tentativas = 0
  while (tentativas < 4) {
    const model = getGeminiModel()
    if (!model) return null
    try {
      const result = await model.generateContent([
        { text: 'Você é um professor de Química experiente. Sua resposta deve seguir rigorosamente o formato solicitado, incluindo todas as seções e tabelas. ' + GERAR_PROMPT(sistema, turma, topico) }
      ])
      return result.response.text()
    } catch {
      rebaixarModelo()
      tentativas++
    }
  }
  return null
}

function parseConteudo(content: string) {
  const sections = content.split('---').map((s: string) => s.trim()).filter(Boolean)

  let resumo = ''
  let exercicios = ''
  let avaliacao = ''

  for (const section of sections) {
    if (section.startsWith('# Resumo') || section.startsWith('# Resumo da Aula')) {
      const lines = section.split('\n')
      lines.shift()
      resumo = lines.join('\n').trim()
    } else if (section.startsWith('# Exercícios')) {
      const lines = section.split('\n')
      lines.shift()
      exercicios = lines.join('\n').trim()
    } else if (section.startsWith('# Avaliação')) {
      const lines = section.split('\n')
      lines.shift()
      avaliacao = lines.join('\n').trim()
    }
  }

  if (!resumo && !exercicios && !avaliacao) {
    resumo = content
  }

  return { resumo, exercicios, avaliacao }
}

export async function POST(request: NextRequest) {
  try {
    const { sistema, turma, topico } = await request.json()

    if (!sistema || !turma || !topico) {
      return NextResponse.json({ error: 'Campos obrigatórios: sistema, turma, topico' }, { status: 400 })
    }

    // Tenta Groq primeiro (ilimitado), depois Gemini
    let content = await gerarComGroq(sistema, turma, topico)

    if (!content) {
      content = await gerarComGemini(sistema, turma, topico)
    }

    if (!content) {
      return NextResponse.json({ error: 'Nenhuma IA configurada. Adicione GEMINI_API_KEY ou GROQ_API_KEY.' }, { status: 500 })
    }

    return NextResponse.json(parseConteudo(content))
  } catch (error: any) {
    console.error('Erro ao gerar conteúdo:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
