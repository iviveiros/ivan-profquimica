const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://teceqqvslldlrvhmjyhg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlY2VxcXZzbGxkbHJ2aG1qeWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3Mjc2ODAsImV4cCI6MjA2NDMwMzY4MH0.6hG34_bfnBfR3eyZXsZtoeLsM6lY1Dg5UO1nFavQnZw'
)

async function main() {
  // 1. Check existing sistemas_ensino
  let { data: sistemas } = await supabase.from('sistemas_ensino').select('*')
  if (!sistemas?.length) {
    console.log('Inserindo sistemas_ensino...')
    const { error } = await supabase.from('sistemas_ensino').insert([
      { nome: 'Poliedro', descricao: 'Sistema Poliedro de Ensino' },
      { nome: 'Objetivo', descricao: 'Sistema Objetivo de Ensino' },
      { nome: 'Mackenzie', descricao: 'Sistema Mackenzie de Ensino' },
      { nome: 'OCTA+', descricao: 'Coleção OCTA+ Poliedro' },
      { nome: 'IEFA', descricao: 'Instituto de Educação Fênix de Avaí' },
    ])
    if (error) { console.error('Erro sistemas:', error); return }
    sistemas = (await supabase.from('sistemas_ensino').select('*')).data
  }
  console.log('Sistemas:', sistemas?.length)

  // 2. Check existing turmas
  let { data: turmas } = await supabase.from('turmas').select('*')
  if (!turmas?.length) {
    console.log('Inserindo turmas...')
    const turmasData = []
    for (const s of sistemas) {
      turmasData.push(
        { sistema_id: s.id, nome: '9º Ano', ano: '9ano' },
        { sistema_id: s.id, nome: '1º Ano EM', ano: '1em' },
        { sistema_id: s.id, nome: '2º Ano EM', ano: '2em' },
        { sistema_id: s.id, nome: '3º Ano EM', ano: '3em' },
      )
    }
    const { error } = await supabase.from('turmas').insert(turmasData)
    if (error) { console.error('Erro turmas:', error); return }
    turmas = (await supabase.from('turmas').select('*')).data
  }
  console.log('Turmas:', turmas?.length)

  // 3. Create school IEFA
  let { data: escolas } = await supabase.from('escolas').select('*')
  if (!escolas?.length) {
    console.log('Criando escola IEFA...')
    const { error } = await supabase.from('escolas').insert({
      nome: 'IEFA',
      grade: {},
    })
    if (error) { console.error('Erro escola:', error); return }
    escolas = (await supabase.from('escolas').select('*')).data
  }
  const escola = escolas[0]
  console.log('Escola:', escola.nome, escola.id)

  // 4. Create turmas_professor
  let { data: tprof } = await supabase.from('turmas_professor').select('*')
  if (!tprof?.length) {
    console.log('Criando turmas_professor...')
    const { error } = await supabase.from('turmas_professor').insert([
      { escola_id: escola.id, nome: '1º Ano EM', ano: '1em' },
      { escola_id: escola.id, nome: '2º Ano EM', ano: '2em' },
      { escola_id: escola.id, nome: '3º Ano EM', ano: '3em' },
    ])
    if (error) { console.error('Erro tprof:', error); return }
  }

  // 5. Insert students
  const alunos = [
    // 1º Ano EM (14 alunos)
    { nome: 'ANA ALLICIA DE OLIVEIRA DAVID', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'ANA CAROLINA CONTEL QUADRA', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'FERNANDO ALONSO MOREIRA PEREZ', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'JOÃO PAULO CIRILO FILHO', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'JÚLIA NERI NOGUEIRA', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'KAIQUE DA COSTA OLIVEIRA', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'LUNA BAREA BENTO', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'MARIA VICTORIA MARÇOLA CRISPIN', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'MARIAH TADDEI RODRIGUES', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'MELISSA AYUMI NOGUEIRA KOMATSU FURUTA', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'RAFAELA GOMES MALHEIRO', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'SANDRIANE DOS SANTOS CARVALHO', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'SARAH FELIX SILVA OLIVEIRA', turma_nome: '1º Ano EM', escola_id: escola.id },
    { nome: 'VALENTINA DE SOUZA BOLONHA', turma_nome: '1º Ano EM', escola_id: escola.id },
    // 2º Ano EM (10 alunos)
    { nome: 'ANA CLARA BAREA LOPES', turma_nome: '2º Ano EM', escola_id: escola.id },
    { nome: 'ANA GABRIELLE LANZETTI GOUVEA', turma_nome: '2º Ano EM', escola_id: escola.id },
    { nome: 'ARTHUR AUGUSTO DE OLIVEIRA SANTOS', turma_nome: '2º Ano EM', escola_id: escola.id },
    { nome: 'FELIPE DOS SANTOS PORTO', turma_nome: '2º Ano EM', escola_id: escola.id },
    { nome: 'JOÃO GABRIEL MORATO DOS SANTOS', turma_nome: '2º Ano EM', escola_id: escola.id },
    { nome: 'JULIA BAREA BENTO', turma_nome: '2º Ano EM', escola_id: escola.id },
    { nome: 'LIVIA DOS SANTOS SOUSA', turma_nome: '2º Ano EM', escola_id: escola.id },
    { nome: 'MARIA FERNANDA OLIVEIRA TEIXEIRA DA SILVA', turma_nome: '2º Ano EM', escola_id: escola.id },
    { nome: 'MURILO FERREIRA ZONETTI', turma_nome: '2º Ano EM', escola_id: escola.id },
    { nome: 'RAFAELA AUGUSTO SOARES', turma_nome: '2º Ano EM', escola_id: escola.id },
    // 3º Ano EM (10 alunos)
    { nome: 'CAMILY MENEZES LAUDELINO', turma_nome: '3º Ano EM', escola_id: escola.id },
    { nome: 'GABRIELA YUKARI SUEHARA', turma_nome: '3º Ano EM', escola_id: escola.id },
    { nome: 'GUSTAVO PEPE LEITE', turma_nome: '3º Ano EM', escola_id: escola.id },
    { nome: 'IZADORA LAMONATO SANTANA', turma_nome: '3º Ano EM', escola_id: escola.id },
    { nome: 'JOSÉ EDUARDO FERREIRA PEREIRA', turma_nome: '3º Ano EM', escola_id: escola.id },
    { nome: 'LEONARDO BICUDO PIRES BELINE DA SILVA', turma_nome: '3º Ano EM', escola_id: escola.id },
    { nome: 'LUISA DE CANDIO DAMASCO', turma_nome: '3º Ano EM', escola_id: escola.id },
    { nome: 'MANUELLA DIAS DOS SANTOS', turma_nome: '3º Ano EM', escola_id: escola.id },
    { nome: 'MARCELA NICOLINO BORGES', turma_nome: '3º Ano EM', escola_id: escola.id },
    { nome: 'NICOLY SCHIAVON DA SILVA', turma_nome: '3º Ano EM', escola_id: escola.id },
  ]

  let { count: existingCount } = await supabase.from('alunos').select('*', { count: 'exact', head: true })
  if (existingCount === 0) {
    console.log(`Inserindo ${alunos.length} alunos...`)
    const { error } = await supabase.from('alunos').insert(alunos)
    if (error) { console.error('Erro alunos:', error); return }
    existingCount = alunos.length
  }
  console.log(`Total alunos: ${existingCount}`)

  // Verify
  const { data: ver } = await supabase.from('alunos').select('turma_nome, count').order('turma_nome')
  console.log('Feito!')
}

main().catch(console.error)
