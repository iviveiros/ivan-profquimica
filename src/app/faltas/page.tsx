"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Aluno = { id: string; nome: string; turma_nome: string }
type FaltasMap = Record<string, boolean>

export default function Faltas() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [escolas, setEscolas] = useState<{ id: string; nome: string }[]>([])
  const [escolaId, setEscolaId] = useState("")
  const [escolaNome, setEscolaNome] = useState("")
  const [turma, setTurma] = useState("")
  const [data, setData] = useState(new Date().toISOString().split("T")[0])
  const [faltas, setFaltas] = useState<FaltasMap>({})
  const [salvo, setSalvo] = useState(false)
  const [todasPresentes, setTodasPresentes] = useState(true)

  useEffect(() => {
    supabase.from("escolas").select("id, nome").then(({ data }) => {
      if (data?.length) { setEscolas(data); setEscolaId(data[0].id); setEscolaNome(data[0].nome) }
    })
  }, [])

  useEffect(() => {
    if (!escolaId) return
    const e = escolas.find(x => x.id === escolaId)
    if (e) setEscolaNome(e.nome)
    supabase.from("alunos").select("id, nome, turma_nome").eq("escola_id", escolaId).order("nome").then(({ data }) => {
      if (data) setAlunos(data)
    })
  }, [escolaId])

  useEffect(() => {
    if (!turma || !data) return
    supabase.from("alunos").select("id, nome, turma_nome").eq("escola_id", escolaId).eq("turma_nome", turma).order("nome").then(({ data }) => {
      if (data) { setAlunos(data); carregarFaltas(data) }
    })
  }, [turma, data])

  async function carregarFaltas(alunosList: Aluno[]) {
    const ids = alunosList.map(a => a.id)
    if (!ids.length) return
    const { data: registros } = await supabase.from("faltas").select("aluno_id, presente").in("aluno_id", ids).eq("data", data)
    const map: FaltasMap = {}
    if (registros) for (const r of registros) map[r.aluno_id] = r.presente
    setFaltas(map)
    setTodasPresentes(Object.values(map).every(v => v !== false))
  }

  async function togglePresenca(alunoId: string, presente: boolean) {
    await supabase.from("faltas").delete().eq("aluno_id", alunoId).eq("data", data)
    if (!presente) {
      await supabase.from("faltas").insert({ aluno_id: alunoId, data, presente: false })
    }
    setFaltas(prev => ({ ...prev, [alunoId]: presente }))
    setTodasPresentes(Object.values({ ...faltas, [alunoId]: presente }).every(v => v !== false))
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

  const turmasUnicas = [...new Set(alunos.map(a => a.turma_nome))].sort()
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
        <button onClick={marcarTodasPresentes} className="btn btn-secondary btn-sm">✓ Todos presentes</button>
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
    </div>
  )
}
