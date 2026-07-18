"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getEscolas } from "@/services/escolas"
import { getAlunosDaTurma } from "@/services/alunos"
import { getNotas, salvarNota } from "@/services/notas"
import type { AlunoBasico } from "@/services/alunos"

type Nota = { id: string; aluno_id: string; disciplina: string; valor: string; descricao: string; bimestre: number }

export default function Notas() {
  const [alunos, setAlunos] = useState<AlunoBasico[]>([])
  const [escolas, setEscolas] = useState<{ id: string; nome: string }[]>([])
  const [escolaId, setEscolaId] = useState("")
  const [turma, setTurma] = useState("")
  const [disciplina, setDisciplina] = useState("Química")
  const [bimestre, setBimestre] = useState(1)
  const [notas, setNotas] = useState<Record<string, string>>({})
  const [descricoes, setDescricoes] = useState<Record<string, string>>({})
  const [editAluno, setEditAluno] = useState<string | null>(null)
  const [editValor, setEditValor] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState("")

  useEffect(() => {
    getEscolas().then(data => {
      if (data?.length) { setEscolas(data); setEscolaId(data[0].id) }
    }).catch(e => setErro("Erro ao carregar escolas"))
  }, [])

  useEffect(() => {
    if (!escolaId) return
    setTurma("")
    setAlunos([])
    getAlunosDaTurma(escolaId, "").then(data => {
      setAlunos(data)
    }).catch(e => setErro("Erro ao carregar alunos"))
  }, [escolaId])

  useEffect(() => {
    if (!turma) return
    carregarNotas()
  }, [turma, disciplina, bimestre])

  async function carregarNotas() {
    setErro("")
    try {
      const alunosTurma = await getAlunosDaTurma(escolaId, turma)
      setAlunos(alunosTurma)
      if (!alunosTurma.length) return
      const ids = alunosTurma.map(a => a.id)
      const registros = await getNotas(ids, disciplina, bimestre)
      const mapV: Record<string, string> = {}
      const mapD: Record<string, string> = {}
      for (const r of registros) { mapV[r.aluno_id] = r.valor; mapD[r.aluno_id] = r.descricao || "" }
      setNotas(mapV)
      setDescricoes(mapD)
    } catch (e) {
      setErro("Erro ao carregar notas")
    }
  }

  function iniciarEdicao(alunoId: string, valor: string, desc: string) {
    setEditAluno(alunoId); setEditValor(valor); setEditDesc(desc)
  }

  async function salvarNotaHandler() {
    if (!editAluno) return
    setErro("")
    try {
      await salvarNota({
        aluno_id: editAluno, disciplina, valor: editValor, descricao: editDesc, bimestre,
      })
      setNotas(prev => ({ ...prev, [editAluno]: editValor }))
      setDescricoes(prev => ({ ...prev, [editAluno]: editDesc }))
      setEditAluno(null)
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2000)
    } catch (e) {
      setErro("Erro ao salvar nota")
    }
  }

  const turmasUnicas = [...new Set(alunos.map(a => a.turma_nome))].sort()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">○ Notas</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Registro livre por disciplina — cada escola define seus critérios</p>
        </div>
        {salvo && <span className="badge badge-emerald animate-fade-in">✓ Salvo</span>}
      </div>

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
          <button onClick={() => setErro("")} className="ml-2 font-bold">×</button>
        </div>
      )}

      {/* Controls */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <select value={escolaId} onChange={e => setEscolaId(e.target.value)} className="select text-sm">
          {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <div className="h-5 w-px bg-zinc-200" />
        <select value={turma} onChange={e => setTurma(e.target.value)} className="select text-sm">
          <option value="">Selecione a turma</option>
          {turmasUnicas.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="text" value={disciplina} onChange={e => setDisciplina(e.target.value)} className="input text-sm w-32" placeholder="Disciplina" />
        <select value={bimestre} onChange={e => setBimestre(Number(e.target.value))} className="select text-sm w-24">
          {[1, 2, 3, 4].map(b => <option key={b} value={b}>{b}º Bim</option>)}
        </select>
      </div>

      {/* List */}
      {!turma ? (
        <div className="card p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl shadow-sm animate-float">
            ○
          </div>
          <p className="mt-4 text-lg font-bold text-zinc-700">Nenhuma turma selecionada</p>
          <p className="mt-1 text-sm text-zinc-400">Selecione uma turma para lançar notas</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-zinc-100">
            {alunos.map((a, i) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-2.5 row-hover">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xs text-zinc-300 w-5 shrink-0">{i + 1}</span>
                  <Link href={`/aluno/${a.id}`} className="text-sm font-medium text-zinc-800 hover:text-emerald-700 hover:underline truncate">
                    {a.nome}
                  </Link>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {notas[a.id] !== undefined ? (
                    <span className="badge badge-blue text-sm font-bold px-3 py-1">{notas[a.id]}</span>
                  ) : (
                    <span className="text-xs text-zinc-300 italic">sem nota</span>
                  )}
                  <button onClick={() => iniciarEdicao(a.id, notas[a.id] || "", descricoes[a.id] || "")} className="btn btn-secondary btn-sm">
                    {notas[a.id] !== undefined ? "Editar" : "Lançar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-zinc-100 px-5 py-3.5 text-sm text-zinc-500 bg-gradient-to-r from-zinc-50/80 to-white">
            {alunos.length} alunos · {Object.keys(notas).length} com nota
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editAluno && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setEditAluno(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-bold text-zinc-800">
              Nota — {alunos.find(a => a.id === editAluno)?.nome}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-500">Nota / Conceito</label>
                <input type="text" value={editValor} onChange={e => setEditValor(e.target.value)}
                  className="input" placeholder="Ex: 8,5 / A / Bom / 85%" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-500">Descrição (opcional)</label>
                <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
                  className="textarea" rows={2} placeholder="Ex: Prova bimestral / Trabalho / Participação" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditAluno(null)} className="btn btn-ghost btn-sm">Cancelar</button>
              <button onClick={salvarNotaHandler} className="btn btn-primary btn-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
