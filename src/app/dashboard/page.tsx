"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getEscolas } from "@/services/escolas"
import { getUltimasAulas, getAulasCount } from "@/services/aulas"
import { getProximasAulas } from "@/services/horarios"

const quickLinks = [
  { href: "/criar-aula", icon: "✦", label: "Gerar nova aula", desc: "Crie aulas completas com IA", color: "emerald" },
  { href: "/horarios", icon: "◈", label: "Gerenciar horários", desc: "Grade semanal de aulas", color: "blue" },
  { href: "/alunos", icon: "◆", label: "Cadastro de alunos", desc: "Importe e gerencie alunos", color: "violet" },
  { href: "/faltas", icon: "◇", label: "Chamada diária", desc: "Registre presenças e faltas", color: "amber" },
  { href: "/notas", icon: "○", label: "Lançar notas", desc: "Boletim por bimestre", color: "rose" },
]

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [ultimasAulas, setUltimasAulas] = useState<any[]>([])
  const [proximas, setProximas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [aulasCount, escolas, aulasRecentes] = await Promise.all([
          getAulasCount(),
          getEscolas(),
          getUltimasAulas(5),
        ])
        setStats({
          aulas: aulasCount,
          escolas: escolas.length,
          alunos: 0,
        })
        setUltimasAulas(aulasRecentes)

        const alunosCounts = await Promise.all(escolas.map(e => import("@/services/alunos").then(m => m.getAlunosCount(e.id))))
        const totalAlunos = alunosCounts.reduce((a, b) => a + b, 0)
        setStats(prev => ({ ...prev, alunos: totalAlunos }))

        const proximas = await getProximasAulas()
        setProximas(proximas)
      } catch (err: any) {
        console.error("Erro ao carregar dashboard:", err)
      }
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { href: "/criar-aula", label: "Aulas Geradas", value: stats.aulas, color: "emerald", badge: "+nova", desc: "Com IA", textColor: "text-emerald-700", labelColor: "text-emerald-800", descColor: "text-emerald-600/70" },
    { href: "/horarios", label: "Escolas", value: stats.escolas, color: "blue", badge: String(stats.escolas), desc: "Gerenciar", textColor: "text-blue-700", labelColor: "text-blue-800", descColor: "text-blue-600/70" },
    { href: "/alunos", label: "Alunos", value: stats.alunos, color: "violet", badge: String(stats.alunos), desc: "Importar", textColor: "text-violet-700", labelColor: "text-violet-800", descColor: "text-violet-600/70" },
    { href: null, label: "Próximas Aulas", value: proximas.length, color: "amber", badge: "hoje", desc: proximas.slice(0, 2).join(" · ") || "Nenhuma hoje", textColor: "text-amber-700", labelColor: "text-amber-800", descColor: "text-amber-600/70" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">Visão geral do seu sistema de ensino</p>
        </div>
        <Link href="/criar-aula" className="btn btn-primary glow-emerald">
          ✦ Nova Aula
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s, i) => {
          const Card = s.href ? Link : "div"
          return (
            <Card key={i} href={s.href || ""} className={`stat-card stat-card-${s.color} stagger-item`}>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{["✦", "◈", "◆", "◉"][i]}</span>
                  {!loading && <span className={`badge badge-${s.color}`}>{s.badge}</span>}
                </div>
                {loading ? (
                  <div className="mt-4 space-y-2">
                    <div className="skeleton h-9 w-20" />
                    <div className="skeleton h-4 w-24" />
                  </div>
                ) : (
                  <>
                    <p className={"mt-4 text-4xl font-black tracking-tight animate-count " + s.textColor}>{s.value}</p>
                    <p className={"mt-1 text-sm font-semibold " + s.labelColor}>{s.label}</p>
                    <p className={"mt-0.5 text-xs " + s.descColor}>{s.desc}</p>
                  </>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6 stagger-item">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">📄 Últimas Aulas</h2>
            <span className="badge badge-emerald">{loading ? <div className="skeleton h-4 w-12" /> : `${ultimasAulas.length} recentes`}</span>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-10 w-full" />)}
            </div>
          ) : ultimasAulas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-3xl mb-2 opacity-30">✦</span>
              <p className="text-sm text-zinc-400">Nenhuma aula gerada ainda.</p>
              <Link href="/criar-aula" className="btn btn-primary btn-sm mt-3 glow-emerald">
                Criar primeira aula
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {ultimasAulas.map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2.5 row-hover stagger-item">
                  <span className="text-sm font-medium text-zinc-700 truncate">{a.topico}</span>
                  <span className="text-xs text-zinc-400 shrink-0 ml-2">{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6 stagger-item">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">⚡ Acesso Rápido</h2>
            <span className="badge badge-blue">atalhos</span>
          </div>
          <div className="grid gap-2">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="group flex items-center gap-4 rounded-xl border border-zinc-200/60 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5">
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
