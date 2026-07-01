import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import AulaClient from "./client"

async function getAula(id: string) {
  const { data } = await supabase
    .from("aulas")
    .select("*, turmas(nome, ano), sistemas_ensino(nome)")
    .eq("id", id)
    .single()
  return data
}

export default async function AulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const aula = await getAula(id)

  if (!aula) notFound()

  return <AulaClient aula={aula} />
}
