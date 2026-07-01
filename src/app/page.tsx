import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { Aula } from "@/types"

async function getAulas() {
  const { data } = await supabase
    .from("aulas")
    .select("*, turmas(nome, ano), sistemas_ensino(nome)")
    .order("created_at", { ascending: false })
    .limit(20)
  return (data || []) as any[]
}

export default async function Home() {
  const aulas = await getAulas()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Ivan_ProfQuímica</h1>
          <p className="mt-1 text-zinc-500">Gerador de aulas, exercícios e avaliações</p>
        </div>
        <Link
          href="/criar-aula"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition-colors"
        >
          + Criar Aula
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-800">Como funciona</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-lg font-bold text-emerald-700">1</div>
            <p className="mt-1 text-sm text-zinc-600">Escolha o sistema de ensino, a turma e digite o conteúdo da aula</p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-lg font-bold text-emerald-700">2</div>
            <p className="mt-1 text-sm text-zinc-600">A IA gera resumo, bateria de exercícios e avaliação automaticamente</p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-lg font-bold text-emerald-700">3</div>
            <p className="mt-1 text-sm text-zinc-600">Visualize, edite e baixe em PDF para imprimir e entregar aos alunos</p>
          </div>
        </div>
      </div>

      {aulas.length > 0 && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-800">Histórico de Aulas</h2>
          <div className="divide-y">
            {aulas.map((aula: any) => (
              <Link
                key={aula.id}
                href={`/aula/${aula.id}`}
                className="flex items-center justify-between py-3 hover:bg-zinc-50 px-2 -mx-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="font-medium text-zinc-800">{aula.topico}</p>
                  <p className="text-sm text-zinc-500">
                    {aula.sistemas_ensino?.nome} — {aula.turmas?.nome} ({aula.turmas?.ano})
                  </p>
                </div>
                <p className="text-xs text-zinc-400">
                  {new Date(aula.created_at).toLocaleDateString("pt-BR")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {aulas.length === 0 && (
        <div className="rounded-xl border-2 border-dashed bg-white p-12 text-center">
          <p className="text-lg text-zinc-500">Nenhuma aula criada ainda.</p>
          <p className="mt-1 text-sm text-zinc-400">
            Clique em <strong className="text-emerald-600">+ Criar Aula</strong> para começar.
          </p>
        </div>
      )}
    </div>
  )
}
