"use client"

import { supabase } from "@/lib/supabase"
import { safeQuery } from "./supabase"

export type AulaResumo = { id: string; topico: string; created_at: string }

export type AulaCompleta = {
  id: string; topico: string; created_at: string
  resumo_md: string; exercicios_md: string; avaliacao_md: string
  sistemas_ensino?: { nome: string }
  turmas?: { nome: string; ano: string }
}

export async function getAula(id: string): Promise<AulaCompleta | null> {
  const { data, error } = await supabase
    .from("aulas")
    .select("*, turmas(nome, ano), sistemas_ensino(nome)")
    .eq("id", id)
    .single()
  if (error) throw error
  return data as unknown as AulaCompleta
}

export async function atualizarAula(id: string, dados: { resumo_md?: string; exercicios_md?: string; avaliacao_md?: string; topico?: string }) {
  return safeQuery(() =>
    supabase.from("aulas").update(dados).eq("id", id)
  )
}

export async function removerAula(id: string) {
  return safeQuery(() =>
    supabase.from("aulas").delete().eq("id", id)
  )
}

export async function getAulasCount(): Promise<number> {
  const data = await safeQuery<{ id: string }>(() =>
    supabase.from("aulas").select("id", { count: "exact", head: true }) as any
  )
  // count is not returned from safeQuery for head:true, so we need special handling
  const { count, error } = await supabase.from("aulas").select("*", { count: "exact", head: true })
  if (error) throw error
  return count || 0
}

export async function getUltimasAulas(limit = 5): Promise<AulaResumo[]> {
  return safeQuery<AulaResumo>(() =>
    supabase.from("aulas").select("id, topico, created_at").order("created_at", { ascending: false }).limit(limit)
  )
}
