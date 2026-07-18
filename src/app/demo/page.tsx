"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const features = [
  { icon: "📝", title: "Gerar Aula com IA", desc: "Resumo, 15 exercícios e 10 questões de múltipla escolha gerados automaticamente pelo Groq (LLaMA 3.3 70B). Basta informar sistema, turma e conteúdo.", gradient: "from-teal-500 to-teal-700" },
  { icon: "🗓️", title: "Horários Kanban", desc: "Grade semanal completa por escola. Kanban com cartões coloridos por turma. Edite, mova, adicione ou remova aulas. Modo Geral funde todas as escolas.", gradient: "from-blue-500 to-blue-700" },
  { icon: "🎓", title: "Gestão de Alunos", desc: "Importe por PDF, texto ou manualmente. Cada aluno vinculado à turma e escola. Perfil individual com notas e frequência.", gradient: "from-violet-500 to-violet-700" },
  { icon: "📋", title: "Chamada Diária", desc: "Registro de presenças e faltas por turma e data. Suporte a múltiplas escolas sem política fixa — você define os critérios.", gradient: "from-orange-500 to-orange-700" },
  { icon: "📊", title: "Boletim por Bimestre", desc: "Notas livres por disciplina. Cada escola define seus próprios critérios de avaliação. Histórico completo por aluno.", gradient: "from-pink-500 to-pink-700" },
  { icon: "🤖", title: "Pati — Assistente IA", desc: "Assistente que lança notas, marca faltas, lista turmas, sorteia alunos e consulta horários via texto. Agora também gerencia a grade: adiciona, edita e remove aulas. Leitura de PDF com OCR (Gemini 2.5 Flash).", gradient: "from-purple-500 to-purple-700" },
  { icon: "🏫", title: "Múltiplas Escolas", desc: "Cadastre quantas escolas precisar. Cada uma com sua própria grade, turmas, alunos, notas e frequência. Troque entre elas com um clique.", gradient: "from-cyan-500 to-cyan-700" },
  { icon: "🌐", title: "Visão Geral", desc: "Modo Geral no Kanban funde os horários de todas as escolas numa única tela. Ideal para planejamento semanal completo.", gradient: "from-teal-500 to-teal-700" },
  { icon: "🎲", title: "Sorteio e Listas", desc: "Pati pode sortear alunos aleatoriamente por turma ou listar todos os alunos. Ótimo para chamadas orais e dinâmicas.", gradient: "from-pink-500 to-pink-700" },
]

const techStack = [
  { name: "Next.js 16", desc: "App Router + React Server Components" },
  { name: "TypeScript 5", desc: "Tipagem estática em todo o projeto" },
  { name: "Tailwind CSS 4", desc: "Design system glassmorphism + animações" },
  { name: "Groq LLaMA 3.3 70B", desc: "Geração de conteúdo (gratuito, ilimitado)" },
  { name: "Gemini 2.5 Flash", desc: "OCR para PDFs escaneados + fallback" },
  { name: "Supabase", desc: "PostgreSQL + REST API + RLS aberto" },
  { name: "Vercel", desc: "Deploy contínuo a partir do GitHub" },
  { name: "Rate Limiting", desc: "10 req/min por IP na API Pati" },
]

