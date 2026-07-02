"use client"

import { useState, useEffect, useCallback } from "react"

type Aula = {
  inicio: string
  fim: string
  materia: string
  turma: string
}

type DiaSemana = "segunda" | "terca" | "quarta" | "quinta" | "sexta"

const DIAS: { key: DiaSemana; label: string }[] = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
]

const HORARIOS_PADRAO = [
  { inicio: "07:00", fim: "07:45" },
  { inicio: "07:45", fim: "08:30" },
  { inicio: "08:30", fim: "09:15" },
  { inicio: "09:15", fim: "10:00" },
  { inicio: "10:20", fim: "11:05" },
  { inicio: "11:05", fim: "11:50" },
  { inicio: "11:50", fim: "12:35" },
]

type Grade = Record<DiaSemana, (Aula | null)[]>

const GRADE_PADRAO: Grade = {
  segunda: [null, null, null, null, null, null, null],
  terca: [null, null, null, null, null, null, null],
  quarta: [null, null, null, null, null, null, null],
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
}

export default function Horarios() {
  const [grade, setGrade] = useState<Grade>(GRADE_PADRAO)
  const [editando, setEditando] = useState(false)
  const [editCelula, setEditCelula] = useState<{ dia: DiaSemana; idx: number } | null>(null)
  const [editForm, setEditForm] = useState<Aula>({ inicio: "", fim: "", materia: "", turma: "" })
  const [turmasList, setTurmasList] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("ivan-grade")
    if (saved) {
      try { setGrade(JSON.parse(saved)) } catch {}
    }
    const t = localStorage.getItem("ivan-turmas")
    if (t) {
      try { setTurmasList(JSON.parse(t)) } catch {}
    }
  }, [])

  const salvar = useCallback((g: Grade) => {
    localStorage.setItem("ivan-grade", JSON.stringify(g))
  }, [])

  const salvarTurmas = useCallback((list: string[]) => {
    setTurmasList(list)
    localStorage.setItem("ivan-turmas", JSON.stringify(list))
  }, [])

  function abrirEdicao(dia: DiaSemana, idx: number, aula: Aula | null) {
    setEditCelula({ dia, idx })
    setEditForm(aula || { inicio: HORARIOS_PADRAO[idx].inicio, fim: HORARIOS_PADRAO[idx].fim, materia: "Química", turma: "" })
  }

  function salvarEdicao() {
    if (!editCelula) return
    const nova = { ...grade }
    if (editForm.turma.trim()) {
      nova[editCelula.dia][editCelula.idx] = { ...editForm }
      if (!turmasList.includes(editForm.turma)) {
        salvarTurmas([...turmasList, editForm.turma])
      }
    } else {
      nova[editCelula.dia][editCelula.idx] = null
    }
    setGrade(nova)
    salvar(nova)
    setEditCelula(null)
  }

  function removerAula() {
    if (!editCelula) return
    const nova = { ...grade }
    nova[editCelula.dia][editCelula.idx] = null
    setGrade(nova)
    salvar(nova)
    setEditCelula(null)
  }

  function totalAulas() {
    let count = 0
    for (const d of DIAS) {
      for (const a of grade[d.key]) {
        if (a) count++
      }
    }
    return count
  }

  function diasComAula() {
    let count = 0
    for (const d of DIAS) {
      if (grade[d.key].some(a => a !== null)) count++
    }
    return count
  }

  function turmasUnicas() {
    const set = new Set<string>()
    for (const d of DIAS) {
      for (const a of grade[d.key]) {
        if (a?.turma) set.add(a.turma)
      }
    }
    return set.size
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">📅 Horários de Aula</h1>
          <p className="mt-1 text-sm text-zinc-500">Grade semanal — Ivan_ProfQuímica</p>
        </div>
        <button
          onClick={() => setEditando(!editando)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            editando ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border bg-white text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          {editando ? "✅ Concluir Edição" : "✏️ Editar"}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Total Semanal</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{totalAulas()} aulas</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Dias com Aula</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{diasComAula()} dias</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Turmas</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{turmasUnicas()} turmas</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Carga Horária</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{totalAulas()}h/sem</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-zinc-50">
              <th className="px-4 py-3 text-left font-semibold text-zinc-500 w-28">Horário</th>
              {DIAS.map((d) => (
                <th key={d.key} className="px-3 py-3 text-center font-semibold text-zinc-500">{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORARIOS_PADRAO.map((horario, idx) => (
              <tr key={idx} className="border-b last:border-b-0 hover:bg-zinc-50/50">
                <td className="px-4 py-3 font-mono text-xs text-zinc-400 whitespace-nowrap">
                  {horario.inicio} — {horario.fim}
                </td>
                {DIAS.map((d) => {
                  const aula = grade[d.key][idx]
                  return (
                    <td
                      key={d.key}
                      className={`px-2 py-2 text-center ${editando ? "cursor-pointer" : ""}`}
                      onClick={() => editando && abrirEdicao(d.key, idx, aula)}
                    >
                      {aula ? (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-2 transition-colors hover:border-emerald-400">
                          <p className="text-xs font-bold text-emerald-800">{aula.materia}</p>
                          <p className="text-[11px] font-medium text-emerald-600">{aula.turma}</p>
                        </div>
                      ) : (
                        editando ? (
                          <div className="rounded-lg border-2 border-dashed border-zinc-200 px-2 py-2 text-xs text-zinc-300 hover:border-emerald-300 hover:text-emerald-400 transition-colors">
                            + Adicionar
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-200">—</span>
                        )
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border bg-amber-50 border-amber-200 p-4 text-center">
        <p className="text-sm font-medium text-amber-800">☕ Intervalo: 10:00 — 10:20</p>
      </div>

      {/* Modal de edição */}
      {editCelula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setEditCelula(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-zinc-800">
              {editForm.turma ? "Editar Aula" : "Adicionar Aula"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Matéria</label>
                <input
                  type="text"
                  value={editForm.materia}
                  onChange={(e) => setEditForm({ ...editForm, materia: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="Ex: Química"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">Turma</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editForm.turma}
                    onChange={(e) => setEditForm({ ...editForm, turma: e.target.value })}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                    placeholder="Ex: 1ª EM"
                    list="turmas-suggest"
                  />
                  <datalist id="turmas-suggest">
                    {turmasList.map((t) => <option key={t} value={t} />)}
                  </datalist>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Início</label>
                  <input
                    type="time"
                    value={editForm.inicio}
                    onChange={(e) => setEditForm({ ...editForm, inicio: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-zinc-500">Fim</label>
                  <input
                    type="time"
                    value={editForm.fim}
                    onChange={(e) => setEditForm({ ...editForm, fim: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={removerAula} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Remover</button>
              <div className="flex-1" />
              <button onClick={() => setEditCelula(null)} className="rounded-lg border px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50">Cancelar</button>
              <button onClick={salvarEdicao} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
