"use client"

import { useEffect, useState, useRef } from "react"
import { getEscolas } from "@/services/escolas"
import { getGrade, salvarGrade } from "@/services/horarios"
import type { Grade } from "@/services/horarios"
import { supabase } from "@/lib/supabase"
import { criarAluno, removerAluno } from "@/services/alunos"

type Message = {
  role: "user" | "assistant"
  content: string
  acoes?: any[]
}

export default function Pati() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "🤖 Oi! Sou a Pati, sua assistente. Posso lançar notas, registrar faltas, sortear alunos, listar turmas e consultar horários. Também leio PDFs!" },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [alunos, setAlunos] = useState<any[]>([])
  const [escolas, setEscolas] = useState<any[]>([])
  const [escola, setEscola] = useState<any>(null)
  const [grade, setGrade] = useState<any>(null)
  const [pendentes, setPendentes] = useState<any[]>([])
  const [processandoPdf, setProcessandoPdf] = useState(false)
  const [pdfNome, setPdfNome] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function init() {
      try {
        const lista = await getEscolas()
        setEscolas(lista)
        if (lista.length) {
          setEscola(lista[0])
          const g = await getGrade(lista[0].id)
          if (g) setGrade(g)
        }
      } catch {}
      try {
        const { data } = await supabase.from("alunos").select("id, nome, turma_nome").order("nome")
        if (data) setAlunos(data)
      } catch {}
    }
    init()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function extrairAcoes(data: any): any[] {
    if (data.acoes && Array.isArray(data.acoes)) return data.acoes
    if (data.acao) return [data.acao]
    return []
  }

  async function enviar(texto: string) {
    if (!texto.trim() || loading) return
    setInput("")

    if (pendentes.length > 0) {
      const t = texto.trim().toLowerCase()
      const palavrasConfirmacao = ["sim", "pode", "confirma", "ok", "claro", "isso", "manda", "faz", "executa"]
      const eConfirmacao = palavrasConfirmacao.some(p => t === p || t.startsWith(p + " ") || t.startsWith(p + ","))
      if (eConfirmacao) return confirmarAcao()
      const palavrasNegacao = ["não", "nao", "cancela", "pare", "nenhum", "nada", "para"]
      if (palavrasNegacao.some(p => t === p || t.startsWith(p + " ") || t.startsWith(p + ","))) return cancelarAcao()
    }

    setMessages(prev => [...prev, { role: "user", content: texto }])
    setLoading(true)
    setPendentes([])

    try {
      const historico = [...messages.map(m => ({ role: m.role, content: m.content }))]
      const contextoAcoes = pendentes.length > 0 ? pendentes : null
      const res = await fetch("/api/pati", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: texto, historico, alunos, escola, grade, acoesPendentes: contextoAcoes, todasEscolas: escolas.map((e: any) => e.nome) }),
      })
      const data = await res.json()
      const acoes = extrairAcoes(data)

      if ((data.type === "executar" || data.type === "resposta") && acoes.length) {
        const resultado = await executarAcoes(acoes)
        setMessages(prev => [...prev, { role: "assistant", content: resultado || data.mensagem || "✅ Feito!" }])
      } else if ((data.type === "confirmacao" || data.type === "pergunta") && acoes.length) {
        setPendentes(acoes)
        setMessages(prev => [...prev, { role: "assistant", content: data.mensagem, acoes }])
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
    if (!pendentes.length) return
    setMessages(prev => [...prev, { role: "user", content: "✅ Sim, confirma!" }])
    setLoading(true)
    await executarAcoes(pendentes)
    setMessages(prev => [...prev, { role: "assistant", content: "✅ Pronto! Todas as ações foram executadas." }])
    setPendentes([])
    setLoading(false)
  }

  function cancelarAcao() {
    if (!pendentes.length) return
    setMessages(prev => [...prev, { role: "user", content: "❌ Não, cancela." }])
    setMessages(prev => [...prev, { role: "assistant", content: "Ok, cancelado." }])
    setPendentes([])
  }

  function normalizarAcao(acao: any): any {
    const a = { ...acao }
    if (!a.aluno_id && a.aluno_nome) {
      const match = alunos.find((al: any) => al.nome.toLowerCase().includes(a.aluno_nome.toLowerCase()))
      if (match) a.aluno_id = match.id
    }
    if (!a.aluno_id && a.aluno) {
      a.aluno_nome = a.aluno
      const match = alunos.find((al: any) => al.nome.toLowerCase().includes(a.aluno.toLowerCase()))
      if (match) a.aluno_id = match.id
      delete a.aluno
    }
    if (a.nota !== undefined && a.valor === undefined) {
      a.valor = String(a.nota)
      delete a.nota
    }
    if (a.valor !== undefined && typeof a.valor === "number") {
      a.valor = String(a.valor)
    }
    if (!a.tipo && a.nome && a.turma) a.tipo = "adicionar_aluno"
    if (!a.tipo && a.nome && !a.turma && !a.valor && !a.disciplina) a.tipo = "remover_aluno"
    if (!a.tipo && (a.valor || a.nota)) a.tipo = "lancar_nota"
    if (!a.tipo && a.alunos?.length) a.tipo = "marcar_falta"
    return a
  }

  async function executarAcoes(acoes: any[]): Promise<string> {
    const linhas: string[] = []
    for (let acao of acoes) {
      acao = normalizarAcao(acao)
      if (!acao.tipo) continue
      try {
        if (acao.tipo === "lancar_nota") {
          if (!acao.aluno_id) {
            linhas.push(`⚠️ Aluno não encontrado: ${acao.aluno_nome || "desconhecido"}`)
            continue
          }
          await supabase.from("notas").delete().eq("aluno_id", acao.aluno_id).eq("disciplina", acao.disciplina || "Química").eq("bimestre", acao.bimestre || 1)
          await supabase.from("notas").insert({
            aluno_id: acao.aluno_id,
            disciplina: acao.disciplina || "Química",
            valor: acao.valor,
            descricao: acao.descricao || "",
            bimestre: acao.bimestre || 1,
          })
          linhas.push(`📝 ${acao.aluno_nome}: ${acao.valor}`)
        } else if (acao.tipo === "marcar_falta" && acao.alunos) {
          for (const aluno of acao.alunos) {
            const alunoId = aluno.id || (alunos.find((a: any) => a.nome?.toLowerCase().includes((aluno.nome || "").toLowerCase()))?.id)
            if (!alunoId) continue
            const data = acao.data || new Date().toISOString().split("T")[0]
            await supabase.from("faltas").delete().eq("aluno_id", alunoId).eq("data", data)
            await supabase.from("faltas").insert({ aluno_id: alunoId, data, presente: false })
            linhas.push(`❌ Falta: ${aluno.nome} (${data})`)
          }
        } else if (acao.tipo === "marcar_presenca" && acao.alunos) {
          for (const aluno of acao.alunos) {
            const alunoId = aluno.id || (alunos.find((a: any) => a.nome?.toLowerCase().includes((aluno.nome || "").toLowerCase()))?.id)
            if (!alunoId) continue
            const data = acao.data || new Date().toISOString().split("T")[0]
            await supabase.from("faltas").delete().eq("aluno_id", alunoId).eq("data", data)
            await supabase.from("faltas").insert({ aluno_id: alunoId, data, presente: true })
            linhas.push(`✅ Presença: ${aluno.nome} (${data})`)
          }
        } else if (acao.tipo === "adicionar_aluno") {
          let escolaId = escola?.id
          if (acao.escola) {
            const e = escolas.find((x: any) => x.nome.toLowerCase() === acao.escola.toLowerCase())
            if (e) escolaId = e.id
          }
          if (!escolaId) {
            linhas.push("⚠️ Escola não encontrada.")
            continue
          }
          if (escolaId !== escola?.id) {
            const e = escolas.find((x: any) => x.id === escolaId)
            if (e) setEscola(e)
          }
          await criarAluno({ nome: acao.nome, turma_nome: acao.turma, escola_id: escolaId })
          const alunosAtualizados = await import("@/services/alunos").then(m => m.getAlunos(escola.id))
          setAlunos(alunosAtualizados)
          linhas.push(`✅ Aluno adicionado: ${acao.nome} (${acao.turma})`)
        } else if (acao.tipo === "remover_aluno") {
          const nomeBusca = (acao.nome || "").toLowerCase().trim()
          const aluno = alunos.find((a: any) => a.nome?.toLowerCase().includes(nomeBusca))
          if (!aluno) {
            linhas.push(`⚠️ Aluno não encontrado: ${acao.nome}`)
            continue
          }
          await removerAluno(aluno.id)
          const alunosAtualizados2 = alunos.filter((a: any) => a.id !== aluno.id)
          setAlunos(alunosAtualizados2)
          linhas.push(`🗑️ Aluno removido: ${aluno.nome}`)
        } else if (acao.tipo === "adicionar_aula") {
          if (!grade || !escola?.id) {
            linhas.push("Nenhuma escola carregada.")
            continue
          }
          const dia: string = acao.dia
          if (!grade[dia as keyof Grade]) {
            linhas.push(`Dia inválido: ${dia}`)
            continue
          }
          const g: any = { ...grade }
          g[dia] = [...(g[dia] || []), { inicio: acao.inicio, fim: acao.fim, materia: acao.materia, turma: acao.turma }]
          await salvarGrade(escola.id, g as Grade)
          setGrade(g as Grade)
          linhas.push(`➕ Aula adicionada ${dia}-feira: ${acao.materia} - ${acao.turma} (${acao.inicio}-${acao.fim})`)
        } else if (acao.tipo === "editar_aula") {
          if (!grade || !escola?.id) {
            linhas.push("Nenhuma escola carregada.")
            continue
          }
          const dia: string = acao.dia
          const indice: number = acao.indice
          if (!grade[dia as keyof Grade] || indice < 0 || indice >= grade[dia as keyof Grade]!.length) {
            linhas.push(`Índice inválido: ${indice} para ${dia}-feira`)
            continue
          }
          const aulaAtual = grade[dia as keyof Grade]![indice]
          if (!aulaAtual) {
            linhas.push(`Nenhuma aula no índice ${indice} da ${dia}-feira`)
            continue
          }
          const g: any = { ...grade }
          g[dia] = [...g[dia]]
          g[dia][indice] = {
            inicio: acao.inicio || aulaAtual.inicio,
            fim: acao.fim || aulaAtual.fim,
            materia: acao.materia || aulaAtual.materia,
            turma: acao.turma || aulaAtual.turma,
          }
          await salvarGrade(escola.id, g as Grade)
          setGrade(g as Grade)
          linhas.push(`✏️ Aula ${indice + 1} de ${dia}-feira atualizada: ${g[dia][indice].materia} - ${g[dia][indice].turma} (${g[dia][indice].inicio}-${g[dia][indice].fim})`)
        } else if (acao.tipo === "remover_aula") {
          if (!grade || !escola?.id) {
            linhas.push("Nenhuma escola carregada.")
            continue
          }
          const dia: string = acao.dia
          const indice: number = acao.indice
          if (!grade[dia as keyof Grade] || indice < 0 || indice >= grade[dia as keyof Grade]!.length) {
            linhas.push(`Índice inválido: ${indice} para ${dia}-feira`)
            continue
          }
          const aulaRemovida = grade[dia as keyof Grade]![indice]
          const g: any = { ...grade }
          g[dia] = [...g[dia]]
          g[dia][indice] = null
          await salvarGrade(escola.id, g as Grade)
          setGrade(g as Grade)
          linhas.push(`🗑️ Aula ${indice + 1} de ${dia}-feira removida${aulaRemovida ? `: ${aulaRemovida.materia} - ${aulaRemovida.turma}` : ""}`)
        } else if (acao.tipo === "listar_alunos") {
          const filtrados = acao.turma
            ? alunos.filter((a: any) => a.turma_nome.toLowerCase() === acao.turma.toLowerCase())
            : alunos
          if (!filtrados.length) {
            linhas.push(`Nenhum aluno encontrado${acao.turma ? ` na turma ${acao.turma}` : ""}.`)
          } else {
            linhas.push(`📋 ${filtrados.length} aluno(s):`)
            filtrados.forEach((a: any, i: number) => linhas.push(`${i + 1}. ${a.nome} (${a.turma_nome})`))
          }
        } else if (acao.tipo === "sortear_aluno") {
          const filtrados = acao.turma
            ? alunos.filter((a: any) => a.turma_nome.toLowerCase() === acao.turma.toLowerCase())
            : alunos
          if (!filtrados.length) {
            linhas.push(`Nenhum aluno disponível${acao.turma ? ` na turma ${acao.turma}` : ""}.`)
          } else {
            const sorteado = filtrados[Math.floor(Math.random() * filtrados.length)]
            linhas.push(`🎲 Aluno sorteado: **${sorteado.nome}** (${sorteado.turma_nome})`)
          }
        } else if (acao.tipo === "consultar_horarios") {
          if (!grade) {
            linhas.push("Nenhum horário cadastrado para esta escola.")
          } else {
            const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
            const agora = new Date()
            const hojeNome = diasSemana[agora.getDay()]
            const horaAtual = String(agora.getHours()).padStart(2, "0") + ":" + String(agora.getMinutes()).padStart(2, "0")

            const diaBusca = acao.dia === "hoje" || !acao.dia ? hojeNome : acao.dia
            const aulas = grade[diaBusca]?.filter((a: any) => a !== null) || []

            if (!aulas.length) {
              linhas.push(`Sem aulas na ${diaBusca}-feira.`)
            } else {
              const proxima = aulas.find((a: any) => a.inicio >= horaAtual)
              const passadas = aulas.filter((a: any) => a.inicio < horaAtual)

              if (proxima && (acao.proxima || passadas.length < aulas.length)) {
                linhas.push(`📅 ${diaBusca}-feira — ${aulas.length} aulas`)
                if (proxima) {
                  linhas.push(`\n▶️ **Próxima aula:** ${proxima.inicio}-${proxima.fim} | ${proxima.materia} | ${proxima.turma}`)
                }
                const restantes = aulas.filter((a: any) => a !== proxima && a.inicio >= horaAtual)
                if (restantes.length) {
                  linhas.push(`\nAinda hoje:`)
                  restantes.forEach((a: any) => linhas.push(`   ${a.inicio}-${a.fim} | ${a.materia} | ${a.turma}`))
                }
                if (passadas.length) {
                  linhas.push(`\nJá passaram:`)
                  passadas.forEach((a: any) => linhas.push(`   ${a.inicio}-${a.fim} | ${a.materia} | ${a.turma}`))
                }
              } else {
                linhas.push(`📅 ${diaBusca}-feira (${aulas.length} aulas):`)
                aulas.forEach((a: any) => linhas.push(`   ${a.inicio}-${a.fim} | ${a.materia} | ${a.turma}`))
                if (passadas.length === aulas.length) {
                  linhas.push("\nTodas as aulas de hoje já passaram.")
                }
              }
            }
          }
        }
      } catch (err: any) {
        linhas.push(`Erro: ${err.message}`)
      }
    }
    return linhas.join("\n")
  }

  async function processarPdf(file: File) {
    if (processandoPdf) return
    setProcessandoPdf(true)
    setPdfNome(file.name)
    setMessages(prev => [...prev, { role: "user", content: `📎 ${file.name}` }])
    setMessages(prev => [...prev, { role: "assistant", content: `📖 Lendo PDF...` }])

    try {
      const pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let texto = ""
      let textoPorPagina: string[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items.map((item: any) => item.str).join(" ")
        texto += pageText + "\n"
        textoPorPagina.push(pageText)
      }

      const textoSemImagens = texto.trim()

      if (textoSemImagens.length > 20) {
        // PDF com texto extraível
        const mensagem = `Extraí esta lista de um PDF. Pode lançar as notas para os alunos correspondentes?\n\n--- CONTEÚDO DO PDF ---\n${textoSemImagens}\n\n--- FIM ---\n\nSe encontrar alunos, turmas e notas, lance tudo. Se faltar info, pergunte o que precisa.`
        await enviar(mensagem)
      } else {
        // PDF escaneado → manda cada página pro Gemini
        setMessages(prev => {
          const m = [...prev]
          m[m.length - 1] = { role: "assistant", content: `🔍 PDF sem texto extraível. Analisando imagem com IA...` }
          return m
        })

        const todasNotas: string[] = []
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 2 })
          const canvas = document.createElement("canvas")
          canvas.width = viewport.width
          canvas.height = viewport.height
          const ctx = canvas.getContext("2d")!
          await page.render({ canvasContext: ctx, viewport }).promise

          const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), "image/png"))
          const formData = new FormData()
          formData.append("imagem", blob, `pagina-${i}.png`)
          formData.append("prompt", `Extraia APENAS os nomes dos alunos, suas respectivas notas/conceitos e a turma desta lista escolar. Responda no formato: "Aluno: NOME | Turma: TURMA | Nota: NOTA | Disciplina: DISCIPLINA | Bimestre: B"`)

          const res = await fetch("/api/analisar-imagem", { method: "POST", body: formData })
          const data = await res.json()
          if (data.texto) todasNotas.push(data.texto)
        }

        if (todasNotas.length) {
          const mensagem = `Recebi estas notas de um PDF escaneado:\n\n${todasNotas.join("\n---\n")}\n\nPode lançar todas as notas para os alunos correspondentes? Se identificar turma, disciplina e bimestre, use. Se faltar algo, pergunte.`
          await enviar(mensagem)
        } else {
          setMessages(prev => [...prev, { role: "assistant", content: "❌ Não consegui extrair nada. O PDF está legível?" }])
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `❌ Erro ao ler PDF: ${err.message}` }])
    } finally {
      setProcessandoPdf(false)
      setPdfNome("")
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviar(input)
    }
  }

  function resumoAcoes(acoes: any[]): string {
    return acoes.map(a => {
      if (a.tipo === "lancar_nota") return `📝 Nota ${a.valor} para ${a.aluno_nome} (${a.turma}, ${a.bimestre}º bim)`
      if (a.tipo === "marcar_falta") return `❌ Falta: ${a.alunos?.map((x: any) => x.nome).join(", ")}`
      if (a.tipo === "marcar_presenca") return `✅ Presença: ${a.alunos?.map((x: any) => x.nome).join(", ")}`
      if (a.tipo === "listar_alunos") return `📋 Listar alunos${a.turma ? ` da turma ${a.turma}` : ""}`
      if (a.tipo === "sortear_aluno") return `🎲 Sortear aluno${a.turma ? ` da turma ${a.turma}` : ""}`
      if (a.tipo === "consultar_horarios") return `📅 Consultar horários${a.dia ? ` de ${a.dia}` : ""}`
      if (a.tipo === "adicionar_aluno") return `👤 Adicionar aluno: ${a.nome} (${a.turma})`
      if (a.tipo === "remover_aluno") return `🗑️ Remover aluno: ${a.nome}`
      if (a.tipo === "adicionar_aula") return `➕ Adicionar aula: ${a.materia} - ${a.turma} (${a.dia}, ${a.inicio}-${a.fim})`
      if (a.tipo === "editar_aula") return `✏️ Editar aula ${a.indice + 1} de ${a.dia}`
      if (a.tipo === "remover_aula") return `🗑️ Remover aula ${a.indice + 1} de ${a.dia}`
      return ""
    }).filter(Boolean).join("\n")
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">🤖 Pati</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Lançar notas, faltas, lista, sorteio e horários</p>
        </div>
        <div className="flex items-center gap-3">
          {escola && <span className="badge badge-teal">{escola.nome}</span>}
          <span className="badge badge-emerald animate-pulse">online</span>
        </div>
      </div>

      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md"
                  : "bg-zinc-100 text-zinc-700 border border-zinc-200/60"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.acoes && (
                  <div className="mt-3 border-t border-zinc-300/30 pt-2 text-xs text-zinc-500">
                    {msg.acoes.map((a, j) => (
                      <div key={j} className="py-0.5">
                        {a.tipo === "lancar_nota" && <>📝 {a.aluno_nome}: <strong>{a.valor}</strong> ({a.descricao}, {a.bimestre}º bim)</>}
                        {a.tipo === "marcar_falta" && <>❌ Falta: {a.alunos?.map((x: any) => x.nome).join(", ")}</>}
                        {a.tipo === "marcar_presenca" && <>✅ Presença: {a.alunos?.map((x: any) => x.nome).join(", ")}</>}
                        {a.tipo === "listar_alunos" && <>📋 Listar alunos{a.turma ? ` (${a.turma})` : ""}</>}
                        {a.tipo === "sortear_aluno" && <>🎲 Sortear aluno{a.turma ? ` (${a.turma})` : ""}</>}
                        {a.tipo === "consultar_horarios" && <>📅 Horários{a.dia ? ` (${a.dia})` : ""}</>}
                        {a.tipo === "adicionar_aluno" && <>👤 Adicionar aluno: {a.nome} ({a.turma})</>}
                        {a.tipo === "adicionar_aula" && <>➕ Adicionar: {a.materia} - {a.turma} ({a.dia} {a.inicio}-{a.fim})</>}
                        {a.tipo === "editar_aula" && <>✏️ Editar aula {a.indice + 1} de {a.dia}</>}
                        {a.tipo === "remover_aula" && <>🗑️ Remover aula {a.indice + 1} de {a.dia}</>}
                      </div>
                    ))}
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

        {pendentes.length > 0 && !loading && (
          <div className="border-t border-zinc-200/60 px-4 py-3 bg-gradient-to-r from-emerald-50/50 to-white">
            <div className="text-xs text-zinc-500 mb-2 whitespace-pre-wrap">{resumoAcoes(pendentes)}</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-medium text-zinc-700">Confirmar {pendentes.length > 1 ? `${pendentes.length} ações` : "ação"}?</span>
              <button onClick={confirmarAcao} className="btn btn-primary btn-sm">✅ Sim</button>
              <button onClick={cancelarAcao} className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50">❌ Não</button>
            </div>
          </div>
        )}

        <div className="border-t border-zinc-200/60 p-4">
          {processandoPdf && (
            <div className="mb-3 flex items-center gap-2 text-sm text-emerald-600 animate-pulse">
              <span className="spinner h-4 w-4" />
              Processando {pdfNome}...
            </div>
          )}
          <div className="flex gap-2">
            <input type="file" accept=".pdf" ref={fileInputRef} className="hidden"
              onChange={e => { if (e.target.files?.[0]) processarPdf(e.target.files[0]); e.target.value = "" }} />
            <button onClick={() => fileInputRef.current?.click()} disabled={loading || processandoPdf}
              className="btn btn-secondary btn-sm shrink-0 px-2" title="Anexar PDF">
              📎
            </button>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: lista 1º ano, sorteio, horários..."
              className="input flex-1" disabled={loading || processandoPdf} />
            <button onClick={() => enviar(input)} disabled={!input.trim() || loading || processandoPdf}
              className="btn btn-primary shrink-0">
              {loading ? <span className="spinner" /> : "Enviar"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400 text-center">
            📎 Anexe PDF • "lista 1º ano" • "sorteio" • "horários" • "nota 7 pra Ana"
          </p>
        </div>
      </div>
    </div>
  )
}
