"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2 } from "lucide-react"
import { getAppData, saveAppData, loadGradesFromSupabase, syncGradesToSupabase } from "@/services/horarios"
import type { Aula, DiaSemana, Grade } from "@/services/horarios"

const DIAS: { key: DiaSemana; label: string }[] = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
]

const HORARIOS_BASE = [
  { inicio: "07:00", fim: "07:45" },
  { inicio: "07:45", fim: "08:30" },
  { inicio: "08:30", fim: "09:15" },
  { inicio: "09:15", fim: "10:00" },
  { inicio: "10:20", fim: "11:05" },
  { inicio: "11:05", fim: "11:50" },
  { inicio: "11:50", fim: "12:35" },
]

function gradeVazia(): Grade {
  const g = {} as Grade
  for (const d of DIAS) g[d.key] = [null, null, null, null, null, null, null]
  return g
}

const ESCOLA_IEFA = {
  id: "iefa", nome: "IEFA",
  grade: {
    segunda: [null, null, null, null, null, null, null] as (Aula | null)[],
    terca: [null, null, null, null, null, null, null] as (Aula | null)[],
    quarta: [null, null, null, null, null, null, null] as (Aula | null)[],
    quinta: [
      { inicio: "07:00", fim: "07:45", materia: "Química", turma: "3ª EM" },
      { inicio: "07:45", fim: "08:30", materia: "Química", turma: "1ª EM" },
      { inicio: "08:30", fim: "09:15", materia: "Química", turma: "9º ANO" },
      { inicio: "09:15", fim: "10:00", materia: "Química", turma: "9º ANO" },
      { inicio: "10:20", fim: "11:05", materia: "Química", turma: "3ª EM" },
      { inicio: "11:05", fim: "11:50", materia: "Química", turma: "2ª EM" },
      { inicio: "11:50", fim: "12:35", materia: "Química", turma: "2ª EM" },
    ],
    sexta: [
      { inicio: "07:00", fim: "07:45", materia: "Química", turma: "1ª EM" },
      { inicio: "07:45", fim: "08:30", materia: "Química", turma: "2ª EM" },
      { inicio: "08:30", fim: "09:15", materia: "Química", turma: "2ª EM" },
      { inicio: "09:15", fim: "10:00", materia: "Química", turma: "1ª EM" },
      { inicio: "10:20", fim: "11:05", materia: "Química", turma: "3ª EM" },
      { inicio: "11:05", fim: "11:50", materia: "Química", turma: "3ª EM" },
      { inicio: "11:50", fim: "12:35", materia: "Química", turma: "1ª EM" },
    ],
  } as Grade,
}

type EscolaLocal = { id: string; nome: string; grade: Grade }
type AppData = { escolas: EscolaLocal[]; escolaAtiva: string }

