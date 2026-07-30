"use client"

import { supabase } from "@/lib/supabase"
import { safeQuery, safeMutate, safeSingle } from "./supabase"

export type AulaResumo = { id: string; topico: string; created_at: string }

export type AulaCompleta = {
  id: string; topico: string; created_at: string
  resumo_md: string; exercicios_md: string; avaliacao_md: string
  sistemas_ensino?: { nome: string }
  turmas?: { nome: string; ano: string }
}

export async function getAula(id: string): Promise<AulaCompleta | null> {
  return safeSingle<AulaCompleta>(() =>
    supabase
      .from("aulas")
      .select("*, turmas(nome, ano), sistemas_ensino(nome)")
      .eq("id", id)
      .single()
  )
}

export async function atualizarAula(id: string, dados: { resumo_md?: string; exercicios_md?: string; avaliacao_md?: string; topico?: string }) {
  return safeMutate(() =>
    supabase.from("aulas").update(dados).eq("id", id).select()
  )
}

export async function removerAula(id: string) {
  return safeMutate(() =>
    supabase.from("aulas").delete().eq("id", id)
  )
}

export async function getAulasCount(): Promise<number> {
  const { count, error } = await supabase.from("aulas").select("*", { count: "exact", head: true })
  if (error) throw error
  return count || 0
}

export async function getUltimasAulas(limit = 5): Promise<AulaResumo[]> {
  return safeQuery<AulaResumo>(() =>
    supabase.from("aulas").select("id, topico, created_at").order("created_at", { ascending: false }).limit(limit)
  )
}
