"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const h = (inicio: string, fim: string, materia: string, turma: string) => ({ inicio, fim, materia, turma })

const GRADE = {
  segunda: [
    h("07:10","08:00","Química 1","1ª Série A"),h("07:10","08:00","Ed. Fisica","1ª Série B"),
    h("07:10","08:00","Matemática 1","2ª Série A"),h("07:10","08:00","Língua Inglesa","2ª Série B"),
    h("07:10","08:00","Geografia","3ª Série A"),h("07:10","08:00","LP","3ª Série B"),
    h("08:00","08:50","Ed. Fisica","1ª Série A"),h("08:00","08:50","Química 1","1ª Série B"),
    h("08:00","08:50","Geografia","2ª Série A"),h("08:00","08:50","Matemática 1","2ª Série B"),
    h("08:00","08:50","LP","3ª Série A"),h("08:00","08:50","Língua Inglesa","3ª Série B"),
    h("09:00","09:50","Língua Inglesa","1ª Série A"),h("09:00","09:50","Geografia","1ª Série B"),
    h("09:00","09:50","Química 2","2ª Série A"),h("09:00","09:50","LP","2ª Série B"),
    h("09:00","09:50","Química 1","3ª Série A"),h("09:00","09:50","Matemática 1","3ª Série B"),
    h("09:50","10:40","Geografia","1ª Série A"),h("09:50","10:40","Língua Inglesa","1ª Série B"),
    h("09:50","10:40","LP","2ª Série A"),h("09:50","10:40","Química 2","2ª Série B"),
    h("09:50","10:40","Matemática 1","3ª Série A"),h("09:50","10:40","Química 1","3ª Série B"),
    h("10:50","11:40","Matemática 1","1ª Série A"),h("10:50","11:40","LP","1ª Série B"),
    h("10:50","11:40","Língua Inglesa","2ª Série A"),h("10:50","11:40","Química 1","2ª Série B"),
    h("10:50","11:40","Química 2","3ª Série A"),h("10:50","11:40","Geografia","3ª Série B"),
    h("11:40","12:30","LP","1ª Série A"),h("11:40","12:30","Matemática 1","1ª Série B"),
    h("11:40","12:30","Química 1","2ª Série A"),h("11:40","12:30","Geografia","2ª Série B"),
    h("11:40","12:30","Língua Inglesa","3ª Série A"),h("11:40","12:30","Química 2","3ª Série B"),
    h("12:30","13:20","Matemática 1","3ª Série A"),h("12:30","13:20","LP","3ª Série B"),
  ],
  terca: [
    h("07:10","08:00","Biologia","1ª Série A"),h("07:10","08:00","Geografia","1ª Série B"),
    h("07:10","08:00","Matemática","2ª Série A"),h("07:10","08:00","Filosofia","2ª Série B"),
    h("07:10","08:00","LP","3ª Série A"),h("07:10","08:00","Química 2","3ª Série B"),
    h("08:00","08:50","Filosofia","1ª Série A"),h("08:00","08:50","Biologia","1ª Série B"),
    h("08:00","08:50","Geografia","2ª Série A"),h("08:00","08:50","LP","2ª Série B"),
    h("08:00","08:50","Matemática","3ª Série A"),h("08:00","08:50","Geografia","3ª Série B"),
    h("09:00","09:50","Química 2","1ª Série A"),h("09:00","09:50","Filosofia","1ª Série B"),
    h("09:00","09:50","Biologia","2ª Série A"),h("09:00","09:50","Matemática","2ª Série B"),
    h("09:00","09:50","Geografia","3ª Série A"),h("09:00","09:50","LP","3ª Série B"),
    h("09:50","10:40","Geografia","1ª Série A"),h("09:50","10:40","Matemática","1ª Série B"),
    h("09:50","10:40","Língua Inglesa","2ª Série A"),h("09:50","10:40","Biologia","2ª Série B"),
    h("09:50","10:40","Química 2","3ª Série A"),h("09:50","10:40","Filosofia","3ª Série B"),
    h("10:50","11:40","Matemática","1ª Série A"),h("10:50","11:40","LP","1ª Série B"),
    h("10:50","11:40","História","2ª Série A"),h("10:50","11:40","Geografia","2ª Série B"),
    h("10:50","11:40","Filosofia","3ª Série A"),h("10:50","11:40","Biologia","3ª Série B"),
    h("11:40","12:30","Arte","1ª Série A"),h("11:40","12:30","Química 2","1ª Série B"),
    h("11:40","12:30","LP","2ª Série A"),h("11:40","12:30","História","2ª Série B"),
    h("11:40","12:30","Biologia","3ª Série A"),h("11:40","12:30","Matemática","3ª Série B"),
    h("12:30","13:20","LP","3ª Série A"),h("12:30","13:20","Matemática 1","3ª Série B"),
  ],
  quarta: [
    h("07:10","08:00","Física","1ª Série A"),h("07:10","08:00","LP","1ª Série B"),
    h("07:10","08:00","Sociologia","2ª Série A"),h("07:10","08:00","Língua Inglesa","2ª Série B"),
    h("07:10","08:00","Física","3ª Série A"),h("07:10","08:00","Biologia","3ª Série B"),
    h("08:00","08:50","Língua Inglesa","1ª Série A"),h("08:00","08:50","Física","1ª Série B"),
    h("08:00","08:50","História","2ª Série A"),h("08:00","08:50","Sociologia","2ª Série B"),
    h("08:00","08:50","Biologia","3ª Série A"),h("08:00","08:50","Física","3ª Série B"),
    h("09:00","09:50","LP","1ª Série A"),h("09:00","09:50","Matemática 1","1ª Série B"),
    h("09:00","09:50","LP","2ª Série A"),h("09:00","09:50","História","2ª Série B"),
    h("09:00","09:50","Física","3ª Série A"),h("09:00","09:50","Biologia","3ª Série B"),
    h("09:50","10:40","Matemática 1","1ª Série A"),h("09:50","10:40","Língua Inglesa","1ª Série B"),
    h("09:50","10:40","História","2ª Série A"),h("09:50","10:40","LP","2ª Série B"),
    h("09:50","10:40","Biologia","3ª Série A"),h("09:50","10:40","Física","3ª Série B"),
    h("10:50","11:40","Biologia","1ª Série A"),h("10:50","11:40","História","1ª Série B"),
    h("10:50","11:40","Física","2ª Série A"),h("10:50","11:40","Biologia","2ª Série B"),
    h("10:50","11:40","História","3ª Série A"),h("10:50","11:40","LP","3ª Série B"),
    h("11:40","12:30","LP","1ª Série A"),h("11:40","12:30","Biologia","1ª Série B"),
    h("11:40","12:30","Biologia","2ª Série A"),h("11:40","12:30","Física","2ª Série B"),
    h("11:40","12:30","LP","3ª Série A"),h("11:40","12:30","História","3ª Série B"),
    h("12:30","13:20","Biologia","1ª Série A"),
    h("13:00","13:40","Física","2ª Série A"),h("13:00","13:40","Biologia","2ª Série B"),
    h("13:00","13:40","Física","3ª Série A"),h("13:00","13:40","LP","3ª Série B"),
    h("13:40","14:20","Biologia","1ª Série A"),h("13:40","14:20","Física","1ª Série B"),
    h("13:40","14:20","LP","3ª Série A"),
  ],
  quinta: [
    h("07:10","08:00","Física","1ª Série A"),h("07:10","08:00","Sociologia","1ª Série B"),
    h("07:10","08:00","Matemática 1","2ª Série A"),h("07:10","08:00","Física","2ª Série B"),
    h("07:10","08:00","Biologia","3ª Série A"),h("07:10","08:00","LP","3ª Série B"),
    h("08:00","08:50","Biologia","1ª Série A"),h("08:00","08:50","Física","1ª Série B"),
    h("08:00","08:50","Física","2ª Série A"),h("08:00","08:50","Matemática 1","2ª Série B"),
    h("08:00","08:50","LP","3ª Série A"),h("08:00","08:50","Sociologia","3ª Série B"),
    h("09:00","09:50","Sociologia","1ª Série A"),h("09:00","09:50","Arte","1ª Série B"),
    h("09:00","09:50","Física","2ª Série A"),h("09:00","09:50","Biologia","2ª Série B"),
    h("09:00","09:50","Física","3ª Série A"),h("09:00","09:50","História","3ª Série B"),
    h("09:50","10:40","História","1ª Série A"),h("09:50","10:40","LP","1ª Série B"),
    h("09:50","10:40","Biologia","2ª Série A"),h("09:50","10:40","Física","2ª Série B"),
    h("09:50","10:40","Sociologia","3ª Série A"),h("09:50","10:40","Física","3ª Série B"),
    h("10:50","11:40","História","1ª Série A"),h("10:50","11:40","Física","1ª Série B"),
    h("10:50","11:40","LP","2ª Série A"),h("10:50","11:40","Ed. Fisica","2ª Série B"),
    h("10:50","11:40","Física","3ª Série A"),h("10:50","11:40","Biologia","3ª Série B"),
    h("11:40","12:30","Física","1ª Série A"),h("11:40","12:30","Biologia","1ª Série B"),
    h("11:40","12:30","Ed. Fisica","2ª Série A"),h("11:40","12:30","LP","2ª Série B"),
    h("11:40","12:30","História","3ª Série A"),h("11:40","12:30","Física","3ª Série B"),
    h("12:30","13:20","Biologia","1ª Série A"),
    h("13:00","13:40","LP","1ª Série A"),h("13:00","13:40","LP","1ª Série B"),
    h("13:00","13:40","Física","3ª Série A"),h("13:00","13:40","Física","3ª Série B"),
    h("13:40","14:20","LP","2ª Série A"),h("13:40","14:20","LP","2ª Série B"),
    h("13:40","14:20","Física","3ª Série A"),
  ],
  sexta: [
    h("07:10","08:00","LP","1ª Série A"),h("07:10","08:00","LP","1ª Série B"),
    h("07:10","08:00","Geografia","2ª Série A"),h("07:10","08:00","Matemática","2ª Série B"),
    h("07:10","08:00","Química 2","3ª Série A"),h("07:10","08:00","Química 1","3ª Série B"),
    h("08:00","08:50","LP","1ª Série A"),h("08:00","08:50","História","1ª Série B"),
    h("08:00","08:50","Matemática","2ª Série A"),h("08:00","08:50","Geografia","2ª Série B"),
    h("08:00","08:50","Química 1","3ª Série A"),h("08:00","08:50","Química 2","3ª Série B"),
    h("09:00","09:50","Química 1","1ª Série A"),h("09:00","09:50","Matemática","1ª Série B"),
    h("09:00","09:50","LP","2ª Série A"),h("09:00","09:50","Química 2","2ª Série B"),
    h("09:00","09:50","Matemática 1","3ª Série A"),h("09:00","09:50","Geografia","3ª Série B"),
    h("09:50","10:40","Matemática","1ª Série A"),h("09:50","10:40","Química 1","1ª Série B"),
    h("09:50","10:40","Química 2","2ª Série A"),h("09:50","10:40","LP","2ª Série B"),
    h("09:50","10:40","História","3ª Série A"),h("09:50","10:40","Matemática 1","3ª Série B"),
    h("10:50","11:40","Matemática 1","1ª Série A"),h("10:50","11:40","Química 2","1ª Série B"),
    h("10:50","11:40","Filosofia","2ª Série A"),h("10:50","11:40","Química 1","2ª Série B"),
    h("10:50","11:40","Matemática","3ª Série A"),h("10:50","11:40","História","3ª Série B"),
    h("11:40","12:30","Química 2","1ª Série A"),h("11:40","12:30","Matemática 1","1ª Série B"),
    h("11:40","12:30","Química 1","2ª Série A"),h("11:40","12:30","História","2ª Série B"),
    h("11:40","12:30","Geografia","3ª Série A"),h("11:40","12:30","Matemática","3ª Série B"),
  ],
}

