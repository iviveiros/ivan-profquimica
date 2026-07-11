"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { SistemaEnsino, Turma, ConteudoGerado } from "@/types"
import ReactMarkdown from "react-markdown"

export default function CriarAula() {
  const router = useRouter()
  const [sistemas, setSistemas] = useState<SistemaEnsino[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [sistemaId, setSistemaId] = useState("")
  const [turmaId, setTurmaId] = useState("")
  const [topico, setTopico] = useState("")
  const [loading, setLoading] = useState(false)
  const [conteudo, setConteudo] = useState<ConteudoGerado | null>(null)
  const [aulaId, setAulaId] = useState<string | null>(null)
  const [aba, setAba] = useState<"resumo" | "exercicios" | "avaliacao">("resumo")

  useEffect(() => {
    supabase.from("sistemas_ensino").select("*").then(({ data }) => {
      if (data) setSistemas(data)
    })
  }, [])

  async function carregarTurmas(sisId: string) {
    setSistemaId(sisId)
    setTurmaId("")
    const { data } = await supabase.from("turmas").select("*").eq("sistema_id", sisId)
    if (data) setTurmas(data)
  }

  async function gerarConteudo() {
    if (!sistemaId || !turmaId || !topico.trim()) return
    setLoading(true)
    try {
      const sistemaNome = sistemas.find(s => s.id === Number(sistemaId))?.nome || ""
      const turmaNome = turmas.find(t => t.id === Number(turmaId))?.nome || ""

      const res = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sistema: sistemaNome, turma: turmaNome, topico }),
      })
      if (!res.ok) throw new Error("Erro ao gerar conteúdo")

      const data: ConteudoGerado = await res.json()
      setConteudo(data)

      const { data: aula } = await supabase
        .from("aulas")
        .insert({ turma_id: Number(turmaId), sistema_id: Number(sistemaId), topico, resumo_md: data.resumo, exercicios_md: data.exercicios, avaliacao_md: data.avaliacao })
        .select().single()
      if (aula) setAulaId(aula.id)
    } catch (err: any) {
      alert("Erro: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">✦ Criar Nova Aula</h1>
        <p className="mt-1.5 text-sm text-zinc-500">Preencha os dados e gere conteúdo completo com IA</p>
      </div>

      {/* Form Card */}
      <div className="card p-6">
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-700">Sistema de Ensino</label>
            <select value={sistemaId} onChange={e => carregarTurmas(e.target.value)} className="select">
              <option value="">Selecione...</option>
              {sistemas.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-700">Turma</label>
            <select value={turmaId} onChange={e => setTurmaId(e.target.value)} className="select" disabled={!sistemaId}>
              <option value="">Selecione...</option>
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.ano})</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-zinc-700">Conteúdo da Aula</label>
            <input type="text" value={topico} onChange={e => setTopico(e.target.value)}
              placeholder="Ex: Hibridação sp³, sp², sp" className="input" />
          </div>
        </div>
        <button
          onClick={gerarConteudo}
          disabled={loading || !sistemaId || !turmaId || !topico.trim()}
          className="btn btn-primary mt-5 w-full"
        >
          {loading ? <><span className="spinner" /> Gerando...</> : "🔬 Gerar Aula Completa"}
        </button>
      </div>

      {/* Content Result */}
      {conteudo && (
        <div className="card p-6 animate-fade-in-up">
          {/* Tabs + Actions */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-xl bg-zinc-100 p-1">
              {(["resumo", "exercicios", "avaliacao"] as const).map(a => (
                <button key={a} onClick={() => setAba(a)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                    aba === a ? "bg-white text-emerald-700 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                  }`}>
                  {a === "resumo" ? "📖 Resumo" : a === "exercicios" ? "✏️ Exercícios" : "📝 Avaliação"}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {aulaId && (
                <button onClick={() => router.push(`/aula/${aulaId}`)} className="btn btn-secondary btn-sm">
                  Abrir Aula
                </button>
              )}
              <button onClick={() => window.print()} className="btn btn-primary btn-sm">
                🖨️ PDF
              </button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none prose-headings:text-zinc-800 prose-p:text-zinc-600 prose-strong:text-zinc-800">
            <ReactMarkdown>
              {aba === "resumo"
                ? `# Resumo da Aula\n\n${conteudo.resumo}`
                : aba === "exercicios"
                ? `# Exercícios\n\n${conteudo.exercicios}`
                : `# Avaliação\n\n${conteudo.avaliacao}`}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!conteudo && (
        <div className="card p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl shadow-sm animate-float">
            🧪
          </div>
          <h3 className="mt-4 text-lg font-bold text-zinc-700">Pronto para criar?</h3>
          <p className="mt-1 text-sm text-zinc-400">Selecione sistema, turma, tópico e clique em gerar</p>
        </div>
      )}
    </div>
  )
}
