-- Permitir que o anon key faça UPDATE e DELETE na tabela aulas
-- Execute isso no SQL Editor do Supabase Dashboard

ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;

-- Já deve existir para SELECT/INSERT, mas vamos garantir:
DROP POLICY IF EXISTS "anon_select" ON aulas;
CREATE POLICY "anon_select" ON aulas FOR SELECT USING (true);

DROP POLICY IF EXISTS "anon_insert" ON aulas;
CREATE POLICY "anon_insert" ON aulas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update" ON aulas;
CREATE POLICY "anon_update" ON aulas FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete" ON aulas;
CREATE POLICY "anon_delete" ON aulas FOR DELETE USING (true);

-- Repetir para todas as tabelas que precisam de CRUD completo
CREATE POLICY IF NOT EXISTS "anon_all" ON faltas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "anon_all" ON notas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "anon_all" ON alunos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "anon_all" ON aulas FOR ALL USING (true) WITH CHECK (true);
