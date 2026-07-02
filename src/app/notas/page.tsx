"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Aluno = { id: string; nome: string; turma_nome: string }
type Nota = { id: string; aluno_id: string; disciplina: string; valor: string; descricao: string; bimestre: number }

export default function Notas() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [escolas, setEscolas] = useState<{ id: string; nome: string }[]>([])
  const [escolaId, setEscolaId] = useState("")
  const [turma, setTurma] = useState("")
  const [disciplina, setDisciplina] = useState("Química")
  const [bimestre, setBimestre] = useState(1)
  const [notas, setNotas] = useState<Record<string, string>>({}) // aluno_id -> valor
  const [descricoes, setDescricoes] = useState<Record<string, string>>({})
  const [editAluno, setEditAluno] = useState<string | null>(null)
  const [editValor, setEditValor] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [salvo, setSalvo] = useState(false)

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
    if (!turma) return
    carregarNotas()
  }, [turma, disciplina, bimestre])

  async function carregarNotas() {
    const { data: alunosTurma } = await supabase.from("alunos").select("id, nome, turma_nome")
      .eq("escola_id", escolaId).eq("turma_nome", turma).order("nome")
    if (!alunosTurma?.length) return
    setAlunos(alunosTurma)

    const ids = alunosTurma.map(a => a.id)
    const { data: registros } = await supabase.from("notas")
      .select("*").in("aluno_id", ids).eq("disciplina", disciplina).eq("bimestre", bimestre)
    const mapV: Record<string, string> = {}
    const mapD: Record<string, string> = {}
    if (registros) {
      for (const r of registros) {
        mapV[r.aluno_id] = r.valor
        mapD[r.aluno_id] = r.descricao || ""
      }
    }
    setNotas(mapV)
    setDescricoes(mapD)
  }

  function iniciarEdicao(alunoId: string, valor: string, desc: string) {
    setEditAluno(alunoId)
    setEditValor(valor)
    setEditDesc(desc)
  }

  async function salvarNota() {
    if (!editAluno) return
    await supabase.from("notas").upsert({
      aluno_id: editAluno,
      disciplina,
      valor: editValor,
      descricao: editDesc,
      bimestre,
    }, { onConflict: "aluno_id,disciplina,bimestre" })
    setNotas(prev => ({ ...prev, [editAluno]: editValor }))
    setDescricoes(prev => ({ ...prev, [editAluno]: editDesc }))
    setEditAluno(null)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  const turmasUnicas = [...new Set(alunos.map(a => a.turma_nome))].sort()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📊 Notas</h1>
          <p className="mt-1 text-sm text-slate-500">Registro livre de notas por disciplina (cada escola define seus critérios)</p>
        </div>
        {salvo && <span className="badge badge-emerald animate-fade-in">✓ Salvo</span>}
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <select value={escolaId} onChange={e => setEscolaId(e.target.value)} className="select text-sm">
          {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <div className="h-5 w-px bg-slate-200" />
        <select value={turma} onChange={e => setTurma(e.target.value)} className="select text-sm">
          <option value="">Selecione a turma</option>
          {turmasUnicas.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="text" value={disciplina} onChange={e => setDisciplina(e.target.value)}
          className="input text-sm w-32" placeholder="Disciplina" />
        <select value={bimestre} onChange={e => setBimestre(Number(e.target.value))} className="select text-sm w-24">
          {[1, 2, 3, 4].map(b => <option key={b} value={b}>{b}º Bim</option>)}
        </select>
      </div>

      {!turma ? (
        <div className="card p-12 text-center text-slate-400">
          Selecione uma turma para lançar notas
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-100">
            {alunos.map((a, i) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-slate-300 w-5 shrink-0">{i + 1}</span>
                  <p className="text-sm font-medium text-slate-800 truncate">{a.nome}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {notas[a.id] !== undefined ? (
                    <span className="badge badge-blue text-sm font-semibold px-3 py-1">{notas[a.id]}</span>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                  <button
                    onClick={() => iniciarEdicao(a.id, notas[a.id] || "", descricoes[a.id] || "")}
                    className="btn btn-ghost text-xs px-2 py-1"
                  >
                    Lançar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editAluno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setEditAluno(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-slate-800">
              Nota — {alunos.find(a => a.id === editAluno)?.nome}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Nota / Conceito</label>
                <input type="text" value={editValor} onChange={e => setEditValor(e.target.value)}
                  className="input" placeholder="Ex: 8,5 / A / Bom / 85%" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Descrição (opcional)</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
                  className="input" rows={2} placeholder="Ex: Prova bimestral / Trabalho / Participação" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditAluno(null)} className="btn btn-outline">Cancelar</button>
              <button onClick={salvarNota} className="btn btn-primary">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
