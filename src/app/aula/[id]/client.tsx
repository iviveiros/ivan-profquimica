"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MarkdownContent from "@/components/MarkdownContent"

type Props = { aula: any }

export default function AulaClient({ aula }: Props) {
  const router = useRouter()
  const [aba, setAba] = useState<"resumo" | "exercicios" | "avaliacao">("resumo")

  const handlePrint = () => window.print()

  const sections = {
    resumo: aula.resumo_md || "",
    exercicios: aula.exercicios_md || "",
    avaliacao: aula.avaliacao_md || "",
  }

  const tabs = [
    { key: "resumo" as const, label: "📖 Resumo" },
    { key: "exercicios" as const, label: "✏️ Exercícios" },
    { key: "avaliacao" as const, label: "📝 Avaliação" },
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-teal-700 transition-colors"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">{aula.topico}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            <span className="inline-block px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-xs font-semibold mr-1.5">{aula.sistemas_ensino?.nome}</span>
            <span className="inline-block px-2 py-0.5 bg-violet-50 text-violet-700 rounded-md text-xs font-semibold">{aula.turmas?.nome} ({aula.turmas?.ano})</span>
          </p>
        </div>
        <button onClick={handlePrint} className="btn btn-primary btn-sm no-print">
          🖨️ Baixar PDF
        </button>
      </div>

      <div className="no-print flex gap-1 rounded-xl bg-zinc-100/80 p-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setAba(t.key)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              aba === t.key
                ? "bg-white text-teal-700 shadow-md shadow-teal-200/30 scale-105"
                : "text-zinc-500 hover:text-zinc-800 hover:bg-white/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200/50 bg-white/90 p-8 shadow-sm backdrop-blur-sm print:border-none print:shadow-none print:p-0">
        <style>{`
          .conteudo-aula { font-family: Arial, sans-serif; font-size: 12pt; text-align: justify; line-height: 1.6; color: #1e293b; }
          .conteudo-aula h1 { font-size: 18pt; font-weight: 800; margin-top: 18pt; margin-bottom: 10pt; color: #0f172a; letter-spacing: -0.03em; }
          .conteudo-aula h2 { font-size: 15pt; font-weight: 700; margin-top: 16pt; margin-bottom: 8pt; color: #1e293b; }
          .conteudo-aula h3 { font-size: 13pt; font-weight: 700; margin-top: 14pt; margin-bottom: 6pt; color: #334155; }
          .conteudo-aula p { margin-bottom: 8pt; }
          .conteudo-aula table { width: 100%; border-collapse: collapse; margin: 10pt 0; border-radius: 8px; overflow: hidden; }
          .conteudo-aula th, .conteudo-aula td { border: 1px solid #d1d5db; padding: 6pt 10pt; font-size: 11pt; }
          .conteudo-aula th { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); font-weight: 700; text-align: center; color: #0c4a6e; }
          .conteudo-aula strong { font-weight: 700; color: #0f172a; }
          .conteudo-aula hr { border: none; border-top: 2px dashed #d1d5db; margin: 16pt 0; }
          .conteudo-aula ul, .conteudo-aula ol { margin: 6pt 0; padding-left: 24pt; }
          .conteudo-aula li { margin-bottom: 3pt; }
        `}</style>
        <div className="conteudo-aula">
          <MarkdownContent>
            {sections[aba]
              ? `# ${aba === "resumo" ? "Resumo da Aula" : aba === "exercicios" ? "Exercícios — Bateria de Estudo" : "Avaliação"}\n\n${sections[aba]}`
              : "*Nenhum conteúdo gerado para esta seção.*"}
          </MarkdownContent>
        </div>
      </div>
    </div>
  )
}
