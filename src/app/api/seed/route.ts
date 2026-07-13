import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const alunos = [
  { nome: 'ANA ALLICIA DE OLIVEIRA DAVID', turma_nome: '1º Ano EM' },
  { nome: 'ANA CAROLINA CONTEL QUADRA', turma_nome: '1º Ano EM' },
  { nome: 'FERNANDO ALONSO MOREIRA PEREZ', turma_nome: '1º Ano EM' },
  { nome: 'JOÃO PAULO CIRILO FILHO', turma_nome: '1º Ano EM' },
  { nome: 'JÚLIA NERI NOGUEIRA', turma_nome: '1º Ano EM' },
  { nome: 'KAIQUE DA COSTA OLIVEIRA', turma_nome: '1º Ano EM' },
  { nome: 'LUNA BAREA BENTO', turma_nome: '1º Ano EM' },
  { nome: 'MARIA VICTORIA MARÇOLA CRISPIN', turma_nome: '1º Ano EM' },
  { nome: 'MARIAH TADDEI RODRIGUES', turma_nome: '1º Ano EM' },
  { nome: 'MELISSA AYUMI NOGUEIRA KOMATSU FURUTA', turma_nome: '1º Ano EM' },
  { nome: 'RAFAELA GOMES MALHEIRO', turma_nome: '1º Ano EM' },
  { nome: 'SANDRIANE DOS SANTOS CARVALHO', turma_nome: '1º Ano EM' },
  { nome: 'SARAH FELIX SILVA OLIVEIRA', turma_nome: '1º Ano EM' },
  { nome: 'VALENTINA DE SOUZA BOLONHA', turma_nome: '1º Ano EM' },
  { nome: 'ANA CLARA BAREA LOPES', turma_nome: '2º Ano EM' },
  { nome: 'ANA GABRIELLE LANZETTI GOUVEA', turma_nome: '2º Ano EM' },
  { nome: 'ARTHUR AUGUSTO DE OLIVEIRA SANTOS', turma_nome: '2º Ano EM' },
  { nome: 'FELIPE DOS SANTOS PORTO', turma_nome: '2º Ano EM' },
  { nome: 'JOÃO GABRIEL MORATO DOS SANTOS', turma_nome: '2º Ano EM' },
  { nome: 'JULIA BAREA BENTO', turma_nome: '2º Ano EM' },
  { nome: 'LIVIA DOS SANTOS SOUSA', turma_nome: '2º Ano EM' },
  { nome: 'MARIA FERNANDA OLIVEIRA TEIXEIRA DA SILVA', turma_nome: '2º Ano EM' },
  { nome: 'MURILO FERREIRA ZONETTI', turma_nome: '2º Ano EM' },
  { nome: 'RAFAELA AUGUSTO SOARES', turma_nome: '2º Ano EM' },
  { nome: 'CAMILY MENEZES LAUDELINO', turma_nome: '3º Ano EM' },
  { nome: 'GABRIELA YUKARI SUEHARA', turma_nome: '3º Ano EM' },
  { nome: 'GUSTAVO PEPE LEITE', turma_nome: '3º Ano EM' },
  { nome: 'IZADORA LAMONATO SANTANA', turma_nome: '3º Ano EM' },
  { nome: 'JOSÉ EDUARDO FERREIRA PEREIRA', turma_nome: '3º Ano EM' },
  { nome: 'LEONARDO BICUDO PIRES BELINE DA SILVA', turma_nome: '3º Ano EM' },
  { nome: 'LUISA DE CANDIO DAMASCO', turma_nome: '3º Ano EM' },
  { nome: 'MANUELLA DIAS DOS SANTOS', turma_nome: '3º Ano EM' },
  { nome: 'MARCELA NICOLINO BORGES', turma_nome: '3º Ano EM' },
  { nome: 'NICOLY SCHIAVON DA SILVA', turma_nome: '3º Ano EM' },
]

export async function GET() {
  const results: string[] = []

  // 1. Sistemas de Ensino
  const { data: sis } = await supabase.from('sistemas_ensino').select('*')
  if (!sis?.length) {
    const { error } = await supabase.from('sistemas_ensino').insert([
      { nome: 'Poliedro' }, { nome: 'Objetivo' }, { nome: 'Mackenzie' }, { nome: 'OCTA+' }, { nome: 'IEFA' },
    ])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    results.push('sistemas_ensino criados')
  } else {
    results.push(`sistemas_ensino: ${sis.length} existentes`)
  }

  // 2. Turmas
  const { data: turmas } = await supabase.from('turmas').select('*')
  if (!turmas?.length) {
    const { data: s } = await supabase.from('sistemas_ensino').select('id')
    if (!s?.length) return NextResponse.json({ error: 'no sistemas' }, { status: 500 })
    const inserts = s.flatMap(si => [
      { sistema_id: si.id, nome: '9º Ano', ano: '9ano' },
      { sistema_id: si.id, nome: '1º Ano EM', ano: '1em' },
      { sistema_id: si.id, nome: '2º Ano EM', ano: '2em' },
      { sistema_id: si.id, nome: '3º Ano EM', ano: '3em' },
    ])
    const { error } = await supabase.from('turmas').insert(inserts)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    results.push('turmas criadas')
  } else {
    results.push(`turmas: ${turmas.length} existentes`)
  }

  // 3. Escola IEFA
  let escolaId: string | null = null
  const { data: escolas } = await supabase.from('escolas').select('id').limit(1)
  if (!escolas?.length) {
    const { data, error } = await supabase.from('escolas').insert({ nome: 'IEFA', grade: {} }).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    escolaId = data.id
    results.push('escola IEFA criada')
  } else {
    escolaId = escolas[0].id
    results.push('escola IEFA já existe')
  }

  // 4. Turmas professor
  const { data: tp } = await supabase.from('turmas_professor').select('*')
  if (!tp?.length) {
    const { error } = await supabase.from('turmas_professor').insert([
      { escola_id: escolaId, nome: '1º Ano EM', ano: '1em' },
      { escola_id: escolaId, nome: '2º Ano EM', ano: '2em' },
      { escola_id: escolaId, nome: '3º Ano EM', ano: '3em' },
    ])
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    results.push('turmas_professor criadas')
  }

  // 5. Alunos
  const { count } = await supabase.from('alunos').select('*', { count: 'exact', head: true })
  if (count === 0) {
    const { error } = await supabase.from('alunos').insert(
      alunos.map(a => ({ ...a, escola_id: escolaId }))
    )
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    results.push(`${alunos.length} alunos inseridos`)
  } else {
    results.push(`alunos: ${count} existentes`)
  }

  return NextResponse.json({ ok: true, results })
}
