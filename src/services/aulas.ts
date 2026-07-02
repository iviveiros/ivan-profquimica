"use client"

import { supabase } from "@/lib/supabase"
import { safeQuery } from "./supabase"

export type AulaResumo = { id: string; topico: string; created_at: string }

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
