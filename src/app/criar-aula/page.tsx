"use client"

import { useState } from "react"
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

  // Carregar sistemas ao montar
  useState(() => {
    supabase.from("sistemas_ensino").select("*").then(({ data }) => {
      if (data) setSistemas(data)
    })
  })

  // Carregar turmas ao selecionar sistema
  async function carregarTurmas(sisId: string) {
    setSistemaId(sisId)
    setTurmaId("")
    const { data } = await supabase
      .from("turmas")
      .select("*")
      .eq("sistema_id", sisId)
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

      // Salvar no Supabase
      const { data: aula } = await supabase
        .from("aulas")
        .insert({
          turma_id: Number(turmaId),
          sistema_id: Number(sistemaId),
          topico,
          resumo_md: data.resumo,
          exercicios_md: data.exercicios,
          avaliacao_md: data.avaliacao,
        })
        .select()
        .single()

      if (aula) setAulaId(aula.id)
    } catch (err: any) {
      alert("Erro: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Criar Nova Aula</h1>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Sistema de Ensino
            </label>
            <select
              value={sistemaId}
              onChange={(e) => carregarTurmas(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              {sistemas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Turma
            </label>
            <select
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              disabled={!sistemaId}
            >
              <option value="">Selecione...</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.ano})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Conteúdo da Aula
            </label>
            <input
              type="text"
              value={topico}
              onChange={(e) => setTopico(e.target.value)}
              placeholder="Ex: Hibridação sp³, sp², sp"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          onClick={gerarConteudo}
          disabled={loading || !sistemaId || !turmaId || !topico.trim()}
          className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Gerando..." : "🔬 Gerar Aula Completa"}
        </button>
      </div>

      {conteudo && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
              {(["resumo", "exercicios", "avaliacao"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAba(a)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    aba === a ? "bg-white text-emerald-700 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {a === "resumo" ? "📖 Resumo" : a === "exercicios" ? "✏️ Exercícios" : "📝 Avaliação"}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {aulaId && (
                <button
                  onClick={() => router.push(`/aula/${aulaId}`)}
                  className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-zinc-50"
                >
                  Abrir Aula
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
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
    </div>
  )
}
