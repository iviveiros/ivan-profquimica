"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import * as pdfjs from "pdfjs-dist"

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`

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
  const [importingPdf, setImportingPdf] = useState(false)

  useEffect(() => {
    supabase.from("escolas").select("id, nome").then(({ data }) => {
      if (data?.length) { setEscolas(data); setEscolaId(data[0].id) }
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
    setForm({ nome: "", turma_nome: "", observacoes: "" }); setEditId(null); setShowForm(false); carregarAlunos()
  }

  async function removerAluno(id: string) {
    if (!confirm("Remover este aluno?")) return
    await supabase.from("alunos").delete().eq("id", id); carregarAlunos()
  }

  function editarAluno(a: Aluno) {
    setForm({ nome: a.nome, turma_nome: a.turma_nome, observacoes: a.observacoes || "" })
    setEditId(a.id); setShowForm(true)
  }

  async function importarAlunos() {
    const lines = importText.split("\n").map(l => l.trim()).filter(Boolean)
    const novos: { nome: string; turma_nome: string; escola_id: string }[] = []
    let turmaAtual = ""
    for (const line of lines) {
      if (line === line.toUpperCase() && line.length > 1 && !line.includes(" ")) {
        turmaAtual = line
      } else if (line.includes(",")) {
        const partes = line.split(",").map(p => p.trim())
        if (partes[0]) novos.push({ nome: partes[0], turma_nome: partes[1] || turmaAtual, escola_id: escolaId })
      } else if (line) {
        novos.push({ nome: line, turma_nome: turmaAtual || "Sem Turma", escola_id: escolaId })
      }
    }
    if (!novos.length) { alert("Nenhum aluno encontrado."); return }
    await supabase.from("alunos").insert(novos)
    setImportText(""); setShowImport(false); carregarAlunos()
    alert(`${novos.length} alunos importados!`)
  }

  async function importarPdf(file: File) {
    setImportingPdf(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
      let text = ""
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((item: any) => item.str).join(" ") + "\n"
      }
      setImportText(text)
      setShowImport(true)
    } catch (err: any) {
      alert("Erro ao ler PDF: " + err.message)
    } finally {
      setImportingPdf(false)
    }
  }

  async function gerarListaChamada() {
    const turma = filtroTurma || Object.keys(turmasAgrupadas)[0]
    if (!turma || !alunos.length) { alert("Selecione uma turma com alunos."); return }
    let html = `<html><head><meta charset="utf-8"><style>
      body { font-family: Arial, sans-serif; font-size: 12pt; margin: 2cm; }
      h1 { text-align: center; font-size: 16pt; margin-bottom: 4pt; }
      h2 { text-align: center; font-size: 13pt; color: #555; margin-top: 0; font-weight: normal; }
      table { width: 100%; border-collapse: collapse; margin-top: 16pt; }
      th, td { border: 1px solid #999; padding: 6pt 8pt; text-align: left; }
      th { background: #059669; color: white; font-weight: bold; }
      tr:nth-child(even) { background: #f9fafb; }
      .num { width: 40px; text-align: center; }
    </style></head><body>
    <h1>LISTA DE CHAMADA</h1>
    <h2>${turma}</h2>
    <table><tr><th class="num">Nº</th><th>Nome</th><th style="width:60px">F</th><th style="width:60px">F</th><th style="width:60px">F</th><th style="width:60px">F</th></tr>`
    alunos.filter(a => !filtroTurma || a.turma_nome === filtroTurma).forEach((a, i) => {
      html += `<tr><td class="num">${i + 1}</td><td>${a.nome}</td><td></td><td></td><td></td><td></td></tr>`
    })
    html += `</table></body></html>`
    const win = window.open("", "_blank")
    win?.document.write(html)
    win?.document.close()
    win?.print()
  }

  const turmasAgrupadas = alunos.reduce((acc: Record<string, Aluno[]>, a) => {
    if (!acc[a.turma_nome]) acc[a.turma_nome] = []
    acc[a.turma_nome].push(a); return acc
  }, {})

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">👨‍🎓 Alunos</h1>
          <p className="mt-1 text-sm text-slate-500">Cadastro, importação e lista de chamada</p>
        </div>
        <div className="flex gap-2">
          <button onClick={gerarListaChamada} className="btn btn-outline">📋 Chamada</button>
          <button onClick={() => setShowImport(true)} className="btn btn-outline">📥 Importar</button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ nome: "", turma_nome: "", observacoes: "" }) }}
            className="btn btn-primary">+ Novo Aluno</button>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <select value={escolaId} onChange={e => setEscolaId(e.target.value)}
          className="select text-sm min-w-[140px]">
          {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <div className="h-5 w-px bg-slate-200" />
        <select value={filtroTurma} onChange={e => setFiltroTurma(e.target.value)}
          className="select text-sm min-w-[140px]">
          <option value="">Todas as turmas</option>
          {turmas.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
          {Object.keys(turmasAgrupadas).filter(t => !turmas.some(tp => tp.nome === t)).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span className="text-sm text-slate-400 ml-auto">{alunos.length} alunos</span>
      </div>

      {!alunos.length ? (
        <div className="card p-16 text-center">
          <p className="text-lg text-slate-400">Nenhum aluno cadastrado</p>
          <p className="mt-1 text-sm text-slate-400">Importe um PDF, cole uma lista, ou adicione manualmente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(turmasAgrupadas).sort().map(([turma, lista]) => (
            <div key={turma} className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-800">{turma}</h3>
                <span className="badge badge-emerald">{lista.length} alunos</span>
              </div>
              <div className="divide-y divide-slate-100">
                {lista.map((a, i) => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-300 w-5">{i + 1}</span>
                      <Link href={`/aluno/${a.id}`} className="text-sm font-medium text-slate-800 hover:text-emerald-700 hover:underline">{a.nome}</Link>
                      {a.observacoes && <span className="text-xs text-slate-400">({a.observacoes})</span>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => editarAluno(a)} className="btn btn-ghost text-xs px-2 py-1">Editar</button>
                      <button onClick={() => removerAluno(a.id)} className="btn btn-ghost text-xs px-2 py-1 text-red-500 hover:bg-red-50">Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-slate-800">{editId ? "Editar" : "Novo Aluno"}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Nome</label>
                <input type="text" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="input" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Turma</label>
                <input type="text" value={form.turma_nome} onChange={e => setForm({ ...form, turma_nome: e.target.value })}
                  className="input" list="turmas-list" />
                <datalist id="turmas-list">{turmas.map(t => <option key={t.id} value={t.nome} />)}</datalist>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })}
                  className="input" rows={2} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="btn btn-outline">Cancelar</button>
              <button onClick={salvarAluno} className="btn btn-primary">{editId ? "Salvar" : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowImport(false)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800">📥 Importar Alunos</h3>
            <div className="mt-3 flex gap-2">
              <label className="btn btn-outline cursor-pointer">
                📄 Importar PDF
                <input type="file" accept=".pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) importarPdf(e.target.files[0]) }} disabled={importingPdf} />
              </label>
              <p className="text-xs text-slate-400 self-center">ou cole manualmente</p>
            </div>
            {importingPdf && <p className="mt-2 text-sm text-emerald-600">Lendo PDF...</p>}
            <textarea value={importText} onChange={e => setImportText(e.target.value)}
              className="input mt-3 font-mono text-xs" rows={10}
              placeholder={`1ª EM\nJoão Silva\nMaria Santos\n\n2ª EM\nPedro Oliveira\nAna Costa`} />
            <p className="mt-2 text-xs text-slate-400">Use TURMA em maiúsculo para agrupar. Ou: Nome, Turma</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowImport(false)} className="btn btn-outline">Cancelar</button>
              <button onClick={importarAlunos} className="btn btn-primary">Importar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
