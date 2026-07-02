-- Extensão do schema para o protótipo SaaS

-- Escolas do professor (com grade de horários em JSONB)
CREATE TABLE escolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  grade JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alunos cadastrados
CREATE TABLE alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  turma_nome TEXT NOT NULL,
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turmas do professor (por escola)
CREATE TABLE turmas_professor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escola_id UUID REFERENCES escolas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ano TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_alunos_escola ON alunos(escola_id);
CREATE INDEX idx_alunos_turma ON alunos(turma_nome);
CREATE INDEX idx_turmas_prof_escola ON turmas_professor(escola_id);
