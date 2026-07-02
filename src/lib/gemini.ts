import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY

let genAI: GoogleGenerativeAI | null = null

export function getGemini() {
  if (!apiKey) return null
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey)
  return genAI
}

export function getGeminiModel(model = "gemini-2.5-flash") {
  const ai = getGemini()
  if (!ai) return null
  return ai.getGenerativeModel({ model })
}
