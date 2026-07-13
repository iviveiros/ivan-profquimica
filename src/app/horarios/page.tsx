"use client"

import { useState, useEffect } from "react"
import { getEscolasComGrade, salvarGrade, criarEscola, removerEscola } from "@/services/horarios"
import type { Aula, DiaSemana, Grade, EscolaComGrade } from "@/services/horarios"

const DIAS: { key: DiaSemana; label: string; labelShort: string }[] = [
  { key: "segunda", label: "Segunda-feira", labelShort: "Seg" },
  { key: "terca", label: "Terça-feira", labelShort: "Ter" },
  { key: "quarta", label: "Quarta-feira", labelShort: "Qua" },
  { key: "quinta", label: "Quinta-feira", labelShort: "Qui" },
  { key: "sexta", label: "Sexta-feira", labelShort: "Sex" },
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

function corDaTurma(turma: string): { bg: string; border: string; text: string; dot: string; label: string } {
  if (turma.includes("9º") || turma.includes("9o")) return { bg: "bg-amber-50 border-amber-200 hover:border-amber-400", border: "border-amber-200", text: "text-amber-800", dot: "bg-amber-500", label: "amber" }
  if (turma.includes("1ª") || turma.includes("1º") || turma.includes("1a")) return { bg: "bg-blue-50 border-blue-200 hover:border-blue-400", border: "border-blue-200", text: "text-blue-800", dot: "bg-blue-500", label: "blue" }
  if (turma.includes("2ª") || turma.includes("2º") || turma.includes("2a")) return { bg: "bg-violet-50 border-violet-200 hover:border-violet-400", border: "border-violet-200", text: "text-violet-800", dot: "bg-violet-500", label: "violet" }
  if (turma.includes("3ª") || turma.includes("3º") || turma.includes("3a")) return { bg: "bg-emerald-50 border-emerald-200 hover:border-emerald-400", border: "border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500", label: "emerald" }
  return { bg: "bg-zinc-50 border-zinc-200 hover:border-zinc-400", border: "border-zinc-200", text: "text-zinc-800", dot: "bg-zinc-500", label: "zinc" }
}

const hojeIdx = new Date().getDay() - 1

export default function Horarios() {
  const [escolas, setEscolas] = useState<EscolaComGrade[]>([])
  const [escolaAtiva, setEscolaAtiva] = useState("")
  const [editando, setEditando] = useState(false)
  const [editCelula, setEditCelula] = useState<{ dia: DiaSemana; idx: number } | null>(null)
  const [editForm, setEditForm] = useState<Aula>({ inicio: "", fim: "", materia: "Química", turma: "" })
  const [novaEscolaNome, setNovaEscolaNome] = useState("")
  const [mostrarNovaEscola, setMostrarNovaEscola] = useState(false)
  const [turmasList, setTurmasList] = useState<string[]>([])
  const [erro, setErro] = useState("")
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregarEscolas()
    const t = localStorage.getItem("ivan-turmas")
    if (t) { try { setTurmasList(JSON.parse(t)) } catch {} }
  }, [])

  async function carregarEscolas() {
    try {
      const data = await getEscolasComGrade()
      setEscolas(data)
      if (data.length && !escolaAtiva) setEscolaAtiva(data[0].id)
    } catch { setErro("Erro ao carregar escolas") }
  }

  const escolaAtual = escolas.find(e => e.id === escolaAtiva)

  async function atualizarGrade(novaGrade: Grade) {
    if (!escolaAtual) return
    setSalvando(true); setErro("")
    try {
      await salvarGrade(escolaAtual.id, novaGrade)
      setEscolas(prev => prev.map(e => e.id === escolaAtual.id ? { ...e, grade: novaGrade } : e))
    } catch { setErro("Erro ao salvar grade") }
    setSalvando(false)
  }

  async function adicionarEscolaHandler() {
    if (!novaEscolaNome.trim()) return
    if (escolas.some(e => e.nome.toLowerCase() === novaEscolaNome.trim().toLowerCase())) { alert("Já existe uma escola com esse nome."); return }
    setErro("")
    try {
      const nova = await criarEscola(novaEscolaNome.trim())
      setEscolas(prev => [...prev, nova])
      setEscolaAtiva(nova.id)
      setNovaEscolaNome(""); setMostrarNovaEscola(false)
    } catch { setErro("Erro ao criar escola") }
  }

  async function removerEscolaHandler() {
    if (escolas.length <= 1) { alert("Precisa ter pelo menos uma escola."); return }
    if (!escolaAtual) return
    if (!confirm(`Remover "${escolaAtual.nome}"?`)) return
    setErro("")
    try {
      await removerEscola(escolaAtual.id)
      const restantes = escolas.filter(e => e.id !== escolaAtual.id)
      setEscolas(restantes); setEscolaAtiva(restantes[0].id)
    } catch { setErro("Erro ao remover escola") }
  }

  function abrirEdicao(dia: DiaSemana, idx: number, aula: Aula | null) {
    setEditCelula({ dia, idx })
    setEditForm(aula || { inicio: HORARIOS_BASE[idx].inicio, fim: HORARIOS_BASE[idx].fim, materia: "Química", turma: "" })
  }

  function salvarEdicao() {
    if (!editCelula || !escolaAtual) return
    const grade = JSON.parse(JSON.stringify(escolaAtual.grade)) as Grade
    if (editForm.turma.trim()) {
      grade[editCelula.dia][editCelula.idx] = { ...editForm }
      if (!turmasList.includes(editForm.turma)) {
        const nova = [...turmasList, editForm.turma]
        setTurmasList(nova)
        localStorage.setItem("ivan-turmas", JSON.stringify(nova))
      }
    } else {
      grade[editCelula.dia][editCelula.idx] = null
    }
    atualizarGrade(grade)
    setEditCelula(null)
  }

  function removerAula() {
    if (!editCelula || !escolaAtual) return
    const grade = JSON.parse(JSON.stringify(escolaAtual.grade)) as Grade
    grade[editCelula.dia][editCelula.idx] = null
    atualizarGrade(grade)
    setEditCelula(null)
  }

  function moverAula(origDia: DiaSemana, origIdx: number, destDia: DiaSemana) {
    if (!escolaAtual) return
    const grade = JSON.parse(JSON.stringify(escolaAtual.grade)) as Grade
    const aula = grade[origDia][origIdx]
    if (!aula) return
    const destIdx = grade[destDia].findIndex(x => x === null)
    if (destIdx === -1) return
    grade[destDia][destIdx] = { ...aula, inicio: HORARIOS_BASE[destIdx].inicio, fim: HORARIOS_BASE[destIdx].fim }
    grade[origDia][origIdx] = null
    atualizarGrade(grade)
  }

  if (!escolas.length && !erro) return <div className="card p-12 text-center"><p className="text-zinc-500">Carregando...</p></div>
  if (!escolaAtual) return <div className="card p-12 text-center"><p className="text-zinc-400">Nenhuma escola cadastrada. Crie uma abaixo.</p></div>

  const grade = escolaAtual.grade
  const total = Object.values(grade).flat().filter(Boolean).length

  return (
    <div className="space-y-6 animate-fade-in">
      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
          <button onClick={() => setErro("")} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">◈ Horários</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Grade kanban — {escolaAtual.nome}</p>
        </div>
        <div className="flex items-center gap-3">
          {salvando && <span className="badge badge-emerald animate-pulse">salvando...</span>}
          <button onClick={() => setEditando(!editando)}
            className={`btn ${editando ? "btn-primary shadow-lg shadow-emerald-200" : "btn-secondary"}`}>
            {editando ? "✅ Concluir" : "✏️ Editar"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏫</span>
          <select value={escolaAtiva} onChange={e => setEscolaAtiva(e.target.value)} className="select text-sm min-w-[150px]">
            {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>
        <div className="flex-1" />
        {!mostrarNovaEscola ? (
          <button onClick={() => setMostrarNovaEscola(true)} className="btn btn-secondary btn-sm">➕ Nova Escola</button>
        ) : (
          <div className="flex items-center gap-2">
            <input type="text" value={novaEscolaNome} onChange={e => setNovaEscolaNome(e.target.value)}
              placeholder="Nome da escola" className="input text-sm max-w-[180px]"
              onKeyDown={e => e.key === "Enter" && adicionarEscolaHandler()} />
            <button onClick={adicionarEscolaHandler} className="btn btn-primary btn-sm">Adicionar</button>
            <button onClick={() => setMostrarNovaEscola(false)} className="btn btn-ghost btn-sm">Cancelar</button>
          </div>
        )}
        <button onClick={removerEscolaHandler} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50" title="Remover escola">🗑️</button>
      </div>

      {/* Stats */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <div className="card shrink-0 px-5 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total</p>
          <p className="text-lg font-black text-emerald-600">{total}</p>
        </div>
        <div className="card shrink-0 px-5 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Turmas</p>
          <p className="text-lg font-black text-emerald-600">{new Set(Object.values(grade).flat().filter((a): a is Aula => a !== null).map(a => a.turma)).size}</p>
        </div>
        <div className="flex gap-2 ml-auto items-center">
          <span className="inline-block h-3 w-3 rounded-full bg-amber-500" title="9º Ano" />
          <span className="text-[11px] text-zinc-500">9º</span>
          <span className="inline-block h-3 w-3 rounded-full bg-blue-500" title="1º Ano" />
          <span className="text-[11px] text-zinc-500">1º</span>
          <span className="inline-block h-3 w-3 rounded-full bg-violet-500" title="2º Ano" />
          <span className="text-[11px] text-zinc-500">2º</span>
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" title="3º Ano" />
          <span className="text-[11px] text-zinc-500">3º</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {DIAS.map((dia, di) => {
          const aulas = grade[dia.key].map((a, i) => ({ aula: a, idx: i })).filter(x => x.aula !== null)
          const vazios = grade[dia.key].map((a, i) => ({ aula: a, idx: i })).filter(x => x.aula === null)
          const ehHoje = di === hojeIdx
          return (
            <div key={dia.key} className={`card overflow-hidden transition-all ${ehHoje ? "ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-200/30" : ""}`}>
              {/* Column Header */}
              <div className={`px-4 py-3 border-b border-zinc-200/60 ${ehHoje ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-zinc-50/80"}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-extrabold tracking-tight ${ehHoje ? "text-white" : "text-zinc-800"}`}>
                    {dia.label}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {ehHoje && <span className="badge bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">hoje</span>}
                    <span className={`text-[11px] font-semibold ${ehHoje ? "text-white/70" : "text-zinc-400"}`}>
                      {aulas.length} {aulas.length === 1 ? "aula" : "aulas"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-2 p-3 min-h-[200px]">
                {/* Scheduled aulas */}
                {aulas.sort((a, b) => HORARIOS_BASE.findIndex(h => h.inicio === a.aula!.inicio) - HORARIOS_BASE.findIndex(h => h.inicio === b.aula!.inicio)).map(({ aula, idx }) => {
                  const cores = corDaTurma(aula!.turma)
                  return (
                    <div key={idx}
                      className={`group relative rounded-xl border ${cores.bg} ${cores.border} ${editando ? "cursor-pointer hover:shadow-md active:scale-[0.98]" : "cursor-default"} transition-all duration-150`}
                      onClick={() => editando && abrirEdicao(dia.key, idx, aula)}>
                      {/* Time badge */}
                      <div className="absolute -top-2 -right-2 rounded-full bg-white border border-zinc-200 px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-500 shadow-sm">
                        {aula!.inicio}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${cores.dot}`} />
                          <p className={`text-sm font-bold leading-tight ${cores.text}`}>{aula!.materia}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[11px] font-semibold text-zinc-500">{aula!.turma}</span>
                          <span className="text-[10px] font-mono text-zinc-400">{aula!.inicio}–{aula!.fim}</span>
                        </div>
                      </div>
                      {/* Drag handle in edit mode */}
                      {editando && (
                        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <select onChange={e => { if (e.target.value) { moverAula(dia.key, idx, e.target.value as DiaSemana); e.target.value = "" } }} className="text-[10px] text-zinc-400 bg-transparent border-none outline-none cursor-pointer" onClick={e => e.stopPropagation()}>
                            <option value="">Mover para...</option>
                            {DIAS.filter(d => d.key !== dia.key).map(d => <option key={d.key} value={d.key}>{d.labelShort}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Empty slots (add zone in edit mode) */}
                {editando && vazios.map(({ idx }) => (
                  <div key={`v-${idx}`}
                    className="rounded-xl border-2 border-dashed border-zinc-200 p-3 text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                    onClick={() => abrirEdicao(dia.key, idx, null)}>
                    <span className="text-xs font-semibold text-zinc-300 hover:text-emerald-500">
                      + {HORARIOS_BASE[idx].inicio}
                    </span>
                  </div>
                ))}

                {!aulas.length && !editando && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <span className="text-2xl mb-1 opacity-20">—</span>
                    <p className="text-xs text-zinc-300">Sem aulas</p>
                  </div>
                )}
              </div>


            </div>
          )
        })}
      </div>

      {/* Interval bar */}
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
