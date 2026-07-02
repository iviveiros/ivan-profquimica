"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Aluno = { id: string; nome: string; turma_nome: string; escola_id: string; observacoes?: string }
type Turma = { id: string; nome: string }
type Escola = { id: string; nome: string }

export default function Alunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [escolas, setEscolas] = useState<Escola[]>([])
  const [escolaId, setEscolaId] = useState("")
  const [filtroTurma, setFiltroTurma] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: "", turma_nome: "", observacoes: "" })
  const [importText, setImportText] = useState("")
  const [importingPdf, setImportingPdf] = useState(false)

  useEffect(() => {
    supabase.from("escolas").select("id, nome").then(({ data }) => {
      if (data?.length) { setEscolas(data); setEscolaId(data[0].id) }
    })
  }, [])

  useEffect(() => {
    if (!escolaId) return
    supabase.from("alunos").select("*").eq("escola_id", escolaId).order("nome").then(({ data }) => {
      if (data) setAlunos(data)
    })
    supabase.from("turmas").select("id, nome").then(({ data }) => {
      if (data) setTurmas(data)
    })
  }, [escolaId])

  async function salvarAluno() {
    if (!form.nome.trim()) return
    if (editId) {
      await supabase.from("alunos").update({ nome: form.nome, turma_nome: form.turma_nome, observacoes: form.observacoes }).eq("id", editId)
    } else {
      await supabase.from("alunos").insert({ nome: form.nome, turma_nome: form.turma_nome, escola_id: escolaId, observacoes: form.observacoes })
    }
    setShowForm(false); setEditId(null); setForm({ nome: "", turma_nome: "", observacoes: "" })
    const { data } = await supabase.from("alunos").select("*").eq("escola_id", escolaId).order("nome")
    if (data) setAlunos(data)
  }

  function editarAluno(a: Aluno) {
    setEditId(a.id); setForm({ nome: a.nome, turma_nome: a.turma_nome, observacoes: a.observacoes || "" }); setShowForm(true)
  }

  async function removerAluno(id: string) {
    if (!confirm("Remover este aluno?")) return
    await supabase.from("alunos").delete().eq("id", id)
    setAlunos(prev => prev.filter(a => a.id !== id))
  }

  async function importarAlunos() {
    const linhas = importText.split("\n").map(l => l.trim()).filter(Boolean)
    let turmaAtual = ""
    const toInsert: { nome: string; turma_nome: string; escola_id: string }[] = []

    for (const linha of linhas) {
      if (linha === linha.toUpperCase() && /^\d/.test(linha)) {
        turmaAtual = linha
      } else if (linha.includes(",")) {
        const [nome, turma] = linha.split(",").map(s => s.trim())
        if (nome) toInsert.push({ nome, turma_nome: turma || turmaAtual, escola_id: escolaId })
      } else if (linha) {
        toInsert.push({ nome: linha, turma_nome: turmaAtual, escola_id: escolaId })
      }
    }

    if (!toInsert.length) { alert("Nenhum aluno encontrado para importar."); return }
    await supabase.from("alunos").insert(toInsert)
    setImportText(""); setShowImport(false)
    const { data } = await supabase.from("alunos").select("*").eq("escola_id", escolaId).order("nome")
    if (data) setAlunos(data)
  }

  async function importarPdf(file: File) {
    setImportingPdf(true)
    try {
      const pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let texto = ""

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        texto += content.items.map((item: any) => item.str).join(" ") + "\n"
      }

      const nomes = texto.split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0 && !/^\d/.test(l) && !l.includes("LISTA") && !l.includes("ALUNO") && !l.includes("Nº") && !l.includes("SÉRIE"))
        .map(l => l.replace(/^\d+\s*[-–.]?\s*/, "").trim())
        .filter(l => l.length > 2)

      if (nomes.length > 0) {
        const turmaMatch = texto.match(/(\d+[ªº]\s*(EM|ANO|SÉRIE))/i)
        const turmaDetectada = turmaMatch ? turmaMatch[1].toUpperCase() : ""
        setImportText(nomes.join("\n") + (turmaDetectada ? `\n\nTurma detectada: ${turmaDetectada}` : ""))
      } else {
        setImportText(texto)
      }
    } catch (err: any) {
      alert("Erro ao ler PDF: " + err.message)
    } finally {
      setImportingPdf(false)
    }
  }

  function gerarListaChamada() {
    const turmasAgrupadas = alunos.reduce((acc: Record<string, Aluno[]>, a) => {
      if (!acc[a.turma_nome]) acc[a.turma_nome] = []
      acc[a.turma_nome].push(a); return acc
    }, {} as Record<string, Aluno[]>)

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
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">◆ Alunos</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Cadastro, importação e lista de chamada</p>
        </div>
        <div className="flex gap-2">
          <button onClick={gerarListaChamada} className="btn btn-secondary btn-sm">📋 Chamada</button>
          <button onClick={() => setShowImport(true)} className="btn btn-secondary btn-sm">📥 Importar</button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ nome: "", turma_nome: "", observacoes: "" }) }} className="btn btn-primary btn-sm">
            + Novo Aluno
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <select value={escolaId} onChange={e => setEscolaId(e.target.value)} className="select text-sm min-w-[140px]">
          {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <div className="h-5 w-px bg-zinc-200" />
        <select value={filtroTurma} onChange={e => setFiltroTurma(e.target.value)} className="select text-sm min-w-[140px]">
          <option value="">Todas as turmas</option>
          {turmas.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
          {Object.keys(turmasAgrupadas).filter(t => !turmas.some(tp => tp.nome === t)).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span className="text-sm text-zinc-400 ml-auto">{alunos.length} alunos</span>
      </div>

      {/* Groups */}
      {!alunos.length ? (
        <div className="card p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-3xl shadow-sm animate-float">
            ◆
          </div>
          <p className="mt-4 text-lg font-bold text-zinc-700">Nenhum aluno cadastrado</p>
          <p className="mt-1 text-sm text-zinc-400">Importe um PDF, cole uma lista, ou adicione manualmente</p>
          <div className="mt-4 flex justify-center gap-2">
            <button onClick={() => setShowImport(true)} className="btn btn-secondary btn-sm">📥 Importar</button>
            <button onClick={() => { setShowForm(true); setEditId(null); setForm({ nome: "", turma_nome: "", observacoes: "" }) }} className="btn btn-primary btn-sm">
              + Adicionar manualmente
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(turmasAgrupadas).sort().map(([turma, lista]) => (
            <div key={turma} className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 bg-gradient-to-r from-zinc-50/80 to-white">
                <h3 className="font-bold text-zinc-800">{turma}</h3>
                <span className="badge badge-emerald">{lista.length} alunos</span>
              </div>
              <div className="divide-y divide-zinc-100">
                {lista.map((a, i) => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-2.5 row-hover">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs text-zinc-300 w-5 shrink-0">{i + 1}</span>
                      <Link href={`/aluno/${a.id}`} className="text-sm font-medium text-zinc-800 hover:text-emerald-700 hover:underline truncate">
                        {a.nome}
                      </Link>
                      {a.observacoes && <span className="text-xs text-zinc-400">({a.observacoes})</span>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => editarAluno(a)} className="btn btn-ghost btn-sm">Editar</button>
                      <button onClick={() => removerAluno(a.id)} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50">Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-zinc-800">{editId ? "Editar Aluno" : "Novo Aluno"}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-500">Nome</label>
                <input type="text" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="input" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-500">Turma</label>
                <input type="text" value={form.turma_nome} onChange={e => setForm({ ...form, turma_nome: e.target.value })} className="input" list="turmas-list" />
                <datalist id="turmas-list">{turmas.map(t => <option key={t.id} value={t.nome} />)}</datalist>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-500">Observações</label>
                <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} className="textarea" rows={2} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">Cancelar</button>
              <button onClick={salvarAluno} className="btn btn-primary btn-sm">{editId ? "Salvar" : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setShowImport(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-zinc-800">📥 Importar Alunos</h3>
            <div className="mt-3 flex gap-2">
              <label className="btn btn-secondary btn-sm cursor-pointer">
                📄 Importar PDF
                <input type="file" accept=".pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) importarPdf(e.target.files[0]) }} disabled={importingPdf} />
              </label>
              <p className="text-xs text-zinc-400 self-center">ou cole manualmente</p>
            </div>
            {importingPdf && <p className="mt-2 text-sm text-emerald-600 animate-pulse">Lendo PDF...</p>}
            <textarea value={importText} onChange={e => setImportText(e.target.value)} className="textarea mt-3 font-mono text-xs" rows={10}
              placeholder={`1ª EM\nJoão Silva\nMaria Santos\n\n2ª EM\nPedro Oliveira\nAna Costa`} />
            <p className="mt-2 text-xs text-zinc-400">Use TURMA em maiúsculo para agrupar. Ou: Nome, Turma</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowImport(false)} className="btn btn-ghost btn-sm">Cancelar</button>
              <button onClick={importarAlunos} className="btn btn-primary btn-sm">Importar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
