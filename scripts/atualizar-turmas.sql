-- =============================================
-- ATUALIZAR TURMAS - Adicionar 6º Ano + Limpar Duplicatas
-- Execute no SQL Editor do Supabase Dashboard
-- https://supabase.com/dashboard/project/teceqqvslldlrvhmjyhg/sql/new
-- =============================================

-- 1. Remover turmas duplicadas (ids >= 16, que sobraram de seeds repetidos)
DELETE FROM aulas WHERE turma_id >= 16;
DELETE FROM turmas WHERE id >= 16;

-- 2. Adicionar 6º Ano para cada sistema de ensino (se não existir)
INSERT INTO turmas (sistema_id, nome, ano)
SELECT id, '6º Ano - Ensino Fundamental', '6ano' FROM sistemas_ensino WHERE nome IN ('Poliedro', 'Objetivo', 'Mackenzie')
AND NOT EXISTS (SELECT 1 FROM turmas WHERE sistema_id = sistemas_ensino.id AND ano = '6ano');

INSERT INTO turmas (sistema_id, nome, ano)
SELECT id, '6º Ano - OCTA+', '6ano' FROM sistemas_ensino WHERE nome = 'OCTA+'
AND NOT EXISTS (SELECT 1 FROM turmas WHERE sistema_id = (SELECT id FROM sistemas_ensino WHERE nome = 'OCTA+') AND ano = '6ano');

-- 3. Adicionar turmas_professor para OBJETIVO (escola_id da OBJETIVO)
INSERT INTO turmas_professor (escola_id, nome, ano)
SELECT id, '6º Ano', '6ano' FROM escolas WHERE nome = 'OBJETIVO'
AND NOT EXISTS (SELECT 1 FROM turmas_professor WHERE escola_id = (SELECT id FROM escolas WHERE nome = 'OBJETIVO') AND ano = '6ano');

INSERT INTO turmas_professor (escola_id, nome, ano)
SELECT id, '9º Ano', '9ano' FROM escolas WHERE nome = 'OBJETIVO'
AND NOT EXISTS (SELECT 1 FROM turmas_professor WHERE escola_id = (SELECT id FROM escolas WHERE nome = 'OBJETIVO') AND ano = '9ano');

INSERT INTO turmas_professor (escola_id, nome, ano)
SELECT id, '1ª Série EM', '1em' FROM escolas WHERE nome = 'OBJETIVO'
AND NOT EXISTS (SELECT 1 FROM turmas_professor WHERE escola_id = (SELECT id FROM escolas WHERE nome = 'OBJETIVO') AND ano = '1em');

INSERT INTO turmas_professor (escola_id, nome, ano)
SELECT id, '2ª Série EM', '2em' FROM escolas WHERE nome = 'OBJETIVO'
AND NOT EXISTS (SELECT 1 FROM turmas_professor WHERE escola_id = (SELECT id FROM escolas WHERE nome = 'OBJETIVO') AND ano = '2em');

INSERT INTO turmas_professor (escola_id, nome, ano)
SELECT id, '3ª Série EM', '3em' FROM escolas WHERE nome = 'OBJETIVO'
AND NOT EXISTS (SELECT 1 FROM turmas_professor WHERE escola_id = (SELECT id FROM escolas WHERE nome = 'OBJETIVO') AND ano = '3em');

-- 4. Verificar resultado
SELECT 'turmas' as tabela, count(*) FROM turmas
UNION ALL
SELECT 'turmas_professor', count(*) FROM turmas_professor;

SELECT id, sistema_id, nome, ano FROM turmas ORDER BY id;
