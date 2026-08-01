-- CORRIGE DUPLICATAS E CRIA CONSTRAINTS ÚNICAS
-- Executar no SQL Editor do Supabase (supabase.com/dashboard)

-- 1) Notas: apagar duplicadas mantendo o registro mais recente
DELETE FROM notas a
USING notas b
WHERE a.aluno_id = b.aluno_id
  AND a.disciplina = b.disciplina
  AND a.bimestre = b.bimestre
  AND a.created_at < b.created_at;

-- 2) Faltas: apagar duplicadas mantendo o registro mais recente
DELETE FROM faltas a
USING faltas b
WHERE a.aluno_id = b.aluno_id
  AND a.data = b.data
  AND a.created_at < b.created_at;

-- 3) Criar constraints únicas (falha se ainda houver duplicata)
ALTER TABLE notas ADD CONSTRAINT notas_aluno_disciplina_bimestre_key
  UNIQUE (aluno_id, disciplina, bimestre);

ALTER TABLE faltas ADD CONSTRAINT faltas_aluno_data_key
  UNIQUE (aluno_id, data);