export default function Horarios() {
  const [appData, setAppData] = useState<AppData>({ escolas: [], escolaAtiva: "" })
  const [editando, setEditando] = useState(false)
  const [editCelula, setEditCelula] = useState<{ dia: DiaSemana; idx: number } | null>(null)
  const [editForm, setEditForm] = useState<Aula>({ inicio: "", fim: "", materia: "Química", turma: "" })
  const [novaEscolaNome, setNovaEscolaNome] = useState("")
  const [mostrarNovaEscola, setMostrarNovaEscola] = useState(false)
  const [turmasList, setTurmasList] = useState<string[]>([])
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState("")

  useEffect(() => {
    const stored = getAppData()
    if (stored) {
      setAppData(stored)
    } else {
      const initial: AppData = { escolas: [ESCOLA_IEFA], escolaAtiva: "iefa" }
      setAppData(initial)
      saveAppData(initial)
    }
    const t = localStorage.getItem("ivan-turmas")
    if (t) { try { setTurmasList(JSON.parse(t)) } catch {} }
  }, [])

  const persistAppData = useCallback((data: AppData) => {
    saveAppData(data)
  }, [])

  const escolaAtual = appData.escolas.find(e => e.id === appData.escolaAtiva)

  function atualizarGrade(novaGrade: Grade) {
    const data = { ...appData, escolas: appData.escolas.map(e => e.id === appData.escolaAtiva ? { ...e, grade: novaGrade } : e) }
    setAppData(data)
    persistAppData(data)
  }

  function switchEscola(id: string) {
    const data = { ...appData, escolaAtiva: id }
    setAppData(data)
    persistAppData(data)
  }

  function adicionarEscola() {
    if (!novaEscolaNome.trim()) return
    const id = novaEscolaNome.toLowerCase().replace(/\s+/g, "-")
    if (appData.escolas.some(e => e.id === id)) { alert("Já existe uma escola com esse nome."); return }
    const nova: EscolaLocal = { id, nome: novaEscolaNome.trim(), grade: gradeVazia() }
    const data = { escolas: [...appData.escolas, nova], escolaAtiva: id }
    setAppData(data); persistAppData(data)
    setNovaEscolaNome(""); setMostrarNovaEscola(false)
  }

  function removerEscola(id: string) {
    if (appData.escolas.length <= 1) { alert("Precisa ter pelo menos uma escola."); return }
    const data = { escolas: appData.escolas.filter(e => e.id !== id), escolaAtiva: appData.escolas.find(e => e.id !== id)!.id }
    setAppData(data); persistAppData(data)
  }

  function abrirEdicao(dia: DiaSemana, idx: number, aula: Aula | null) {
    setEditCelula({ dia, idx })
    setEditForm(aula || { inicio: HORARIOS_BASE[idx].inicio, fim: HORARIOS_BASE[idx].fim, materia: "Química", turma: "" })
  }

  function salvarEdicao() {
    if (!editCelula || !escolaAtual) return
    const grade = { ...escolaAtual.grade }
    if (editForm.turma.trim()) {
      grade[editCelula.dia][editCelula.idx] = { ...editForm }
      if (!turmasList.includes(editForm.turma)) {
        setTurmasList([...turmasList, editForm.turma])
        localStorage.setItem("ivan-turmas", JSON.stringify([...turmasList, editForm.turma]))
      }
    } else {
      grade[editCelula.dia][editCelula.idx] = null
    }
    atualizarGrade(grade)
    setEditCelula(null)
  }

  function removerAula() {
    if (!editCelula || !escolaAtual) return
    const grade = { ...escolaAtual.grade }
    grade[editCelula.dia][editCelula.idx] = null
    atualizarGrade(grade)
    setEditCelula(null)
  }

  async function syncToCloud() {
    setSyncing(true)
    setSyncMsg("")
    try {
      const data = getAppData()
      if (data) {
        await syncGradesToSupabase(data)
        setSyncMsg("✅ Sincronizado com a nuvem!")
      }
    } catch {
      setSyncMsg("Erro ao sincronizar")
    }
    setSyncing(false)
    setTimeout(() => setSyncMsg(""), 3000)
  }

  if (!escolaAtual) return (
    <div className="card p-12 text-center">
      <p className="text-zinc-400">Nenhuma escola cadastrada.</p>
    </div>
  )

  const grade = escolaAtual.grade
  const total = Object.values(grade).flat().filter(Boolean).length
  const diasComAula = DIAS.filter(d => grade[d.key].some(a => a)).length
  const turmasSet = new Set(Object.values(grade).flat().filter((a): a is Aula => a !== null).map(a => a.turma))

  return (
    <div className="space-y-6 animate-fade-in">
      {syncMsg && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 text-center">{syncMsg}</div>}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">◈ Horários</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Grade semanal de aulas — {escolaAtual.nome}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={syncToCloud} disabled={syncing} className="btn btn-secondary btn-sm" title="Sincronizar horários com a nuvem">
            {syncing ? "Sincronizando..." : "☁️ Sync"}
          </button>
          <button onClick={() => setEditando(!editando)}
            className={`btn ${editando ? "btn-primary" : "btn-secondary"}`}>
            {editando ? "✅ Concluir" : "✏️ Editar"}
          </button>
        </div>
      </div>

      {/* School Selector */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-500">🏫</span>
          <select value={appData.escolaAtiva} onChange={e => switchEscola(e.target.value)} className="select text-sm min-w-[120px]">
            {appData.escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>
        <div className="flex-1" />
        {!mostrarNovaEscola ? (
          <button onClick={() => setMostrarNovaEscola(true)} className="btn btn-secondary btn-sm">
            <Plus size={16} /> Nova Escola
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input type="text" value={novaEscolaNome} onChange={e => setNovaEscolaNome(e.target.value)}
              placeholder="Nome da escola" className="input text-sm max-w-[180px]"
              onKeyDown={e => e.key === "Enter" && adicionarEscola()} />
            <button onClick={adicionarEscola} className="btn btn-primary btn-sm">Adicionar</button>
            <button onClick={() => setMostrarNovaEscola(false)} className="btn btn-ghost btn-sm">Cancelar</button>
          </div>
        )}
        <button onClick={() => removerEscola(appData.escolaAtiva)} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50" title="Remover escola">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Mini Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="card p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Semanal</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{total} aulas</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Dias com Aula</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{diasComAula} dias</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Turmas</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{turmasSet.size} turmas</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Carga Horária</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{total}h/sem</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200/60 bg-zinc-50/50">
                <th className="px-4 py-3.5 text-left font-semibold text-zinc-500 w-28">Horário</th>
                {DIAS.map(d => <th key={d.key} className="px-3 py-3.5 text-center font-semibold text-zinc-500">{d.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {HORARIOS_BASE.map((hr, idx) => (
                <tr key={idx} className="border-b border-zinc-100 last:border-b-0 row-hover">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400 whitespace-nowrap">{hr.inicio} — {hr.fim}</td>
                  {DIAS.map(d => {
                    const aula = grade[d.key][idx]
                    return (
                      <td key={d.key} className={`px-2 py-2 text-center ${editando ? "cursor-pointer" : ""}`}
                        onClick={() => editando && abrirEdicao(d.key, idx, aula)}>
                        {aula ? (
                          <div className="mx-auto max-w-[140px] rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200/60 px-2.5 py-2.5 transition-all hover:border-emerald-400 hover:shadow-sm">
                            <p className="text-xs font-bold text-emerald-800">{aula.materia}</p>
                            <p className="text-[11px] font-semibold text-emerald-600">{aula.turma}</p>
                          </div>
                        ) : editando ? (
                          <div className="mx-auto max-w-[140px] rounded-xl border-2 border-dashed border-zinc-200 px-2.5 py-2.5 text-xs text-zinc-300 hover:border-emerald-300 hover:text-emerald-400 transition-all">
                            + Adicionar
                          </div>
                        ) : <span className="text-xs text-zinc-200">—</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intervalo Notice */}
      <div className="card p-4 bg-gradient-to-r from-amber-50/80 to-amber-50/30 border-amber-200/50 text-center">
        <p className="text-sm font-medium text-amber-800">☕ Intervalo: 10:00 — 10:20</p>
      </div>

      {/* Edit Modal */}
      {editCelula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setEditCelula(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-zinc-800">{editForm.turma ? "Editar Aula" : "Nova Aula"}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-500">Matéria</label>
                <input type="text" value={editForm.materia} onChange={e => setEditForm({ ...editForm, materia: e.target.value })} className="input" placeholder="Ex: Química" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-500">Turma</label>
                <input type="text" value={editForm.turma} onChange={e => setEditForm({ ...editForm, turma: e.target.value })} className="input" placeholder="Ex: 1ª EM" list="turmas-suggest" />
                <datalist id="turmas-suggest">{turmasList.map(t => <option key={t} value={t} />)}</datalist>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">Início</label>
                  <input type="time" value={editForm.inicio} onChange={e => setEditForm({ ...editForm, inicio: e.target.value })} className="input" />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-zinc-500">Fim</label>
                  <input type="time" value={editForm.fim} onChange={e => setEditForm({ ...editForm, fim: e.target.value })} className="input" />
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={removerAula} className="btn btn-danger btn-sm">Remover</button>
              <div className="flex-1" />
              <button onClick={() => setEditCelula(null)} className="btn btn-ghost btn-sm">Cancelar</button>
              <button onClick={salvarEdicao} className="btn btn-primary btn-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
