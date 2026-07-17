import { NextRequest, NextResponse } from 'next/server'
import { getGeminiModel, rebaixarModelo } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('imagem') as File | null
    const prompt = formData.get('prompt') as string || 'Descreva o que está nesta imagem em português.'

    if (!file) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada.' }, { status: 400 })
    }

    let tentativas = 0
    while (tentativas < 4) {
      const model = getGeminiModel()
      if (!model) {
        return NextResponse.json({ error: 'Gemini não configurado.' }, { status: 500 })
      }
      try {
        const bytes = await file.arrayBuffer()
        const base64 = Buffer.from(bytes).toString('base64')
        const mimeType = file.type

        const result = await model.generateContent([
          { text: prompt },
          { inlineData: { mimeType, data: base64 } },
        ])

        return NextResponse.json({ texto: result.response.text() })
      } catch {
        rebaixarModelo()
        tentativas++
      }
    }

    return NextResponse.json({ error: 'Nenhum modelo Gemini disponível.' }, { status: 500 })
  } catch (error: any) {
    console.error('Erro ao analisar imagem:', error)
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
  }
}