export default function DemoPage() {
  const [visible, setVisible] = useState(false)

  useEffect(() => { setVisible(true) }, [])

  return (
    <div className="space-y-24 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-teal-900 px-6 py-20 text-center text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(8,145,178,0.3),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,0.15),transparent_50%)]" />
        <div className={`relative transition-all duration-1000 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 via-violet-500 to-pink-500 text-3xl shadow-lg shadow-teal-500/30 animate-float">
            🧪
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-teal-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
            Ivan ProfQuímica
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-300">
            Sistema completo para professores de Química: gere materiais com IA, gerencie horários em Kanban, 
            registre chamada e notas, acompanhe alunos — tudo em um lugar. Múltiplas escolas, um só painel.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="btn bg-white text-zinc-900 hover:bg-zinc-100 shadow-xl px-6 py-3 text-base font-bold">
              🚀 Acessar Dashboard
            </Link>
            <Link href="/criar-aula" className="btn bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 text-base font-bold shadow-xl shadow-teal-900/30">
              ✦ Criar Primeira Aula
            </Link>
            <Link href="/pati" className="btn bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 text-base font-bold shadow-xl shadow-violet-900/30">
              🤖 Conhecer a Pati
            </Link>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { num: "2", label: "Escolas", sub: "IEFA + Objetivo" },
            { num: "9", label: "Turmas", sub: "9º Ano ao 3º EM" },
            { num: "34", label: "Alunos", sub: "Importados via PDF" },
            { num: "9", label: "Funcionalidades", sub: "E crescendo" },
          ].map((s, i) => {
            const colors = ["text-teal-600", "text-violet-600", "text-pink-600", "text-orange-600"]
            return (
              <div key={i} className={`card p-5 text-center transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`} style={{ transitionDelay: `${i*150}ms` }}>
                <p className={`text-3xl font-black ${colors[i]}`}>{s.num}</p>
                <p className="text-sm font-bold text-zinc-700">{s.label}</p>
                <p className="text-[11px] text-zinc-400">{s.sub}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-zinc-900">
          Funcionalidades
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500">Tudo que você precisa no dia a dia</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div key={i}
              className={`group card p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
              style={{ transitionDelay: `${i * 100}ms` }}>
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} text-xl text-white shadow-lg`}>{f.icon}</span>
              <h3 className="mt-4 text-lg font-bold text-zinc-800">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-3xl bg-gradient-to-br from-zinc-50 to-white border border-zinc-200/60 p-8 sm:p-12">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-zinc-900">Como Funciona</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            { step: "1", title: "Cadastre", desc: "Crie escolas e turmas. Importe alunos via PDF, texto ou manualmente. Pati ajuda na configuração." },
            { step: "2", title: "Popule", desc: "Monte a grade de horários no Kanban ou peça para Pati adicionar aulas. Cada escola com sua própria grade." },
            { step: "3", title: "Produza", desc: "Gere resumos, exercícios e avaliações com IA. Registre chamada, lance notas e acompanhe tudo." },
          ].map((s, i) => {
            const colors = ["bg-teal-100 text-teal-700", "bg-violet-100 text-violet-700", "bg-pink-100 text-pink-700"]
            return (
              <div key={i} className="text-center">
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${colors[i]} text-lg font-extrabold`}>{s.step}</span>
                <h3 className="mt-4 text-lg font-bold text-zinc-800">{s.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Diferenciais */}
      <section className="rounded-3xl bg-gradient-to-br from-teal-50 via-white to-violet-50 border border-teal-200/60 p-8 sm:p-12">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-zinc-900">Por que Ivan ProfQuímica?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {[
            { icon: "⚡", title: "Zero custo operacional", desc: "Groq é gratuito e ilimitado. Supabase tem generous free tier. Vercel deploy grátis." },
            { icon: "🤖", title: "IA em cada etapa", desc: "Geração de aulas, OCR de PDFs, assistente Pati para ações do dia a dia por texto." },
            { icon: "🏫", title: "Multi-escola nativo", desc: "Cada escola com sua grade, turmas, alunos, notas e frequência separados. Visão geral unificada." },
            { icon: "📱", title: "Mobile-first", desc: "Design responsivo. Funciona no celular, tablet e desktop. Use de onde estiver." },
            { icon: "🔓", title: "Sem autenticação", desc: "Prototipagem sem barreiras. Único usuário (Ivan). Ideal para demonstração." },
            { icon: "🗓️", title: "Kanban de horários", desc: "Visualize a semana toda de um golpe. Arraste, edite, adicione. Modo Geral funde todas as escolas." },
          ].map((d, i) => (
            <div key={i} className="flex items-start gap-4 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-md text-lg">{d.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-zinc-800">{d.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-zinc-900">Stack</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {techStack.map((t, i) => {
            const colors = ["bg-teal-100 text-teal-700", "bg-violet-100 text-violet-700", "bg-pink-100 text-pink-700", "bg-orange-100 text-orange-700"]
            return (
              <div key={i} className="card flex items-center gap-4 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors[i % colors.length]} text-sm font-bold`}>{t.name[0]}</div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800">{t.name}</p>
                  <p className="text-xs text-zinc-400">{t.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="rounded-3xl bg-gradient-to-br from-teal-500 via-violet-500 to-pink-500 p-10 shadow-xl animate-glow-pulse">
          <h2 className="text-2xl font-extrabold text-white">Pronto para usar?</h2>
          <p className="mt-2 text-white/80">Sem cadastro, sem complicação. Teste agora mesmo.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/dashboard" className="btn bg-white text-teal-700 hover:bg-teal-50 px-6 py-3 text-base font-bold shadow-lg">🚀 Dashboard</Link>
            <Link href="/horarios" className="btn bg-black/20 hover:bg-black/30 backdrop-blur-sm text-white border border-white/30 px-6 py-3 text-base font-bold shadow-lg">🗓️ Ver Horários</Link>
            <Link href="/pati" className="btn bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 text-base font-bold shadow-lg">🤖 Pati Assistente</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
