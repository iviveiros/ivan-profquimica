"use client"

import { supabase } from "@/lib/supabase"
import { safeQuery, safeSingle } from "./supabase"

export type EscolaBasica = { id: string; nome: string }

export async function getEscolas(): Promise<EscolaBasica[]> {
  return safeQuery<EscolaBasica>(() => supabase.from("escolas").select("id, nome"))
}

export async function getEscolaNome(id: string): Promise<string | null> {
  const data = await safeSingle<{ nome: string }>(() => supabase.from("escolas").select("nome").eq("id", id).single())
  return data?.nome || null
}
