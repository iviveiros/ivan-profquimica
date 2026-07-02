"use client"

import { supabase } from "@/lib/supabase"
import { safeQuery, safeMutate } from "./supabase"

export type FaltaRegistro = { aluno_id: string; data: string; presente: boolean }
export type FaltaHistorico = { data: string; presente: boolean }

export async function getFaltas(alunoIds: string[], data: string): Promise<FaltaRegistro[]> {
  if (!alunoIds.length) return []
  return safeQuery<FaltaRegistro>(() =>
    supabase.from("faltas").select("aluno_id, presente").in("aluno_id", alunoIds).eq("data", data)
  )
}

export async function getFaltasDoAluno(alunoId: string): Promise<FaltaHistorico[]> {
  return safeQuery<FaltaHistorico>(() =>
    supabase.from("faltas").select("data, presente").eq("aluno_id", alunoId).order("data", { ascending: false })
  )
}

export async function salvarFalta(alunoId: string, data: string, presente: boolean): Promise<void> {
  await safeMutate(() => supabase.from("faltas").delete().eq("aluno_id", alunoId).eq("data", data))
  if (!presente) {
    await safeMutate(() => supabase.from("faltas").insert({ aluno_id: alunoId, data, presente: false }))
  }
}

export async function marcarTodosPresentes(alunoIds: string[], data: string): Promise<void> {
  if (!alunoIds.length) return
  await safeMutate(() => supabase.from("faltas").delete().in("aluno_id", alunoIds).eq("data", data))
}

export async function salvarMultiplasFaltas(dados: { aluno_id: string; data: string; presente: boolean }[]): Promise<void> {
  for (const d of dados) {
    await safeMutate(() => supabase.from("faltas").delete().eq("aluno_id", d.aluno_id).eq("data", d.data))
    if (!d.presente) {
      await safeMutate(() => supabase.from("faltas").insert({ aluno_id: d.aluno_id, data: d.data, presente: false }))
    }
  }
}
