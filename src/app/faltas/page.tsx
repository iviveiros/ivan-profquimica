"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getEscolas } from "@/services/escolas"
import { getAlunosDaTurma, atualizarAluno, removerAlunoCompleto } from "@/services/alunos"
import { getFaltas, salvarFalta, marcarTodosPresentes } from "@/services/faltas"
import { getTurmasDaEscola } from "@/services/turmas"
import type { AlunoBasico } from "@/services/alunos"

type FaltasMap = Record<string, boolean>

export default function Faltas() {
  const [alunos, setAlunos] = useState<AlunoBasico[]>([])
  const [escolas, setEscolas] = useState<{ id: string; nome: string }[]>([])
  const [escolaId, setEscolaId] = useState("")
  const [escolaNome, setEscolaNome] = useState("")
  const [turma, setTurma] = useState("")
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<string[]>([])
  const [data, setData] = useState(new Date().toISOString().split("T")[0])
  const [faltas, setFaltas] = useState<FaltasMap>({})
  const [salvo, setSalvo] = useState(false)
  const [todasPresentes, setTodasPresentes] = useState(true)
  const [editarAluno, setEditarAluno] = useState<AlunoBasico | null>(null)
  const [editNome, setEditNome] = useState("")
  const [editTurma, setEditTurma] = useState("")
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [erro, setErro] = useState("")

  useEffect(() => {
    getEscolas().then(data => {
      if (data?.length) { setEscolas(data); setEscolaId(data[0].id); setEscolaNome(data[0].nome) }
    }).catch(e => setErro("Erro ao carregar escolas"))
  }, [])

  useEffect(() => {
    if (!escolaId) return
    const e = escolas.find(x => x.id === escolaId)
    if (e) setEscolaNome(e.nome)
    setTurma("")
    setAlunos([])
    setTurmasDisponiveis([])
    Promise.all([
      getAlunosDaTurma(escolaId, ""),
      getTurmasDaEscola(escolaId),
    ]).then(([alunosData, turmasData]) => {
      setAlunos(alunosData)
      const nomes = turmasData.map(t => t.nome)
      setTurmasDisponiveis(nomes)
    }).catch(e => setErro("Erro ao carregar dados"))
  }, [escolaId])

  useEffect(() => {
    if (!turma || !data || !escolaId) return
    getAlunosDaTurma(escolaId, turma).then(data => {
      setAlunos(data)
      carregarFaltas(data)
    }).catch(e => setErro("Erro ao carregar alunos da turma"))
  }, [turma, data])

  async function carregarFaltas(alunosList: AlunoBasico[]) {
    const ids = alunosList.map(a => a.id)
    if (!ids.length) return
    try {
      const registros = await getFaltas(ids, data)
      const map: FaltasMap = {}
      for (const r of registros) map[r.aluno_id] = r.presente
      setFaltas(map)
      setTodasPresentes(Object.values(map).every(v => v !== false))
    } catch (e) {
      setErro("Erro ao carregar faltas")
    }
  }

  async function togglePresenca(alunoId: string, presente: boolean) {
    setErro("")
    try {
      await salvarFalta(alunoId, data, presente)
      setFaltas(prev => ({ ...prev, [alunoId]: presente }))
      setTodasPresentes(Object.values({ ...faltas, [alunoId]: presente }).every(v => v !== false))
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2000)
    } catch (e) {
      setErro("Erro ao salvar presença")
    }
  }

  async function marcarTodasPresentesHandler() {
    if (!alunos.length) return
    setErro("")
    try {
      await marcarTodosPresentes(alunos.map(a => a.id), data)
      const map: FaltasMap = {}
      for (const a of alunos) map[a.id] = true
      setFaltas(map)
      setTodasPresentes(true)
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2000)
    } catch (e) {
      setErro("Erro ao marcar todos presentes")
    }
  }

  function imprimirChamada() {
    const alunosFiltrados = turma ? alunos.filter(a => a.turma_nome === turma) : alunos
    const presentes = alunosFiltrados.filter(a => faltas[a.id] ?? true)
    const ausentes = alunosFiltrados.filter(a => !(faltas[a.id] ?? true))
    const win = window.open("", "_blank")
    win?.document.write(`
      <html><head><meta charset="utf-8"><title>Chamada - ${turma}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12pt; margin: 2cm; }
        h1 { text-align: center; font-size: 16pt; margin-bottom: 2pt; }
        h2 { text-align: center; font-size: 11pt; color: #666; font-weight: normal; margin-top: 0; margin-bottom: 16pt; }
        h3 { font-size: 12pt; margin-top: 16pt; margin-bottom: 6pt; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #999; padding: 4pt 8pt; text-align: left; font-size: 11pt; }
        th { background: #059669; color: white; font-weight: bold; }
        .num { width: 30px; text-align: center; }
        .check { width: 50px; text-align: center; }
        .presente { color: #059669; }
        .falta { color: #dc2626; }
        .assinatura { margin-top: 40pt; text-align: center; }
        .assinatura div { margin-top: 60pt; border-top: 1px solid #999; display: inline-block; padding: 0 40pt; }
      </style></head><body>
      <h1>CHAMADA — ${escolaNome}</h1>
      <h2>${turma} · ${new Date(data).toLocaleDateString("pt-BR")}</h2>
      <h3>✅ Presentes (${presentes.length})</h3>
      <table><tr><th class="num">Nº</th><th>Nome</th><th class="check">Presente</th></tr>
      ${presentes.map((a, i) => `<tr><td class="num">${i + 1}</td><td>${a.nome}</td><td class="check presente">✓</td></tr>`).join("")}
      </table>
      <h3 style="margin-top:20pt">❌ Ausentes (${ausentes.length})</h3>
      <table><tr><th class="num">Nº</th><th>Nome</th><th class="check">Falta</th></tr>
      ${ausentes.map((a, i) => `<tr><td class="num">${i + 1}</td><td>${a.nome}</td><td class="check falta">✗</td></tr>`).join("")}
      </table>
      <div class="assinatura"><div>Assinatura do Professor</div></div>
      </body></html>
    `)
    win?.document.close()
    win?.print()
  }

  const turmasUnicas = turmasDisponiveis.length
    ? turmasDisponiveis.sort()
    : [...new Set(alunos.map(a => a.turma_nome))].sort()
  const alunosFiltrados = turma ? alunos.filter(a => a.turma_nome === turma) : alunos

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">◇ Chamada / Faltas</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Registro diário de presença</p>
        </div>
        <div className="flex items-center gap-2">
          {salvo && <span className="badge badge-emerald animate-fade-in">✓ Salvo</span>}
          <button onClick={imprimirChamada} className="btn btn-secondary btn-sm">🖨️ Imprimir</button>
        </div>
      </div>

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
          <button onClick={() => setErro("")} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Controls */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <select value={escolaId} onChange={e => { setEscolaId(e.target.value) }} className="select text-sm">
          {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <select value={turma} onChange={e => setTurma(e.target.value)} className="select text-sm">
          <option value="">Todas as turmas</option>
          {turmasUnicas.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="date" value={data} onChange={e => setData(e.target.value)} className="select text-sm" />
        <div className="flex-1" />
        <button onClick={marcarTodasPresentesHandler} className="btn btn-secondary btn-sm">✓ Todos presentes</button>
      </div>

      {/* List */}
      {!alunosFiltrados.length ? (
        <div className="card p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-3xl shadow-sm animate-float">
            ◇
          </div>
          <p className="mt-4 text-lg font-bold text-zinc-700">Nenhuma turma selecionada</p>
          <p className="mt-1 text-sm text-zinc-400">Selecione uma turma para fazer a chamada</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-zinc-100">
            {alunosFiltrados.map((a, i) => {
              const presente = faltas[a.id] ?? true
              return (
                <div key={a.id} className="flex items-center justify-between px-5 py-2.5 row-hover">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs text-zinc-300 w-5 shrink-0">{i + 1}</span>
                    <Link href={`/aluno/${a.id}`} className="text-sm font-medium text-zinc-800 hover:text-emerald-700 hover:underline truncate">
                      {a.nome}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => togglePresenca(a.id, true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        presente ? "bg-emerald-100 text-emerald-700 border border-emerald-300 shadow-sm" : "bg-white text-zinc-400 border border-zinc-200 hover:bg-emerald-50 hover:border-emerald-300"
                      }`}
                    >
                      ✅ Presente
                    </button>
                    <button
                      onClick={() => togglePresenca(a.id, false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        !presente ? "bg-red-100 text-red-700 border border-red-300 shadow-sm" : "bg-white text-zinc-400 border border-zinc-200 hover:bg-red-50 hover:border-red-300"
                      }`}
                    >
                      ❌ Falta
                    </button>
                    <Link href={`/aluno/${a.id}`} className="btn btn-ghost btn-sm px-1.5" title="Ver perfil">👤</Link>
                    <button onClick={() => { setEditarAluno(a); setEditNome(a.nome); setEditTurma(a.turma_nome) }} className="btn btn-ghost btn-sm px-1.5" title="Editar aluno">✏️</button>
                    <button onClick={() => setDeleteConfirmId(a.id)} className="btn btn-ghost btn-sm px-1.5 text-red-400 hover:text-red-600" title="Remover aluno">🗑️</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-t border-zinc-100 px-5 py-3.5 text-sm text-zinc-500 bg-gradient-to-r from-zinc-50/80 to-white flex justify-between">
            <span className="font-medium">{alunosFiltrados.length} alunos</span>
            <span>
              <span className="text-red-600 font-semibold">{alunosFiltrados.filter(a => !(faltas[a.id] ?? true)).length} faltas</span>
              <span className="mx-1.5">·</span>
              <span className="text-emerald-600 font-semibold">{alunosFiltrados.filter(a => faltas[a.id] ?? true).length} presentes</span>
            </span>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editarAluno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setEditarAluno(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-zinc-800">✏️ Editar — {editarAluno.nome}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-500">Nome completo</label>
                <input type="text" value={editNome} onChange={e => setEditNome(e.target.value)} className="input" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-500">Turma</label>
                <select value={editTurma} onChange={e => setEditTurma(e.target.value)} className="select">
                  {turmasUnicas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditarAluno(null)} className="btn btn-ghost btn-sm">Cancelar</button>
              <button onClick={async () => {
                if (!editarAluno) return
                await atualizarAluno(editarAluno.id, { nome: editNome, turma_nome: editTurma })
                setAlunos(prev => prev.map(a => a.id === editarAluno.id ? { ...a, nome: editNome, turma_nome: editTurma } : a))
                setEditarAluno(null)
                setSalvo(true)
                setTimeout(() => setSalvo(false), 2000)
              }} className="btn btn-primary btn-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="mb-2 text-lg font-bold text-red-600">🗑️ Remover aluno</h3>
            <p className="text-sm text-zinc-600">
              Tem certeza? O aluno será removido de <strong>todas</strong> as listas, notas e chamadas.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-ghost btn-sm">Cancelar</button>
              <button onClick={async () => {
                await removerAlunoCompleto(deleteConfirmId)
                setAlunos(prev => prev.filter(a => a.id !== deleteConfirmId))
                setFaltas(prev => { const n = { ...prev }; delete n[deleteConfirmId]; return n })
                setDeleteConfirmId(null)
                setSalvo(true)
                setTimeout(() => setSalvo(false), 2000)
              }} className="btn btn-danger btn-sm">Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
