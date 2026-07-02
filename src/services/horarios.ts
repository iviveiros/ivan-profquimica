"use client"

import { supabase } from "@/lib/supabase"

export type Aula = { inicio: string; fim: string; materia: string; turma: string }
export type DiaSemana = "segunda" | "terca" | "quarta" | "quinta" | "sexta"
export type Grade = Record<DiaSemana, (Aula | null)[]>

const DIAS_PT: DiaSemana[] = ["segunda", "terca", "quarta", "quinta", "sexta"]

const STORAGE_KEY = "ivan-app-data"

type AppData = {
  escolas: { id: string; nome: string; grade: Grade }[]
  escolaAtiva: string
}

export function getAppData(): AppData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getProximasAulas(): string[] {
  const data = getAppData()
  if (!data) return []
  const escola = data.escolas.find(e => e.id === data.escolaAtiva)
  if (!escola?.grade) return []
  const diaIdx = new Date().getDay() - 1 // 0=segunda ... 4=sexta
  if (diaIdx < 0 || diaIdx > 4) return []
  const aulasHoje = (escola.grade[DIAS_PT[diaIdx]] || []).filter((a): a is Aula => a !== null)
  return aulasHoje.map((a: Aula) => `${a.inicio}-${a.fim} ${a.materia} ${a.turma}`)
}

export async function syncGradesToSupabase(data: AppData): Promise<void> {
  for (const escola of data.escolas) {
    if (!escola.grade) continue
    const { data: existing } = await supabase
      .from("escolas")
      .select("id, nome")
      .ilike("nome", escola.nome)
      .limit(1)
    if (existing?.length) {
      await supabase
        .from("escolas")
        .update({ grade: JSON.stringify(escola.grade) })
        .eq("id", existing[0].id)
    }
  }
}

export async function loadGradesFromSupabase(escolaNome: string): Promise<Grade | null> {
  const { data } = await supabase
    .from("escolas")
    .select("grade")
    .ilike("nome", escolaNome)
    .limit(1)
  if (!data?.length) return null
  const grade = data[0].grade
  if (typeof grade === "string") return JSON.parse(grade)
  return grade as Grade
}
