"use client"

import { supabase } from "@/lib/supabase"
import { safeQuery, safeMutate } from "./supabase"

export type Aula = { inicio: string; fim: string; materia: string; turma: string }
export type DiaSemana = "segunda" | "terca" | "quarta" | "quinta" | "sexta"
export type Grade = Record<DiaSemana, (Aula | null)[]>

export type EscolaComGrade = {
  id: string
  nome: string
  grade: Grade
}

const DIAS_PT: DiaSemana[] = ["segunda", "terca", "quarta", "quinta", "sexta"]

export async function getEscolasComGrade(): Promise<EscolaComGrade[]> {
  const data = await safeQuery<any>(() =>
    supabase.from("escolas").select("id, nome, grade").order("nome")
  )
  return data.map(e => ({
    id: e.id,
    nome: e.nome,
    grade: (typeof e.grade === "string" ? JSON.parse(e.grade) : e.grade) as Grade,
  }))
}

export async function getGrade(escolaId: string): Promise<Grade | null> {
  const data = await safeQuery<any>(() =>
    supabase.from("escolas").select("grade").eq("id", escolaId).limit(1)
  )
  if (!data.length) return null
  const grade = typeof data[0].grade === "string" ? JSON.parse(data[0].grade) : data[0].grade
  return grade as Grade
}

export async function salvarGrade(escolaId: string, grade: Grade): Promise<void> {
  await safeMutate(() =>
    supabase.from("escolas").update({ grade: JSON.stringify(grade) }).eq("id", escolaId)
  )
}

export async function criarEscola(nome: string): Promise<EscolaComGrade> {
  const gradeVazia: Grade = {
    segunda: Array(7).fill(null),
    terca: Array(7).fill(null),
    quarta: Array(7).fill(null),
    quinta: Array(7).fill(null),
    sexta: Array(7).fill(null),
  }
  const { data, error } = await supabase
    .from("escolas")
    .insert({ nome, grade: JSON.stringify(gradeVazia) })
    .select("id, nome, grade")
    .single()
  if (error) throw error
  return { id: data.id, nome: data.nome, grade: gradeVazia }
}

export async function removerEscola(id: string): Promise<void> {
  await safeMutate(() => supabase.from("escolas").delete().eq("id", id))
}

export async function getProximasAulas(): Promise<string[]> {
  try {
    const escolas = await getEscolasComGrade()
    if (!escolas.length) return []

    const diaIdx = new Date().getDay() - 1
    if (diaIdx < 0 || diaIdx > 4) return []
    const diaSemana = DIAS_PT[diaIdx]

    const result: string[] = []
    for (const escola of escolas) {
      if (!escola.grade?.[diaSemana]) continue
      const aulasHoje = escola.grade[diaSemana].filter((a): a is Aula => a !== null)
      for (const a of aulasHoje) {
        result.push(`${a.inicio}-${a.fim} ${a.materia} ${a.turma} (${escola.nome})`)
      }
    }
    return result
  } catch {
    return []
  }
}