export default function AtualizarHorario() {
  const [status, setStatus] = useState("Preparando...")
  const [erro, setErro] = useState("")
  const [escolaId, setEscolaId] = useState("")

  useEffect(() => {
    ;(async () => {
      try {
        setStatus("Buscando escola OBJETIVO...")
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const res = await fetch(`${url}/rest/v1/escolas?select=id,nome`, {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
        })
        if (!res.ok) { setErro(`HTTP ${res.status}: ${await res.text().catch(() => "sem resposta")}`); return }
        const todas = await res.json()
        const escolas = (todas || []).filter((e: any) => e.nome.toUpperCase().includes("OBJETIVO"))
        if (!escolas.length) { setErro(`Escola OBJETIVO não encontrada. Escolas: ${(todas||[]).map((e:any)=>e.nome).join(", ")}`); return }
        const id = escolas[0].id
        setEscolaId(id)
        setStatus(`Escola encontrada: ${escolas[0].nome}`)
      } catch (e: any) { setErro(`Erro: ${e.message}`) }
    })()
  }, [])

  async function atualizar() {
    if (!escolaId) return
    setStatus("Atualizando grade...")
    setErro("")
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const res = await fetch(`${url}/rest/v1/escolas?id=eq.${escolaId}`, {
        method: "PATCH",
        headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ grade: GRADE }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const total = Object.values(GRADE).flat().length
      setStatus(`✅ Grade atualizada com ${total} horários! Verifique a aba Horários.`)
    } catch (e: any) { setErro(e.message); setStatus("❌ Erro") }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 p-8">
      <div className="card w-full max-w-md p-8 text-center animate-fade-in">
        <h1 className="text-2xl font-extrabold text-zinc-900">📅 Atualizar Horário</h1>
        <p className="mt-2 text-sm text-zinc-500">OBJETIVO — Ensino Médio 2026</p>

        {erro && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</div>}

        <div className="mt-6 text-sm text-zinc-600">{status}</div>

        {escolaId && !status.includes("✅") && (
          <button onClick={atualizar} className="btn btn-primary mt-4 w-full">
            🔄 Atualizar Grade
          </button>
        )}

        {status.includes("✅") && (
          <a href="/horarios" className="btn btn-secondary mt-4 inline-block">
            Ver Horários
          </a>
        )}
      </div>
    </div>
  )
}
