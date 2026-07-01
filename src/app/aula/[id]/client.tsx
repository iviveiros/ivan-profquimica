"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"

type Props = {
  aula: any
}

export default function AulaClient({ aula }: Props) {
  const router = useRouter()
  const [aba, setAba] = useState<"resumo" | "exercicios" | "avaliacao">("resumo")

  const handlePrint = () => window.print()

  const sections = {
    resumo: aula.resumo_md || "",
    exercicios: aula.exercicios_md || "",
    avaliacao: aula.avaliacao_md || "",
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/")}
            className="mb-2 text-sm text-zinc-500 hover:text-emerald-700"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold text-zinc-900">{aula.topico}</h1>
          <p className="text-sm text-zinc-500">
            {aula.sistemas_ensino?.nome} — {aula.turmas?.nome} ({aula.turmas?.ano})
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="no-print rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          🖨️ Baixar PDF
        </button>
      </div>

      <div className="no-print flex gap-1 rounded-lg bg-zinc-100 p-1">
        {(["resumo", "exercicios", "avaliacao"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              aba === a ? "bg-white text-emerald-700 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {a === "resumo" ? "📖 Resumo" : a === "exercicios" ? "✏️ Exercícios" : "📝 Avaliação"}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-8 shadow-sm print:border-none print:shadow-none print:p-0">
        <style>{`
          .conteudo-aula { font-family: Arial, sans-serif; font-size: 12pt; text-align: justify; line-height: 1.6; }
          .conteudo-aula h1 { font-size: 16pt; font-weight: bold; margin-top: 16pt; margin-bottom: 8pt; }
          .conteudo-aula h2 { font-size: 14pt; font-weight: bold; margin-top: 14pt; margin-bottom: 6pt; }
          .conteudo-aula h3 { font-size: 13pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
          .conteudo-aula p { margin-bottom: 6pt; }
          .conteudo-aula table { width: 100%; border-collapse: collapse; margin: 8pt 0; }
          .conteudo-aula th, .conteudo-aula td { border: 1px solid #999; padding: 4pt 8pt; font-size: 11pt; }
          .conteudo-aula th { background: #eee; font-weight: bold; text-align: center; }
          .conteudo-aula strong { font-weight: bold; }
          .conteudo-aula hr { border: none; border-top: 1px solid #ccc; margin: 12pt 0; }
        `}</style>
        <div className="conteudo-aula">
          <ReactMarkdown>
            {sections[aba] ? `# ${aba === "resumo" ? "Resumo da Aula" : aba === "exercicios" ? "Exercícios — Bateria de Estudo" : "Avaliação"}\n\n${sections[aba]}` : "*Nenhum conteúdo gerado para esta seção.*"}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
