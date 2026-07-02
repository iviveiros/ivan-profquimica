"use client"

import { useState } from "react"

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

const GRADE_INICIAL: Record<DiaSemana, (Aula | null)[]> = {
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
  const [grade] = useState(GRADE_INICIAL)
  const [editando, setEditando] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">📅 Horários de Aula</h1>
          <p className="mt-1 text-sm text-zinc-500">Grade semanal — Ivan_ProfQuímica</p>
        </div>
        <button
          onClick={() => setEditando(!editando)}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          {editando ? "Concluído" : "Editar"}
        </button>
      </div>

      {/* Card de resumo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Total Semanal</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">14 aulas</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Dias com Aula</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">2 dias</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Turmas</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">3 turmas</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Carga Horária</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">14h/sem</p>
        </div>
      </div>

      {/* Grade */}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-zinc-50">
              <th className="px-4 py-3 text-left font-semibold text-zinc-500 w-28">Horário</th>
              {DIAS.map((d) => (
                <th key={d.key} className="px-3 py-3 text-center font-semibold text-zinc-500">
                  {d.label}
                </th>
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
                    <td key={d.key} className="px-2 py-2 text-center">
                      {aula ? (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-2">
                          <p className="text-xs font-bold text-emerald-800">{aula.materia}</p>
                          <p className="text-[11px] font-medium text-emerald-600">{aula.turma}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-300">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Intervalo */}
      <div className="rounded-xl border bg-amber-50 border-amber-200 p-4 text-center">
        <p className="text-sm font-medium text-amber-800">
          ☕ Intervalo: 10:00 — 10:20
        </p>
      </div>

      {/* Rodapé */}
      <div className="text-center text-xs text-zinc-400">
        {editando ? "Clique nas células para editar os horários" : "Os dados foram extraídos da grade de horários via IA (Gemini)"}
      </div>
    </div>
  )
}
