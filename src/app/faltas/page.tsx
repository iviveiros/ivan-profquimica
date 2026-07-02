"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Aluno = { id: string; nome: string; turma_nome: string }
type FaltasMap = Record<string, boolean> // aluno_id -> presente

export default function Faltas() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [escolas, setEscolas] = useState<{ id: string; nome: string }[]>([])
  const [escolaId, setEscolaId] = useState("")
  const [turma, setTurma] = useState("")
  const [data, setData] = useState(new Date().toISOString().split("T")[0])
  const [faltas, setFaltas] = useState<FaltasMap>({})
  const [salvo, setSalvo] = useState(false)
  const [todasPresentes, setTodasPresentes] = useState(true)

  useEffect(() => {
    supabase.from("escolas").select("id, nome").then(({ data }) => {
      if (data?.length) { setEscolas(data); setEscolaId(data[0].id) }
    })
  }, [])

  useEffect(() => {
    if (!escolaId) return
    supabase.from("alunos").select("id, nome, turma_nome").eq("escola_id", escolaId).order("nome").then(({ data }) => {
      if (data) setAlunos(data)
    })
  }, [escolaId])

  useEffect(() => {
    if (!turma || !data) return
    supabase.from("alunos").select("id, nome, turma_nome").eq("escola_id", escolaId).eq("turma_nome", turma).order("nome").then(({ data }) => {
      if (data) {
        setAlunos(data)
        carregarFaltas(data, data)
      }
    })
  }, [turma, data])

  async function carregarFaltas(alunosList: Aluno[], _orig?: Aluno[]) {
    const ids = alunosList.map(a => a.id)
    if (!ids.length) return
    const { data: registros } = await supabase.from("faltas").select("aluno_id, presente").in("aluno_id", ids).eq("data", data)
    const map: FaltasMap = {}
    if (registros) {
      for (const r of registros) map[r.aluno_id] = r.presente
    }
    setFaltas(map)
    setTodasPresentes(Object.values(map).every(v => v !== false))
  }

  async function togglePresenca(alunoId: string, presente: boolean) {
    // Remove registro se estiver marcando presença (padrão), senão insere falta
    if (presente) {
      await supabase.from("faltas").delete().eq("aluno_id", alunoId).eq("data", data)
    } else {
      await supabase.from("faltas").upsert({ aluno_id: alunoId, data, presente: false }, { onConflict: "aluno_id,data" })
    }
    setFaltas(prev => ({ ...prev, [alunoId]: presente }))
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  async function marcarTodasPresentes() {
    if (!alunos.length) return
    await supabase.from("faltas").delete().in("aluno_id", alunos.map(a => a.id)).eq("data", data)
    const map: FaltasMap = {}
    for (const a of alunos) map[a.id] = true
    setFaltas(map)
    setTodasPresentes(true)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  const turmasUnicas = [...new Set(alunos.map(a => a.turma_nome))].sort()
  const alunosFiltrados = turma ? alunos.filter(a => a.turma_nome === turma) : alunos

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📋 Chamada / Faltas</h1>
          <p className="mt-1 text-sm text-slate-500">Registro diário de presença</p>
        </div>
        {salvo && <span className="badge badge-emerald animate-fade-in">✓ Salvo</span>}
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <select value={escolaId} onChange={e => setEscolaId(e.target.value)} className="select text-sm">
          {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <select value={turma} onChange={e => setTurma(e.target.value)} className="select text-sm">
          <option value="">Todas as turmas</option>
          {turmasUnicas.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="date" value={data} onChange={e => setData(e.target.value)} className="select text-sm" />
        <button onClick={marcarTodasPresentes} className="btn btn-outline text-xs ml-auto">✓ Todos presentes</button>
      </div>

      {!alunosFiltrados.length ? (
        <div className="card p-12 text-center text-slate-400">
          Selecione uma turma para fazer a chamada
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-100">
            {alunosFiltrados.map((a, i) => {
              const presente = faltas[a.id] ?? true
              return (
                <div key={a.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 w-5">{i + 1}</span>
                    <p className="text-sm font-medium text-slate-800">{a.nome}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => togglePresenca(a.id, true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        presente ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-white text-slate-400 border border-slate-200 hover:bg-emerald-50"
                      }`}
                    >
                      ✅ Presente
                    </button>
                    <button
                      onClick={() => togglePresenca(a.id, false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        !presente ? "bg-red-100 text-red-700 border border-red-300" : "bg-white text-slate-400 border border-slate-200 hover:bg-red-50"
                      }`}
                    >
                      ❌ Falta
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-t border-slate-100 px-5 py-3 text-sm text-slate-500 bg-slate-50/50">
            {alunosFiltrados.filter(a => !(faltas[a.id] ?? true)).length} faltas · {alunosFiltrados.filter(a => faltas[a.id] ?? true).length} presentes
          </div>
        </div>
      )}
    </div>
  )
}
