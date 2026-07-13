const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://teceqqvslldlrvhmjyhg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlY2VxcXZzbGxkbHJ2aG1qeWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3Mjc2ODAsImV4cCI6MjA2NDMwMzY4MH0.6hG34_bfnBfR3eyZXsZtoeLsM6lY1Dg5UO1nFavQnZw'
)

async function main() {
  const { data: escolas } = await supabase.from('escolas').select('id,nome')
  console.log('Escolas:', JSON.stringify(escolas))
  const { data: turmas } = await supabase.from('turmas').select('id,nome,escola_id')
  console.log('Turmas:', JSON.stringify(turmas))
  const { count } = await supabase.from('alunos').select('*', { count: 'exact', head: true })
  console.log('Alunos count:', count)
}

main().catch(console.error)
