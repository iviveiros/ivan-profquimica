"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getEscolas } from "@/services/escolas"
import { getUltimasAulas, getAulasCount, removerAula } from "@/services/aulas"
import { getProximasAulas } from "@/services/horarios"

const quickLinks = [
  { href: "/criar-aula", icon: "✦", label: "Gerar nova aula", desc: "Crie aulas completas com IA", color: "teal" },
  { href: "/horarios", icon: "◈", label: "Gerenciar horários", desc: "Grade semanal de aulas", color: "violet" },
  { href: "/alunos", icon: "◆", label: "Cadastro de alunos", desc: "Importe e gerencie alunos", color: "pink" },
  { href: "/faltas", icon: "◇", label: "Chamada diária", desc: "Registre presenças e faltas", color: "orange" },
  { href: "/notas", icon: "○", label: "Lançar notas", desc: "Boletim por bimestre", color: "teal" },
]

type AulaType = { id: string; topico: string; created_at: string }

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [ultimasAulas, setUltimasAulas] = useState<AulaType[]>([])
  const [proximas, setProximas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [aulasCount, escolas, aulasRecentes] = await Promise.all([
        getAulasCount(), getEscolas(), getUltimasAulas(5),
      ])
      setStats({ aulas: aulasCount, escolas: escolas.length, alunos: 0 })
      setUltimasAulas(aulasRecentes)
      const alunosCounts = await Promise.all(escolas.map(e => import("@/services/alunos").then(m => m.getAlunosCount(e.id))))
      setStats(prev => ({ ...prev, alunos: alunosCounts.reduce((a, b) => a + b, 0) }))
      setProximas(await getProximasAulas())
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      await removerAula(id)
      setConfirmDelete(null)
      await load()
    } catch (e: any) { console.error("Erro ao excluir aula:", e); alert(e?.message || "Erro ao excluir aula") }
    setDeleting(false)
  }

  const statCards = [
    { href: "/criar-aula", label: "Aulas Geradas", value: stats.aulas, color: "teal", badge: "+nova", desc: "Com IA", textColor: "text-teal-700", labelColor: "text-teal-800", descColor: "text-teal-600/70" },
    { href: "/horarios", label: "Escolas", value: stats.escolas, color: "violet", badge: String(stats.escolas), desc: "Gerenciar", textColor: "text-violet-700", labelColor: "text-violet-800", descColor: "text-violet-600/70" },
    { href: "/alunos", label: "Alunos", value: stats.alunos, color: "pink", badge: String(stats.alunos), desc: "Importar", textColor: "text-pink-700", labelColor: "text-pink-800", descColor: "text-pink-600/70" },
    { href: null, label: "Próximas Aulas", value: proximas.length, color: "orange", badge: "hoje", desc: proximas.slice(0, 2).join(" · ") || "Nenhuma hoje", textColor: "text-orange-700", labelColor: "text-orange-800", descColor: "text-orange-600/70" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-teal-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Visão geral do seu sistema de ensino</p>
        </div>
        <Link href="/criar-aula" className="btn btn-primary glow-teal">
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
                  <span className="text-3xl">{["✦", "◈", "◆", "◉"][i]}</span>
                  {!loading && <span className={`badge badge-${s.color}`}>{s.badge}</span>}
                </div>
                {loading ? (
                  <div className="mt-4 space-y-2">
                    <div className="skeleton h-9 w-20" /><div className="skeleton h-4 w-24" />
                  </div>
                ) : (
                  <>
                    <p className={`mt-4 text-4xl font-black tracking-tight animate-count ${s.textColor}`}>{s.value}</p>
                    <p className={`mt-1 text-sm font-semibold ${s.labelColor}`}>{s.label}</p>
                    <p className={`mt-0.5 text-xs ${s.descColor}`}>{s.desc}</p>
                  </>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Últimas Aulas */}
        <div className="card p-6 stagger-item">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">📄 Últimas Aulas</h2>
            <span className="badge badge-teal">{loading ? <div className="skeleton h-4 w-12" /> : `${ultimasAulas.length} recentes`}</span>
          </div>

          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full" />)}</div>
          ) : ultimasAulas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-4xl mb-3 opacity-30 animate-float">✦</span>
              <p className="text-sm text-zinc-400">Nenhuma aula gerada ainda.</p>
              <Link href="/criar-aula" className="btn btn-primary btn-sm mt-4 glow-teal">Criar primeira aula</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {ultimasAulas.map((a, i) => (
                <div key={a.id} className="group flex items-center gap-2 rounded-xl border border-zinc-200/60 bg-white px-4 py-3 transition-all duration-200 hover:border-teal-200 hover:shadow-md hover:-translate-y-0.5 stagger-item">
                  <Link href={`/aula/${a.id}`} className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 group-hover:text-teal-700 transition-colors truncate">{a.topico}</p>
                    <p className="text-[11px] text-zinc-400">{new Date(a.created_at).toLocaleDateString("pt-BR")}</p>
                  </Link>
                  <div className="flex gap-1.5 shrink-0">
                    <Link
                      href={`/aula/${a.id}/editar`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 hover:scale-110 hover:shadow-md transition-all duration-200"
                      title="Editar aula"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => setConfirmDelete(a.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 hover:scale-110 hover:shadow-md transition-all duration-200"
                      title="Excluir aula"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acesso Rápido */}
        <div className="card p-6 stagger-item">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">⚡ Acesso Rápido</h2>
            <span className="badge badge-violet">atalhos</span>
          </div>
          <div className="grid gap-2">
            {quickLinks.map((link) => {
              const colorMap: Record<string, string> = {
                teal: "from-teal-50 to-teal-100 text-teal-600",
                violet: "from-violet-50 to-violet-100 text-violet-600",
                pink: "from-pink-50 to-pink-100 text-pink-600",
                orange: "from-orange-50 to-orange-100 text-orange-600",
              }
              const borderMap: Record<string, string> = {
                teal: "border-teal-200 hover:border-teal-300",
                violet: "border-violet-200 hover:border-violet-300",
                pink: "border-pink-200 hover:border-pink-300",
                orange: "border-orange-200 hover:border-orange-300",
              }
              const hoverText: Record<string, string> = {
                teal: "group-hover:text-teal-700",
                violet: "group-hover:text-violet-700",
                pink: "group-hover:text-pink-700",
                orange: "group-hover:text-orange-700",
              }
              const hoverArrow: Record<string, string> = {
                teal: "group-hover:text-teal-500",
                violet: "group-hover:text-violet-500",
                pink: "group-hover:text-pink-500",
                orange: "group-hover:text-orange-500",
              }
              return (
                <Link key={link.href} href={link.href}
                  className={`group flex items-center gap-4 rounded-xl border bg-white p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${borderMap[link.color]}`}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm ${colorMap[link.color]}`}>
                    {link.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold text-zinc-800 transition-colors ${hoverText[link.color]}`}>{link.label}</p>
                    <p className="text-xs text-zinc-400">{link.desc}</p>
                  </div>
                  <span className={`text-zinc-300 transition-colors ${hoverArrow[link.color]}`}>→</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in" onClick={() => !deleting && setConfirmDelete(null)}>
          <div className="card mx-4 w-full max-w-sm p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl mb-3">🗑️</span>
              <h3 className="text-lg font-bold text-zinc-800">Excluir Aula?</h3>
              <p className="mt-1 text-sm text-zinc-500">"{ultimasAulas.find(a => a.id === confirmDelete)?.topico}" será permanentemente removida.</p>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="btn btn-secondary">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={deleting} className="btn btn-danger">
                {deleting ? <><span className="spinner !border-red-200 !border-t-white" /> Excluindo...</> : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
