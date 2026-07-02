"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"

type Message = {
  role: "user" | "assistant"
  content: string
  acao?: any
}

export default function Pati() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "🤖 Oi! Sou a Pati, sua assistente. Posso lançar notas e registrar faltas para você. Me diga o que precisa!" },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [alunos, setAlunos] = useState<any[]>([])
  const [escola, setEscola] = useState<any>(null)
  const [pendente, setPendente] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.from("escolas").select("id, nome").limit(1).single().then(({ data }) => {
      if (data) setEscola(data)
    })
    supabase.from("alunos").select("id, nome, turma_nome").order("nome").then(({ data }) => {
      if (data) setAlunos(data)
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function enviar(texto: string) {
    if (!texto.trim() || loading) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: texto }])
    setLoading(true)
    setPendente(null)

    try {
      const historico = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch("/api/pati", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: texto, historico, alunos, escola }),
      })
      const data = await res.json()

      if (data.type === "executar" && data.acao) {
        await executarAcao(data.acao)
        setMessages(prev => [...prev, { role: "assistant", content: data.mensagem || "✅ Feito!" }])
      } else if ((data.type === "confirmacao" || data.type === "pergunta") && data.acao) {
        setPendente(data.acao)
        setMessages(prev => [...prev, { role: "assistant", content: data.mensagem, acao: data.acao }])
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.mensagem || "Hmm, não entendi. Pode reformular?" }])
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro de conexão. Tente novamente." }])
    } finally {
      setLoading(false)
    }
  }

  async function confirmarAcao() {
    if (!pendente) return
    setMessages(prev => [...prev, { role: "user", content: "✅ Sim, confirma!" }])
    setLoading(true)
    await executarAcao(pendente)
    setMessages(prev => [...prev, { role: "assistant", content: "✅ Pronto! Ação executada com sucesso." }])
    setPendente(null)
    setLoading(false)
  }

  function cancelarAcao() {
    if (!pendente) return
    setMessages(prev => [...prev, { role: "user", content: "❌ Não, cancela." }])
    setMessages(prev => [...prev, { role: "assistant", content: "Ok, cancelado. Me diga se precisar de algo." }])
    setPendente(null)
  }

  async function executarAcao(acao: any) {
    try {
      if (acao.tipo === "lancar_nota") {
        await supabase.from("notas").delete().eq("aluno_id", acao.aluno_id).eq("disciplina", acao.disciplina || "Química").eq("bimestre", acao.bimestre || 1)
        await supabase.from("notas").insert({
          aluno_id: acao.aluno_id,
          disciplina: acao.disciplina || "Química",
          valor: acao.valor,
          descricao: acao.descricao || "",
          bimestre: acao.bimestre || 1,
        })
      } else if (acao.tipo === "marcar_falta" && acao.alunos) {
        for (const aluno of acao.alunos) {
          await supabase.from("faltas").delete().eq("aluno_id", aluno.id).eq("data", acao.data || new Date().toISOString().split("T")[0])
          await supabase.from("faltas").insert({
            aluno_id: aluno.id,
            data: acao.data || new Date().toISOString().split("T")[0],
            presente: false,
          })
        }
      } else if (acao.tipo === "marcar_presenca" && acao.alunos) {
        for (const aluno of acao.alunos) {
          await supabase.from("faltas").delete().eq("aluno_id", aluno.id).eq("data", acao.data || new Date().toISOString().split("T")[0])
          await supabase.from("faltas").insert({
            aluno_id: aluno.id,
            data: acao.data || new Date().toISOString().split("T")[0],
            presente: true,
          })
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Erro ao executar: ${err.message}` }])
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviar(input)
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">🤖 Pati</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Sua assistente virtual — lança notas, registra faltas e muito mais</p>
        </div>
        <span className="badge badge-emerald animate-pulse">online</span>
      </div>

      {/* Chat */}
      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md"
                    : "bg-zinc-100 text-zinc-700 border border-zinc-200/60"
                }`}
              >
                <p>{msg.content}</p>
                {msg.acao && (
                  <div className="mt-3 border-t border-zinc-300/30 pt-2 text-xs text-zinc-500 font-mono">
                    {msg.acao.tipo === "lancar_nota" && <>📝 Lançar nota para <strong>{msg.acao.aluno_nome}</strong></>}
                    {msg.acao.tipo === "marcar_falta" && <>❌ Marcar falta: {msg.acao.alunos?.map((a: any) => a.nome).join(", ")}</>}
                    {msg.acao.tipo === "marcar_presenca" && <>✅ Marcar presença: {msg.acao.alunos?.map((a: any) => a.nome).join(", ")}</>}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-zinc-100 border border-zinc-200/60 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Confirm / Cancel */}
        {pendente && !loading && (
          <div className="border-t border-zinc-200/60 px-4 py-3 bg-gradient-to-r from-emerald-50/50 to-white flex items-center justify-center gap-3">
            <span className="text-sm text-zinc-600">Confirmar ação?</span>
            <button onClick={confirmarAcao} className="btn btn-primary btn-sm">✅ Sim</button>
            <button onClick={cancelarAcao} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50">❌ Não</button>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-zinc-200/60 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Pati, lança nota 7 para Ana Alicia..."
              className="input flex-1"
              disabled={loading}
            />
            <button
              onClick={() => enviar(input)}
              disabled={!input.trim() || loading}
              className="btn btn-primary shrink-0"
            >
              {loading ? <span className="spinner" /> : "Enviar"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400 text-center">
            Pati entende linguagem natural • Ex: &quot;nota 8 pra João 2º bimestre prova&quot; ou &quot;falta pra Maria e Ana hoje&quot;
          </p>
        </div>
      </div>
    </div>
  )
}
