"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const features = [
  {
    icon: "✦",
    title: "Gerar Aula com IA",
    desc: "Resumo, 15 exercícios e 10 questões de múltipla escolha gerados automaticamente pelo Groq (LLaMA 3.3 70B).",
    color: "emerald",
    gradient: "from-emerald-500 to-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    icon: "◈",
    title: "Horários por Escola",
    desc: "Grade semanal completa armazenada no Supabase. Suporte a múltiplas escolas com seus próprios horários.",
    color: "blue",
    gradient: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
  },
  {
    icon: "◆",
    title: "Gestão de Alunos",
    desc: "Importe por PDF, texto ou manualmente. Cada aluno vinculado à sua turma e escola.",
    color: "violet",
    gradient: "from-violet-500 to-violet-700",
    bg: "bg-violet-50",
  },
  {
    icon: "◇",
    title: "Chamada Diária",
    desc: "Registro de presenças e faltas por turma. Suporte a múltiplas escolas sem política fixa.",
    color: "amber",
    gradient: "from-amber-500 to-amber-700",
    bg: "bg-amber-50",
  },
  {
    icon: "○",
    title: "Boletim por Bimestre",
    desc: "Notas livres por disciplina. Cada escola define seus próprios critérios de avaliação.",
    color: "rose",
    gradient: "from-rose-500 to-rose-700",
    bg: "bg-rose-50",
  },
  {
    icon: "🤖",
    title: "Pati — Assistente IA",
    desc: "Assistente que lança notas e faltas via texto. Leitura de PDF com OCR (Gemini 2.5 Flash).",
    color: "purple",
    gradient: "from-purple-500 to-purple-700",
    bg: "bg-purple-50",
  },
]

const techStack = [
  { name: "Next.js 16", desc: "App Router + Server Actions" },
  { name: "Tailwind CSS 4", desc: "Design system glassmorphism" },
  { name: "Groq LLaMA 3.3", desc: "Geração de conteúdo (gratuito)" },
  { name: "Gemini 2.5 Flash", desc: "OCR e fallback de geração" },
  { name: "Supabase", desc: "Banco de dados PostgreSQL" },
  { name: "Vercel", desc: "Deploy contínuo" },
]

export default function DemoPage() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div className="space-y-24 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-emerald-900 px-6 py-20 text-center text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(5,150,105,0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className={`relative transition-all duration-1000 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-3xl shadow-lg shadow-emerald-500/30">
            🧪
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Ivan ProfQuímica
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-zinc-300">
            Sistema completo para professores de Química gerarem materiais, gerenciarem turmas e acompanharem alunos — tudo com IA.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="btn bg-white text-zinc-900 hover:bg-zinc-100 shadow-xl px-6 py-3 text-base font-bold">
              🚀 Acessar Dashboard
            </Link>
            <Link href="/criar-aula" className="btn bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-base font-bold shadow-xl shadow-emerald-900/30">
              ✦ Criar Primeira Aula
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-zinc-900">
          Funcionalidades
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Tudo que você precisa no dia a dia
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className={`group card p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
                visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-xl text-white shadow-lg`}>
                {f.icon}
              </span>
              <h3 className={`mt-4 text-lg font-bold text-zinc-800`}>
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-3xl bg-gradient-to-br from-zinc-50 to-white border border-zinc-200/60 p-8 sm:p-12">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-zinc-900">
          Como Funciona
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            { step: "1", title: "Configure", desc: "Crie escolas e turmas. Importe seus alunos via PDF ou texto." },
            { step: "2", title: "Gere Conteúdo", desc: "Escolha o tópico e a IA cria resumo, exercícios e avaliação completos." },
            { step: "3", title: "Gerencie", desc: "Registre chamada, lance notas, acompanhe horários — tudo em um lugar." },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-extrabold text-emerald-700">
                {s.step}
              </span>
              <h3 className="mt-4 text-lg font-bold text-zinc-800">{s.title}</h3>
              <p className="mt-2 text-sm text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-zinc-900">
          Stack
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {techStack.map((t, i) => (
            <div key={i} className="card flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 text-sm font-bold text-emerald-700">
                {t.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800">{t.name}</p>
                <p className="text-xs text-zinc-400">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-10 shadow-xl">
          <h2 className="text-2xl font-extrabold text-white">
            Pronto para usar?
          </h2>
          <p className="mt-2 text-emerald-100">
            Comece agora — não precisa cadastro.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="btn bg-white text-emerald-700 hover:bg-emerald-50 px-6 py-3 text-base font-bold shadow-lg">
              🚀 Ir para o Dashboard
            </Link>
            <Link href="/criar-aula" className="btn bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3 text-base font-bold shadow-lg">
              ✦ Criar Aula Agora
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
