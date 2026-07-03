import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"
config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Erro: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY precisam estar no .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const grade = {
  segunda: [null, null, null, null, null, null, null],
  terca: [null, null, null, null, null, null, null],
  quarta: [null, null, null, null, null, null, null],
  quinta: [
    { inicio: "07:00", fim: "07:45", materia: "Química", turma: "3ª EM" },
    { inicio: "07:45", fim: "08:30", materia: "Química", turma: "1ª EM" },
    { inicio: "08:30", fim: "09:15", materia: "Química", turma: "9º ANO" },
    { inicio: "09:15", fim: "10:00", materia: "Química", turma: "9º ANO" },
    { inicio: "10:20", fim: "11:05", materia: "Química", turma: "3ª EM" },
    { inicio: "11:05", fim: "11:50", materia: "Química", turma: "2ª EM" },
    { inicio: "11:50", fim: "12:35", materia: "Química", turma: "2ª EM" },
  ],
  sexta: [
    { inicio: "07:00", fim: "07:45", materia: "Química", turma: "1ª EM" },
    { inicio: "07:45", fim: "08:30", materia: "Química", turma: "2ª EM" },
    { inicio: "08:30", fim: "09:15", materia: "Química", turma: "2ª EM" },
    { inicio: "09:15", fim: "10:00", materia: "Química", turma: "1ª EM" },
    { inicio: "10:20", fim: "11:05", materia: "Química", turma: "3ª EM" },
    { inicio: "11:05", fim: "11:50", materia: "Química", turma: "3ª EM" },
    { inicio: "11:50", fim: "12:35", materia: "Química", turma: "1ª EM" },
  ],
}

async function seed() {
  const { data: existing } = await supabase.from("escolas").select("id").ilike("nome", "IEFA").limit(1)
  if (existing?.length) {
    console.log("IEFA já existe. Atualizando grade...")
    const { error } = await supabase.from("escolas").update({ grade: JSON.stringify(grade) }).eq("id", existing[0].id)
    if (error) throw error
    console.log("Grade atualizada!")
  } else {
    console.log("Criando IEFA...")
    const { error } = await supabase.from("escolas").insert({ nome: "IEFA", grade: JSON.stringify(grade) })
    if (error) throw error
    console.log("IEFA criada com grade completa!")
  }
}

seed().catch(console.error)
