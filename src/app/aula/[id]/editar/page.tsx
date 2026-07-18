"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAula, atualizarAula } from "@/services/aulas"
import Link from "next/link"

type Props = { params: Promise<{ id: string }> }

export default function EditarAulaPage({ params }: Props) {
  const router = useRouter()
  const [id, setId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ topico: "", resumo_md: "", exercicios_md: "", avaliacao_md: "" })
  const [info, setInfo] = useState({ sistema: "", turma: "" })

  useEffect(() => {
    params.then(({ id: pid }) => {
      setId(pid)
      getAula(pid).then(aula => {
        if (!aula) { setError("Aula não encontrada"); setLoading(false); return }
        setForm({ topico: aula.topico, resumo_md: aula.resumo_md || "", exercicios_md: aula.exercicios_md || "", avaliacao_md: aula.avaliacao_md || "" })
        setInfo({ sistema: (aula as any).sistemas_ensino?.nome || "", turma: (aula as any).turmas?.nome || "" })
        setLoading(false)
      }).catch(() => { setError("Erro ao carregar aula"); setLoading(false) })
    })
  }, [params])

  async function handleSave() {
    if (!form.topico.trim()) return
    setSaving(true)
    setSaved(false)
    try {
      await atualizarAula(id, form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) { console.error("Erro ao salvar aula:", e); setError(e?.message || "Erro ao salvar") }
    setSaving(false)
  }

  if (loading) return (
    <div className="space-y-4 animate-fade-in">
      <div className="skeleton h-8 w-48 mb-4" />
      <div className="skeleton h-64 w-full" />
    </div>
  )

  if (error) return (
    <div className="card p-8 text-center animate-fade-in">
      <p className="text-red-600 font-semibold">{error}</p>
      <Link href="/dashboard" className="btn btn-secondary mt-4">← Voltar</Link>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <button onClick={() => router.back()} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-teal-700 transition-colors">
            ← Voltar
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-teal-600 via-violet-600 to-pink-600 bg-clip-text text-transparent">
              ✏️ Editar Aula
            </span>
          </h1>
          {info.sistema && (
            <p className="text-sm text-zinc-500 mt-0.5">
              <span className="inline-block px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-xs font-semibold mr-1.5">{info.sistema}</span>
              <span className="inline-block px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-xs font-semibold">{info.turma}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/aula/${id}`} className="btn btn-outline btn-sm">👁️ Visualizar</Link>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">
            {saving ? <><span className="spinner" /> Salvando...</> : saved ? "✅ Salvo!" : "💾 Salvar"}
          </button>
        </div>
      </div>

      {/* Tópico */}
      <div className="card p-6">
        <label className="mb-1.5 block text-sm font-semibold text-zinc-700">Tópico da Aula</label>
        <input type="text" value={form.topico} onChange={e => setForm(p => ({ ...p, topico: e.target.value }))} className="input" />
      </div>

      {/* Editores */}
      {(["resumo_md", "exercicios_md", "avaliacao_md"] as const).map(section => {
        const labels: Record<string, string> = { resumo_md: "📖 Resumo (Markdown)", exercicios_md: "✏️ Exercícios (Markdown)", avaliacao_md: "📝 Avaliação (Markdown)" }
        const colors: Record<string, string> = { resumo_md: "border-teal-200 focus:border-teal-500", exercicios_md: "border-violet-200 focus:border-violet-500", avaliacao_md: "border-pink-200 focus:border-pink-500" }
        const gradients: Record<string, string> = { resumo_md: "from-teal-50 to-teal-100/30", exercicios_md: "from-violet-50 to-violet-100/30", avaliacao_md: "from-pink-50 to-pink-100/30" }
        return (
          <div key={section} className="card overflow-hidden">
            <div className={`px-6 py-3 border-b border-zinc-200/60 bg-gradient-to-r ${gradients[section]}`}>
              <label className="text-sm font-bold text-zinc-800">{labels[section]}</label>
            </div>
            <div className="p-4">
              <textarea
                value={form[section]}
                onChange={e => setForm(p => ({ ...p, [section]: e.target.value }))}
                className={`w-full rounded-xl border-2 ${colors[section]} p-4 text-sm font-mono leading-relaxed resize-y min-h-[200px] bg-white/80 focus:outline-none focus:shadow-lg transition-all`}
                placeholder={`# ${section === "resumo_md" ? "Resumo" : section === "exercicios_md" ? "Exercícios" : "Avaliação"}\n\nEdite o conteúdo em Markdown...`}
              />
              {form[section] && (
                <div className="mt-2 flex justify-end">
                  <span className="text-[11px] text-zinc-400 font-mono">{form[section].length} caracteres</span>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Preview */}
      <details className="card overflow-hidden">
        <summary className="px-6 py-3 text-sm font-bold text-zinc-700 cursor-pointer hover:bg-zinc-50 transition-colors select-none">
          📋 Prévia do conteúdo gerado
        </summary>
        <div className="p-4 border-t border-zinc-200/60">
          <div className="space-y-4 text-sm text-zinc-500">
            <p><strong className="text-zinc-700">Resumo:</strong> ~{form.resumo_md.length} chars</p>
            <p><strong className="text-zinc-700">Exercícios:</strong> ~{form.exercicios_md.length} chars</p>
            <p><strong className="text-zinc-700">Avaliação:</strong> ~{form.avaliacao_md.length} chars</p>
          </div>
        </div>
      </details>

      {/* Bottom actions */}
      <div className="flex justify-between items-center">
        <Link href={`/aula/${id}`} className="text-sm text-zinc-500 hover:text-teal-700 transition-colors">← Cancelar e voltar</Link>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          {saving ? <><span className="spinner" /> Salvando...</> : saved ? "✅ Salvo com sucesso!" : "💾 Salvar Alterações"}
        </button>
      </div>
    </div>
  )
}
