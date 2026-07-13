import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

async function supFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase ${res.status}: ${text}`)
  }
  return res.json()
}

export async function GET() {
  const results: string[] = []

  try {
    // 1. Sistemas
    let sis = await supFetch('sistemas_ensino?select=id')
    if (!sis.length) {
      await supFetch('sistemas_ensino', {
        method: 'POST',
        body: JSON.stringify([
          { nome: 'Poliedro' }, { nome: 'Objetivo' }, { nome: 'Mackenzie' }, { nome: 'OCTA+' }, { nome: 'IEFA' },
        ]),
        headers: { 'Prefer': 'return=representation' },
      })
      sis = await supFetch('sistemas_ensino?select=id')
      results.push('sistemas criados')
    } else {
      results.push(`sistemas: ${sis.length}`)
    }

    // 2. Turmas
    let turmas = await supFetch('turmas?select=id,sistema_id')
    if (!turmas.length) {
      const inserts = sis.flatMap((s: any) => [
        { sistema_id: s.id, nome: '9º Ano', ano: '9ano' },
        { sistema_id: s.id, nome: '1º Ano EM', ano: '1em' },
        { sistema_id: s.id, nome: '2º Ano EM', ano: '2em' },
        { sistema_id: s.id, nome: '3º Ano EM', ano: '3em' },
      ])
      await supFetch('turmas', {
        method: 'POST',
        body: JSON.stringify(inserts),
        headers: { 'Prefer': 'return=representation' },
      })
      results.push('turmas criadas')
    } else {
      results.push(`turmas: ${turmas.length}`)
    }

    // 3. Escola IEFA
    let escolas = await supFetch('escolas?select=id')
    let escolaId: string
    if (!escolas.length) {
      const created = await supFetch('escolas', {
        method: 'POST',
        body: JSON.stringify({ nome: 'IEFA', grade: {} }),
        headers: { 'Prefer': 'return=representation' },
      })
      escolaId = created[0]?.id
      results.push('escola IEFA criada')
    } else {
      escolaId = escolas[0].id
      results.push('escola IEFA já existe')
    }

    // 4. Turmas professor
    const tp = await supFetch(`turmas_professor?escola_id=eq.${escolaId}`)
    if (!tp.length) {
      await supFetch('turmas_professor', {
        method: 'POST',
        body: JSON.stringify([
          { escola_id: escolaId, nome: '1º Ano EM', ano: '1em' },
          { escola_id: escolaId, nome: '2º Ano EM', ano: '2em' },
          { escola_id: escolaId, nome: '3º Ano EM', ano: '3em' },
        ]),
      })
      results.push('turmas_professor criadas')
    }

    // 5. Alunos
    const { count } = await supFetch(`alunos?select=count`)
    if (!count) {
      await supFetch('alunos', {
        method: 'POST',
        body: JSON.stringify(alunos.map(a => ({ ...a, escola_id: escolaId }))),
      })
      results.push(`${alunos.length} alunos inseridos`)
    } else {
      results.push(`alunos: ${count}`)
    }

    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
