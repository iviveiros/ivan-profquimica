"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function Dashboard() {
  const [stats, setStats] = useState({ aulas: 0, escolas: 0, alunos: 0 })
  const [ultimasAulas, setUltimasAulas] = useState<any[]>([])
  const [proximas, setProximas] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const { count: aulas } = await supabase.from("aulas").select("id", { count: "exact", head: true })
      const { data: escData } = await supabase.from("escolas").select("id")
      const { data: aluData } = await supabase.from("alunos").select("id")
      setStats({ aulas: aulas || 0, escolas: escData?.length || 0, alunos: aluData?.length || 0 })

      const { data: recentes } = await supabase.from("aulas").select("topico, created_at").order("created_at", { ascending: false }).limit(5)
      if (recentes) setUltimasAulas(recentes)

      // Próximas aulas baseadas no horário de quinta/sexta
      const dias = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
      const hoje = new Date().getDay()
      const diaSemana = dias[hoje]
      const gradeCache = localStorage.getItem("ivan-app-data")
      if (gradeCache) {
        try {
          const data = JSON.parse(gradeCache)
          const escolaAtiva = data.escolas.find((e: any) => e.id === data.escolaAtiva)
          if (escolaAtiva?.grade?.[diaSemana]) {
            const aulasHoje = escolaAtiva.grade[diaSemana].filter((a: any) => a !== null)
            setProximas(aulasHoje.map((a: any) => `${a.inicio}-${a.fim} ${a.materia} ${a.turma}`))
          }
        } catch {}
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Visão geral do seu sistema</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/criar-aula" className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Aulas Geradas</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.aulas}</p>
          <p className="mt-1 text-xs text-zinc-400">+ Criar nova aula →</p>
        </Link>

        <Link href="/horarios" className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Escolas</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.escolas}</p>
          <p className="mt-1 text-xs text-zinc-400">Gerenciar horários →</p>
        </Link>

        <Link href="/alunos" className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Alunos</p>
          <p className="mt-2 text-3xl font-bold text-violet-600">{stats.alunos}</p>
          <p className="mt-1 text-xs text-zinc-400">Cadastrar alunos →</p>
        </Link>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Próximas Aulas</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{proximas.length}</p>
          <p className="mt-1 text-xs text-zinc-400">{proximas.slice(0, 2).join(" · ") || "Nenhuma hoje"}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">📄 Últimas Aulas</h2>
          {ultimasAulas.length === 0 ? (
            <p className="text-sm text-zinc-400">Nenhuma aula gerada ainda.</p>
          ) : (
            <ul className="divide-y text-sm">
              {ultimasAulas.map((a, i) => (
                <li key={i} className="py-2 flex justify-between">
                  <span className="text-zinc-700">{a.topico}</span>
                  <span className="text-zinc-400">{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">⚡ Acesso Rápido</h2>
          <div className="space-y-2">
            <Link href="/criar-aula" className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-emerald-50 transition-colors">
              <span className="text-lg">🔬</span>
              <span className="font-medium text-zinc-700">Gerar nova aula</span>
            </Link>
            <Link href="/horarios" className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-emerald-50 transition-colors">
              <span className="text-lg">📅</span>
              <span className="font-medium text-zinc-700">Ver/editar horários</span>
            </Link>
            <Link href="/alunos" className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-emerald-50 transition-colors">
              <span className="text-lg">👨‍🎓</span>
              <span className="font-medium text-zinc-700">Gerenciar alunos</span>
            </Link>
            <Link href="/faltas" className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-emerald-50 transition-colors">
              <span className="text-lg">📋</span>
              <span className="font-medium text-zinc-700">Fazer chamada / faltas</span>
            </Link>
            <Link href="/notas" className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-emerald-50 transition-colors">
              <span className="text-lg">📊</span>
              <span className="font-medium text-zinc-700">Lançar notas</span>
            </Link>
            <button onClick={() => window.print()} className="flex items-center gap-3 rounded-lg border p-3 text-sm hover:bg-emerald-50 transition-colors w-full text-left">
              <span className="text-lg">🖨️</span>
              <span className="font-medium text-zinc-700">Exportar relatório completo em PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
