"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getAluno } from "@/services/alunos"
import { getEscolaNome } from "@/services/escolas"
import { getFaltasDoAluno } from "@/services/faltas"
import { getNotasDoAluno } from "@/services/notas"
import type { AlunoBasico } from "@/services/alunos"
import type { FaltaHistorico } from "@/services/faltas"
import type { NotaRegistro } from "@/services/notas"
import { ServiceError } from "@/services/supabase"

export default function AlunoPerfil() {
  const params = useParams()
  const router = useRouter()
  const [aluno, setAluno] = useState<AlunoBasico | null>(null)
  const [faltas, setFaltas] = useState<FaltaHistorico[]>([])
  const [notas, setNotas] = useState<NotaRegistro[]>([])
  const [escolaNome, setEscolaNome] = useState("")
  const [erro, setErro] = useState("")

  useEffect(() => {
    if (!params?.id) return
    carregar()
  }, [params?.id])

  async function carregar() {
    setErro("")
    try {
      const id = params.id as string
      const a = await getAluno(id)
      if (!a) return
      setAluno(a)

      const nome = await getEscolaNome(a.escola_id || "")
      if (nome) setEscolaNome(nome)

      const f = await getFaltasDoAluno(id)
      setFaltas(f)

      const n = await getNotasDoAluno(id)
      setNotas(n)
    } catch (e) {
      setErro(e instanceof ServiceError ? e.message : "Erro ao carregar dados do aluno")
    }
  }

  const totalFaltas = faltas.filter(f => !f.presente).length
  const totalPresencas = faltas.filter(f => f.presente).length

  if (!aluno && !erro) return <div className="card p-12 text-center text-slate-400">Carregando...</div>

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => router.back()} className="btn btn-ghost text-sm">← Voltar</button>

      {erro && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {aluno && (
        <>
          <div className="card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{aluno.nome}</h1>
                <p className="mt-1 text-sm text-slate-500">{escolaNome} · {aluno.turma_nome}</p>
                {aluno.observacoes && <p className="mt-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">📌 {aluno.observacoes}</p>}
              </div>
              <button onClick={() => window.print()} className="btn btn-outline">🖨️ Imprimir</button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="card p-4">
              <p className="text-xs font-medium uppercase text-slate-400">Presenças</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{totalPresencas}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium uppercase text-slate-400">Faltas</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{totalFaltas}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium uppercase text-slate-400">Disciplinas</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">{new Set(notas.map(n => n.disciplina)).size}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium uppercase text-slate-400">Notas Lançadas</p>
              <p className="mt-1 text-2xl font-bold text-violet-600">{notas.length}</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">📊 Notas</h2>
            </div>
            {!notas.length ? (
              <div className="p-5 text-sm text-slate-400">Nenhuma nota lançada.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-4 py-2 font-medium text-slate-500">Disciplina</th>
                      <th className="px-4 py-2 font-medium text-slate-500 w-16 text-center">1º Bim</th>
                      <th className="px-4 py-2 font-medium text-slate-500 w-16 text-center">2º Bim</th>
                      <th className="px-4 py-2 font-medium text-slate-500 w-16 text-center">3º Bim</th>
                      <th className="px-4 py-2 font-medium text-slate-500 w-16 text-center">4º Bim</th>
                      <th className="px-4 py-2 font-medium text-slate-500">Descrição</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notas.length > 0 && [...new Set(notas.map(n => n.disciplina))].map(disciplina => {
                      const n1 = notas.find(n => n.disciplina === disciplina && n.bimestre === 1)
                      const n2 = notas.find(n => n.disciplina === disciplina && n.bimestre === 2)
                      const n3 = notas.find(n => n.disciplina === disciplina && n.bimestre === 3)
                      const n4 = notas.find(n => n.disciplina === disciplina && n.bimestre === 4)
                      const desc = notas.find(n => n.disciplina === disciplina)?.descricao
                      return (
                        <tr key={disciplina} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{disciplina}</td>
                          <td className={`px-4 py-3 text-center font-semibold ${n1 ? "text-slate-800" : "text-slate-200"}`}>{n1?.valor || "—"}</td>
                          <td className={`px-4 py-3 text-center font-semibold ${n2 ? "text-slate-800" : "text-slate-200"}`}>{n2?.valor || "—"}</td>
                          <td className={`px-4 py-3 text-center font-semibold ${n3 ? "text-slate-800" : "text-slate-200"}`}>{n3?.valor || "—"}</td>
                          <td className={`px-4 py-3 text-center font-semibold ${n4 ? "text-slate-800" : "text-slate-200"}`}>{n4?.valor || "—"}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{desc || ""}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">📋 Chamada</h2>
              <span className="badge badge-amber">{faltas.length} registros</span>
            </div>
            {!faltas.length ? (
              <div className="p-5 text-sm text-slate-400">Nenhum registro de chamada.</div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {faltas.map((f, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-2.5 hover:bg-slate-50">
                    <span className="text-sm text-slate-600">{new Date(f.data).toLocaleDateString("pt-BR")}</span>
                    <span className={`badge ${f.presente ? "badge-emerald" : "badge-amber"}`}>
                      {f.presente ? "✅ Presente" : "❌ Falta"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
