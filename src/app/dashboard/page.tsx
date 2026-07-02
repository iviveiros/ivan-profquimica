"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const quickLinks = [
  { href: "/criar-aula", icon: "✦", label: "Gerar nova aula", desc: "Crie aulas completas com IA", color: "emerald" },
  { href: "/horarios", icon: "◈", label: "Gerenciar horários", desc: "Grade semanal de aulas", color: "blue" },
  { href: "/alunos", icon: "◆", label: "Cadastro de alunos", desc: "Importe e gerencie alunos", color: "violet" },
  { href: "/faltas", icon: "◇", label: "Chamada diária", desc: "Registre presenças e faltas", color: "amber" },
  { href: "/notas", icon: "○", label: "Lançar notas", desc: "Boletim por bimestre", color: "rose" },
]

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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Visão geral do seu sistema de ensino</p>
        </div>
        <Link href="/criar-aula" className="btn btn-primary">
          ✦ Nova Aula
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/criar-aula" className="stat-card stat-card-emerald group">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-2xl">✦</span>
              <span className="badge badge-emerald">+novo</span>
            </div>
            <p className="mt-4 text-4xl font-black tracking-tight text-emerald-700">{stats.aulas}</p>
            <p className="mt-1 text-sm font-semibold text-emerald-800">Aulas Geradas</p>
            <p className="mt-0.5 text-xs text-emerald-600/70">Com IA · clique para criar</p>
          </div>
        </Link>

        <Link href="/horarios" className="stat-card stat-card-blue group">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-2xl">◈</span>
              <span className="badge badge-blue">{stats.escolas}</span>
            </div>
            <p className="mt-4 text-4xl font-black tracking-tight text-blue-700">{stats.escolas}</p>
            <p className="mt-1 text-sm font-semibold text-blue-800">Escolas</p>
            <p className="mt-0.5 text-xs text-blue-600/70">Gerenciar horários</p>
          </div>
        </Link>

        <Link href="/alunos" className="stat-card stat-card-violet group">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-2xl">◆</span>
              <span className="badge badge-violet">{stats.alunos}</span>
            </div>
            <p className="mt-4 text-4xl font-black tracking-tight text-violet-700">{stats.alunos}</p>
            <p className="mt-1 text-sm font-semibold text-violet-800">Alunos</p>
            <p className="mt-0.5 text-xs text-violet-600/70">Importar / Gerenciar</p>
          </div>
        </Link>

        <div className="stat-card stat-card-amber">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-2xl">◉</span>
              <span className="badge badge-amber">hoje</span>
            </div>
            <p className="mt-4 text-4xl font-black tracking-tight text-amber-700">{proximas.length}</p>
            <p className="mt-1 text-sm font-semibold text-amber-800">Próximas Aulas</p>
            <p className="mt-0.5 text-xs text-amber-600/70">
              {proximas.slice(0, 2).join(" · ") || "Nenhuma hoje"}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Últimas Aulas */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">📄 Últimas Aulas</h2>
            <span className="badge badge-emerald">{ultimasAulas.length} recentes</span>
          </div>
          {ultimasAulas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-3xl mb-2 opacity-30">✦</span>
              <p className="text-sm text-zinc-400">Nenhuma aula gerada ainda.</p>
              <Link href="/criar-aula" className="btn btn-primary btn-sm mt-3">
                Criar primeira aula
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {ultimasAulas.map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2.5 row-hover">
                  <span className="text-sm font-medium text-zinc-700">{a.topico}</span>
                  <span className="text-xs text-zinc-400">{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acesso Rápido */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">⚡ Acesso Rápido</h2>
            <span className="badge badge-blue">atalhos</span>
          </div>
          <div className="grid gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-4 rounded-xl border border-zinc-200/60 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 text-lg text-emerald-600 shadow-sm">
                  {link.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 group-hover:text-emerald-700 transition-colors">
                    {link.label}
                  </p>
                  <p className="text-xs text-zinc-400">{link.desc}</p>
                </div>
                <span className="text-zinc-300 group-hover:text-emerald-500 transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
