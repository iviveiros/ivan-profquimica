"use client"

import { supabase } from "@/lib/supabase"
import { safeQuery, safeMutate } from "./supabase"

export type AlunoBasico = { id: string; nome: string; turma_nome: string; escola_id?: string; observacoes?: string | null }

export async function getAlunos(escolaId: string): Promise<AlunoBasico[]> {
  return safeQuery<AlunoBasico>(() =>
    supabase.from("alunos").select("*").eq("escola_id", escolaId).order("nome")
  )
}

export async function getAlunosDaTurma(escolaId: string, turma: string): Promise<AlunoBasico[]> {
  if (!turma) return getAlunos(escolaId)
  return safeQuery<AlunoBasico>(() =>
    supabase.from("alunos").select("*").eq("escola_id", escolaId).eq("turma_nome", turma).order("nome")
  )
}

export async function getAlunosCount(escolaId: string): Promise<number> {
  const data = await safeQuery<{ id: string }>(() =>
    supabase.from("alunos").select("id").eq("escola_id", escolaId)
  )
  return data.length
}

export async function getAluno(id: string): Promise<AlunoBasico | null> {
  const data = await safeQuery<AlunoBasico>(() =>
    supabase.from("alunos").select("*").eq("id", id).limit(1)
  )
  return data[0] || null
}

export async function criarAluno(dados: { nome: string; turma_nome: string; escola_id: string; observacoes?: string }): Promise<void> {
  await safeMutate(() => supabase.from("alunos").insert(dados))
}

export async function atualizarAluno(id: string, dados: { nome: string; turma_nome: string; observacoes?: string }): Promise<void> {
  await safeMutate(() => supabase.from("alunos").update(dados).eq("id", id))
}

export async function removerAluno(id: string): Promise<void> {
  await safeMutate(() => supabase.from("alunos").delete().eq("id", id))
}

export async function removerAlunoCompleto(id: string): Promise<void> {
  await safeMutate(() => supabase.from("notas").delete().eq("aluno_id", id))
  await safeMutate(() => supabase.from("faltas").delete().eq("aluno_id", id))
  await safeMutate(() => supabase.from("alunos").delete().eq("id", id))
}

export async function importarAlunos(dados: { nome: string; turma_nome: string; escola_id: string }[]): Promise<void> {
  await safeMutate(() => supabase.from("alunos").insert(dados))
}
