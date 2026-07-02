"use client"

import { supabase } from "@/lib/supabase"
import { safeQuery, safeMutate } from "./supabase"

export type NotaRegistro = {
  id?: string
  aluno_id: string
  disciplina: string
  valor: string
  descricao: string
  bimestre: number
}

export async function getNotas(alunoIds: string[], disciplina: string, bimestre: number): Promise<NotaRegistro[]> {
  if (!alunoIds.length) return []
  return safeQuery<NotaRegistro>(() =>
    supabase.from("notas").select("*").in("aluno_id", alunoIds).eq("disciplina", disciplina).eq("bimestre", bimestre)
  )
}

export async function getNotasDoAluno(alunoId: string): Promise<NotaRegistro[]> {
  return safeQuery<NotaRegistro>(() =>
    supabase.from("notas").select("*").eq("aluno_id", alunoId).order("bimestre").order("disciplina")
  )
}

export async function salvarNota(dados: { aluno_id: string; disciplina: string; valor: string; descricao: string; bimestre: number }): Promise<void> {
  await safeMutate(() => supabase.from("notas").delete().eq("aluno_id", dados.aluno_id).eq("disciplina", dados.disciplina).eq("bimestre", dados.bimestre))
  await safeMutate(() => supabase.from("notas").insert(dados))
}
