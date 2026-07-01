-- Tabela de sistemas de ensino (preenchida automaticamente)
CREATE TABLE sistemas_ensino (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO sistemas_ensino (nome, descricao) VALUES
  ('Poliedro', 'Sistema Poliedro de Ensino (Callis, LUMEN, HEXA, OCTA+)'),
  ('Objetivo', 'Sistema Objetivo de Ensino'),
  ('Mackenzie', 'Sistema Mackenzie de Ensino (confessional cristão)'),
  ('OCTA+', 'Coleção OCTA+ Poliedro (Ensino Médio)');

-- Tabela de turmas
CREATE TABLE turmas (
  id SERIAL PRIMARY KEY,
  sistema_id INTEGER REFERENCES sistemas_ensino(id),
  nome TEXT NOT NULL,
  ano TEXT NOT NULL, -- '9ano', '1em', '2em', '3em'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de aulas geradas
CREATE TABLE aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id INTEGER REFERENCES turmas(id),
  sistema_id INTEGER REFERENCES sistemas_ensino(id),
  topico TEXT NOT NULL,
  resumo_md TEXT,
  exercicios_md TEXT,
  avaliacao_md TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de PDFs gerados (storage)
CREATE TABLE pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID REFERENCES aulas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('resumo', 'exercicios', 'avaliacao', 'completo')),
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_aulas_turma ON aulas(turma_id);
CREATE INDEX idx_aulas_topico ON aulas(topico);
CREATE INDEX idx_aulas_created ON aulas(created_at DESC);
