-- Sincronizar turmas_professor do OBJETIVO com os nomes reais da grade
-- Execute no SQL Editor: https://supabase.com/dashboard/project/teceqqvslldlrvhmjyhg/sql/new

-- Descobrir todas as turmas únicas na grade do OBJETIVO
WITH turmas_da_grade AS (
  SELECT DISTINCT trim(aula->>'turma') AS nome
  FROM escolas,
  LATERAL jsonb_each(grade) AS dias(dia, aulas),
  LATERAL jsonb_array_elements(aulas) AS aula
  WHERE nome = 'OBJETIVO'
    AND aula IS NOT NULL
    AND aula != 'null'::jsonb
    AND aula->>'turma' IS NOT NULL
)
SELECT nome FROM turmas_da_grade ORDER BY nome;

-- Depois de ver a lista acima, rode isto para atualizar:
-- DELETE FROM turmas_professor WHERE escola_id = (SELECT id FROM escolas WHERE nome = 'OBJETIVO');
-- 
-- INSERT INTO turmas_professor (escola_id, nome, ano) VALUES
--   ((SELECT id FROM escolas WHERE nome = 'OBJETIVO'), '6 C', '6ano'),
--   ((SELECT id FROM escolas WHERE nome = 'OBJETIVO'), '9 Ano A', '9ano'),
--   ((SELECT id FROM escolas WHERE nome = 'OBJETIVO'), '9 Ano B', '9ano'),
--   ((SELECT id FROM escolas WHERE nome = 'OBJETIVO'), '9 C', '9ano'),
--   ((SELECT id FROM escolas WHERE nome = 'OBJETIVO'), '1 Serie A', '1em'),
--   ((SELECT id FROM escolas WHERE nome = 'OBJETIVO'), '1 Serie B', '1em'),
--   ((SELECT id FROM escolas WHERE nome = 'OBJETIVO'), '2 Serie A', '2em'),
--   ((SELECT id FROM escolas WHERE nome = 'OBJETIVO'), '2 Serie B', '2em'),
--   ((SELECT id FROM escolas WHERE nome = 'OBJETIVO'), '3 Serie A', '3em'),
--   ((SELECT id FROM escolas WHERE nome = 'OBJETIVO'), '3 Serie B', '3em');
