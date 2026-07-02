"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Aluno = { id: string; nome: string; turma_nome: string; observacoes: string | null }
type TurmaProf = { id: string; nome: string; ano: string }

export default function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [turmas, setTurmas] = useState<TurmaProf[]>([])
  const [escolas, setEscolas] = useState<{ id: string; nome: string }[]>([])
  const [escolaId, setEscolaId] = useState("")
  const [filtroTurma, setFiltroTurma] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: "", turma_nome: "", observacoes: "" })
  const [editId, setEditId] = useState<string | null>(null)
  const [importText, setImportText] = useState("")
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    supabase.from("escolas").select("id, nome").then(({ data }) => {
      if (data?.length) {
        setEscolas(data)
        setEscolaId(data[0].id)
      }
    })
  }, [])

  useEffect(() => {
    if (!escolaId) return
    supabase.from("turmas_professor").select("*").eq("escola_id", escolaId).then(({ data }) => {
      if (data) setTurmas(data)
    })
    carregarAlunos()
  }, [escolaId])

  async function carregarAlunos() {
    let query = supabase.from("alunos").select("*").order("nome")
    if (escolaId) query = query.eq("escola_id", escolaId)
    if (filtroTurma) query = query.eq("turma_nome", filtroTurma)
    const { data } = await query
    if (data) setAlunos(data)
  }

  useEffect(() => { carregarAlunos() }, [filtroTurma, escolaId])

  async function salvarAluno() {
    if (!form.nome.trim() || !form.turma_nome.trim()) return
    if (editId) {
      await supabase.from("alunos").update({ nome: form.nome, turma_nome: form.turma_nome, observacoes: form.observacoes }).eq("id", editId)
    } else {
      await supabase.from("alunos").insert({ nome: form.nome, turma_nome: form.turma_nome, observacoes: form.observacoes, escola_id: escolaId })
    }
    setForm({ nome: "", turma_nome: "", observacoes: "" })
    setEditId(null)
    setShowForm(false)
    carregarAlunos()
  }

  async function removerAluno(id: string) {
    if (!confirm("Remover este aluno?")) return
    await supabase.from("alunos").delete().eq("id", id)
    carregarAlunos()
  }

  function editarAluno(a: Aluno) {
    setForm({ nome: a.nome, turma_nome: a.turma_nome, observacoes: a.observacoes || "" })
    setEditId(a.id)
    setShowForm(true)
  }

  async function importarAlunos() {
    const lines = importText.split("\n").map(l => l.trim()).filter(Boolean)
    const novos: { nome: string; turma_nome: string; escola_id: string }[] = []
    let turmaAtual = ""
    for (const line of lines) {
      if (line.toUpperCase() === line && line.length > 1 && !line.includes(" ")) {
        turmaAtual = line
      } else if (line.includes(",")) {
        const partes = line.split(",").map(p => p.trim())
        const nome = partes[0]
        const turma = partes[1] || turmaAtual
        if (nome) novos.push({ nome, turma_nome: turma, escola_id: escolaId })
      } else if (line) {
        novos.push({ nome: line, turma_nome: turmaAtual || "Sem Turma", escola_id: escolaId })
      }
    }
    if (novos.length === 0) { alert("Nenhum aluno válido encontrado."); return }
    await supabase.from("alunos").insert(novos)
    setImportText("")
    setShowImport(false)
    carregarAlunos()
    alert(`${novos.length} alunos importados!`)
  }

  const turmasAgrupadas = alunos.reduce((acc: Record<string, Aluno[]>, a) => {
    if (!acc[a.turma_nome]) acc[a.turma_nome] = []
    acc[a.turma_nome].push(a)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">👨‍🎓 Alunos</h1>
          <p className="mt-1 text-sm text-zinc-500">Cadastro de alunos por turma</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="rounded-lg border px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">📥 Importar</button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ nome: "", turma_nome: "", observacoes: "" }) }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">+ Novo Aluno</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-xl border bg-white p-4 shadow-sm">
        <select value={escolaId} onChange={e => setEscolaId(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm">
          {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <select value={filtroTurma} onChange={e => setFiltroTurma(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Todas as turmas</option>
          {turmas.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
          {Object.keys(turmasAgrupadas).filter(t => !turmas.some(tp => tp.nome === t)).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span className="text-sm text-zinc-400 self-center">{alunos.length} alunos</span>
      </div>

      {alunos.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-white p-12 text-center">
          <p className="text-lg text-zinc-500">Nenhum aluno cadastrado.</p>
          <p className="mt-1 text-sm text-zinc-400">Adicione manualmente ou importe uma lista.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(turmasAgrupadas).sort().map(([turma, lista]) => (
            <div key={turma} className="rounded-xl border bg-white shadow-sm">
              <div className="border-b bg-zinc-50 px-4 py-2 flex items-center justify-between">
                <h3 className="font-semibold text-zinc-700">{turma}</h3>
                <span className="text-xs text-zinc-400">{lista.length} alunos</span>
              </div>
              <div className="divide-y">
                {lista.map(a => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50">
                    <div>
                      <p className="text-sm font-medium text-zinc-800">{a.nome}</p>
                      {a.observacoes && <p className="text-xs text-zinc-400">{a.observacoes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editarAluno(a)} className="text-xs text-zinc-400 hover:text-emerald-600">Editar</button>
                      <button onClick={() => removerAluno(a.id)} className="text-xs text-zinc-400 hover:text-red-600">Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-zinc-800">{editId ? "Editar Aluno" : "Novo Aluno"}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Nome</label>
                <input type="text" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Nome completo" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Turma</label>
                <input type="text" value={form.turma_nome} onChange={e => setForm({ ...form, turma_nome: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Ex: 1ª EM" list="turmas-list" />
                <datalist id="turmas-list">
                  {turmas.map(t => <option key={t.id} value={t.nome} />)}
                </datalist>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm" rows={2} placeholder="Opcional" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50">Cancelar</button>
              <button onClick={salvarAluno} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                {editId ? "Salvar" : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowImport(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="mb-1 text-lg font-bold text-zinc-800">📥 Importar Alunos</h3>
            <p className="mb-4 text-xs text-zinc-400">Um nome por linha. Use "TURMA" em maiúsculo para agrupar. Ou: Nome, Turma</p>
            <textarea value={importText} onChange={e => setImportText(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm font-mono" rows={10}
              placeholder={`1ª EM\nJoão Silva\nMaria Souza\nCarlos Lima\n\n2ª EM\nAna Beatriz\nPedro Santos`} />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowImport(false)} className="rounded-lg border px-4 py-2 text-sm font-medium text-zinc-600">Cancelar</button>
              <button onClick={importarAlunos} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Importar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
