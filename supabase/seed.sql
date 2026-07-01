-- =============================================
-- IVAN_PROFQUIMICA - Configuração Inicial
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================

-- 1. CRIAR TABELAS
-- (copie e cole o conteúdo de supabase/schema.sql aqui)

-- 2. POPULAR SISTEMAS (se ainda não existirem)
INSERT INTO sistemas_ensino (nome, descricao) VALUES
  ('Poliedro', 'Sistema Poliedro de Ensino (Callis, LUMEN, HEXA, OCTA+)'),
  ('Objetivo', 'Sistema Objetivo de Ensino'),
  ('Mackenzie', 'Sistema Mackenzie de Ensino (confessional cristão)'),
  ('OCTA+', 'Coleção OCTA+ Poliedro (Ensino Médio)')
ON CONFLICT (nome) DO NOTHING;

-- 3. POPULAR TURMAS
-- Poliedro (id=1)
INSERT INTO turmas (sistema_id, nome, ano) VALUES
  (1, '9º Ano - Ensino Fundamental', '9ano'),
  (1, '1ª Série - Ensino Médio', '1em'),
  (1, '2ª Série - Ensino Médio', '2em'),
  (1, '3ª Série - Ensino Médio / Terceirão', '3em')
ON CONFLICT DO NOTHING;

-- Objetivo (id=2)
INSERT INTO turmas (sistema_id, nome, ano) VALUES
  (2, '9º Ano - Ensino Fundamental', '9ano'),
  (2, '1ª Série - Ensino Médio', '1em'),
  (2, '2ª Série - Ensino Médio', '2em'),
  (2, '3ª Série - Ensino Médio', '3em')
ON CONFLICT DO NOTHING;

-- Mackenzie (id=3)
INSERT INTO turmas (sistema_id, nome, ano) VALUES
  (3, '9º Ano - Ensino Fundamental', '9ano'),
  (3, '1ª Série - Ensino Médio', '1em'),
  (3, '2ª Série - Ensino Médio', '2em'),
  (3, '3ª Série - Ensino Médio', '3em')
ON CONFLICT DO NOTHING;

-- OCTA+ (id=4)
INSERT INTO turmas (sistema_id, nome, ano) VALUES
  (4, '1ª Série - OCTA+ Vol. 1 e 2', '1em'),
  (4, '2ª Série - OCTA+ Vol. 3 e 4', '2em'),
  (4, '3ª Série - OCTA+ Vol. 5 e 6', '3em')
ON CONFLICT DO NOTHING;
