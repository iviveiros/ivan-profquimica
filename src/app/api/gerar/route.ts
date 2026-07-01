import { NextRequest, NextResponse } from 'next/server'

function getOpenAI() {
  const { OpenAI } = require('openai')
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

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

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um professor de Química experiente. Gere conteúdo didático preciso e adequado à série.' },
        { role: 'user', content: PROMPT_TEMPLATE(sistema, turma, topico) }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const content = completion.choices[0]?.message?.content || ''

    // Separar as seções
    const sections = content.split('---').map((s: string) => s.trim()).filter(Boolean)

    let resumo = ''
    let exercicios = ''
    let avaliacao = ''

    for (const section of sections) {
      if (section.startsWith('# Resumo') || section.startsWith('# Resumo da Aula')) {
        // Pega tudo após o título
        const lines = section.split('\n')
        lines.shift() // remove título
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

    // Fallback: se não conseguiu separar, usa o conteúdo completo
    if (!resumo && !exercicios && !avaliacao) {
      resumo = content
    }

    return NextResponse.json({ resumo, exercicios, avaliacao })
  } catch (error: any) {
    console.error('Erro ao gerar conteúdo:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
