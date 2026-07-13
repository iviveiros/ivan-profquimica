const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://teceqqvslldlrvhmjyhg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlY2VxcXZzbGxkbHJ2aG1qeWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3Mjc2ODAsImV4cCI6MjA2NDMwMzY4MH0.6hG34_bfnBfR3eyZXsZtoeLsM6lY1Dg5UO1nFavQnZw'
)

async function main() {
  // Check schema info
  const { data: cols, error } = await supabase.rpc('get_table_info', { table_name: 'alunos' })
  console.log('Alunos schema:', JSON.stringify(cols), error)

  // Try a raw query
  const { data: d, error: e } = await supabase.from('turmas').select('*').limit(1)
  console.log('Turmas sample:', JSON.stringify(d), JSON.stringify(e))
}

main().catch(console.error)
