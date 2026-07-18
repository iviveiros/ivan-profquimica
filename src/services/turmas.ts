"use client"

import { supabase } from "@/lib/supabase"
import { safeQuery } from "./supabase"

export type TurmaDaEscola = { id: string; nome: string; ano: string }

export async function getTurmasDaEscola(escolaId: string): Promise<TurmaDaEscola[]> {
  return safeQuery<TurmaDaEscola>(() =>
    supabase.from("turmas_professor").select("id, nome, ano").eq("escola_id", escolaId).order("nome")
  )
}
