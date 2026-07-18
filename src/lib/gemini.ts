import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY

let genAI: GoogleGenerativeAI | null = null

export function getGemini() {
  if (!apiKey) return null
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey)
  return genAI
}

let melhorModelo: string | null = null
const MODEL_PREFERENCE = [
  "gemini-2.0-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
]

export function getGeminiModel(model?: string) {
  const ai = getGemini()
  if (!ai) return null
  const nome = model || melhorModelo || MODEL_PREFERENCE[0]
  return ai.getGenerativeModel({ model: nome })
}

export function rebaixarModelo() {
  const idx = melhorModelo
    ? MODEL_PREFERENCE.indexOf(melhorModelo)
    : 0
  melhorModelo = idx < MODEL_PREFERENCE.length - 1
    ? MODEL_PREFERENCE[idx + 1]
    : null
}
