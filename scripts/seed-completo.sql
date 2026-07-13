-- =============================================
-- IVAN_PROFQUIMICA - SEED COMPLETO
-- Copie e cole no SQL Editor do Supabase Dashboard
-- https://supabase.com/dashboard/project/teceqqvslldlrvhmjyhg/sql/new
-- =============================================

-- 1. SISTEMAS DE ENSINO
INSERT INTO sistemas_ensino (nome, descricao) VALUES
  ('Poliedro', 'Sistema Poliedro de Ensino'),
  ('Objetivo', 'Sistema Objetivo de Ensino'),
  ('Mackenzie', 'Sistema Mackenzie de Ensino'),
  ('OCTA+', 'Coleção OCTA+ Poliedro'),
  ('IEFA', 'Instituto de Educação Fênix de Avaí')
ON CONFLICT (nome) DO NOTHING;

-- 2. TURMAS (para cada sistema)
DO $$
DECLARE
  s RECORD;
BEGIN
  FOR s IN SELECT id FROM sistemas_ensino LOOP
    INSERT INTO turmas (sistema_id, nome, ano) VALUES
      (s.id, '9º Ano', '9ano'),
      (s.id, '1º Ano EM', '1em'),
      (s.id, '2º Ano EM', '2em'),
      (s.id, '3º Ano EM', '3em')
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- 3. ESCOLA IEFA
INSERT INTO escolas (nome, grade) VALUES ('IEFA', '{}')
ON CONFLICT DO NOTHING;

-- 4. TURMAS PROFESSOR
INSERT INTO turmas_professor (escola_id, nome, ano)
SELECT id, '1º Ano EM', '1em' FROM escolas WHERE nome = 'IEFA'
UNION ALL
SELECT id, '2º Ano EM', '2em' FROM escolas WHERE nome = 'IEFA'
UNION ALL
SELECT id, '3º Ano EM', '3em' FROM escolas WHERE nome = 'IEFA'
ON CONFLICT DO NOTHING;

-- 5. ALUNOS
INSERT INTO alunos (nome, turma_nome, escola_id)
SELECT * FROM (VALUES
  -- 1º Ano EM (14 alunos)
  ('ANA ALLICIA DE OLIVEIRA DAVID', '1º Ano EM'),
  ('ANA CAROLINA CONTEL QUADRA', '1º Ano EM'),
  ('FERNANDO ALONSO MOREIRA PEREZ', '1º Ano EM'),
  ('JOÃO PAULO CIRILO FILHO', '1º Ano EM'),
  ('JÚLIA NERI NOGUEIRA', '1º Ano EM'),
  ('KAIQUE DA COSTA OLIVEIRA', '1º Ano EM'),
  ('LUNA BAREA BENTO', '1º Ano EM'),
  ('MARIA VICTORIA MARÇOLA CRISPIN', '1º Ano EM'),
  ('MARIAH TADDEI RODRIGUES', '1º Ano EM'),
  ('MELISSA AYUMI NOGUEIRA KOMATSU FURUTA', '1º Ano EM'),
  ('RAFAELA GOMES MALHEIRO', '1º Ano EM'),
  ('SANDRIANE DOS SANTOS CARVALHO', '1º Ano EM'),
  ('SARAH FELIX SILVA OLIVEIRA', '1º Ano EM'),
  ('VALENTINA DE SOUZA BOLONHA', '1º Ano EM'),
  -- 2º Ano EM (10 alunos)
  ('ANA CLARA BAREA LOPES', '2º Ano EM'),
  ('ANA GABRIELLE LANZETTI GOUVEA', '2º Ano EM'),
  ('ARTHUR AUGUSTO DE OLIVEIRA SANTOS', '2º Ano EM'),
  ('FELIPE DOS SANTOS PORTO', '2º Ano EM'),
  ('JOÃO GABRIEL MORATO DOS SANTOS', '2º Ano EM'),
  ('JULIA BAREA BENTO', '2º Ano EM'),
  ('LIVIA DOS SANTOS SOUSA', '2º Ano EM'),
  ('MARIA FERNANDA OLIVEIRA TEIXEIRA DA SILVA', '2º Ano EM'),
  ('MURILO FERREIRA ZONETTI', '2º Ano EM'),
  ('RAFAELA AUGUSTO SOARES', '2º Ano EM'),
  -- 3º Ano EM (10 alunos)
  ('CAMILY MENEZES LAUDELINO', '3º Ano EM'),
  ('GABRIELA YUKARI SUEHARA', '3º Ano EM'),
  ('GUSTAVO PEPE LEITE', '3º Ano EM'),
  ('IZADORA LAMONATO SANTANA', '3º Ano EM'),
  ('JOSÉ EDUARDO FERREIRA PEREIRA', '3º Ano EM'),
  ('LEONARDO BICUDO PIRES BELINE DA SILVA', '3º Ano EM'),
  ('LUISA DE CANDIO DAMASCO', '3º Ano EM'),
  ('MANUELLA DIAS DOS SANTOS', '3º Ano EM'),
  ('MARCELA NICOLINO BORGES', '3º Ano EM'),
  ('NICOLY SCHIAVON DA SILVA', '3º Ano EM')
) AS t(nome, turma_nome)
CROSS JOIN (SELECT id FROM escolas WHERE nome = 'IEFA') AS e
WHERE NOT EXISTS (SELECT 1 FROM alunos);

-- 6. VERIFICAR
SELECT 'sistemas_ensino' as tabela, count(*) FROM sistemas_ensino
UNION ALL
SELECT 'turmas', count(*) FROM turmas
UNION ALL
SELECT 'escolas', count(*) FROM escolas
UNION ALL
SELECT 'turmas_professor', count(*) FROM turmas_professor
UNION ALL
SELECT 'alunos', count(*) FROM alunos;
