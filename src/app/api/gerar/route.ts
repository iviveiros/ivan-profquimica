import { NextRequest, NextResponse } from 'next/server'

const PROMPT_TEMPLATE = (sistema: string, turma: string, topico: string) => `
Você é um professor de Química do sistema ${sistema}.
Gere para a turma ${turma} sobre o tópico: "${topico}".

Formate EXATAMENTE como abaixo, usando MARKDOWN, com as seções separadas por "---":

# Resumo da Aula

[Texto didático com teoria, exemplos, dicas e destaques. Linguagem adequada à série.]

---

# Exercícios — Bateria de Estudo

1. [Questão 1]
2. [Questão 2]
...
15. [Questão 15]

(Variar tipos: múltipla escolha, V/F, dissertativas curtas, associação)

### Gabarito dos Exercícios

1. [Resposta 1]
2. [Resposta 2]
...

---

# Avaliação — 10 Questões de Múltipla Escolha

### Questão 01
[Enunciado]
a) [opção]
b) [opção]
c) [opção]
d) [opção]
e) [opção]

[Repetir até questão 10]

### Gabarito da Avaliação

| Questão | Resposta |
|---------|----------|
| 1 | [A-E] |
| 2 | [A-E] |
| ... | ... |
| 10 | [A-E] |
`

export async function POST(request: NextRequest) {
  try {
    const { sistema, turma, topico } = await request.json()

    if (!sistema || !turma || !topico) {
      return NextResponse.json({ error: 'Campos obrigatórios: sistema, turma, topico' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY não configurada no servidor' }, { status: 500 })
    }

    // Debug: verificar se a key está correta
    const keyPreview = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4)
    if (apiKey.includes('sk-proj')) {
      return NextResponse.json({ error: `ERRO: Está usando a chave antiga da OpenAI! Key começa com: ${keyPreview}` }, { status: 500 })
    }
    if (!apiKey.startsWith('gsk_')) {
      return NextResponse.json({ error: `ERRO: Key não começa com gsk_. Key começa com: ${keyPreview}` }, { status: 500 })
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Você é um professor de Química experiente. Gere conteúdo didático preciso e adequado à série.' },
          { role: 'user', content: PROMPT_TEMPLATE(sistema, turma, topico) }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `Groq API (${res.status}): ${errText}` }, { status: 502 })
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''

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

    return NextResponse.json({ resumo, exercicios, avaliacao })
  } catch (error: any) {
    console.error('Erro ao gerar conteúdo:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
