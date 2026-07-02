-- Schema para faltas e notas
CREATE TABLE faltas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  presente BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
  disciplina TEXT NOT NULL,
  valor TEXT NOT NULL,
  descricao TEXT,
  bimestre INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_faltas_aluno ON faltas(aluno_id);
CREATE INDEX idx_faltas_data ON faltas(data);
CREATE INDEX idx_notas_aluno ON notas(aluno_id);
CREATE INDEX idx_notas_disciplina ON notas(disciplina);
