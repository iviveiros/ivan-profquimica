-- Seed: IEFA school with grade schedule
-- Execute no SQL Editor do Supabase Dashboard

INSERT INTO escolas (nome, grade) VALUES (
  'IEFA',
  '{
    "segunda": [null, null, null, null, null, null, null],
    "terca": [null, null, null, null, null, null, null],
    "quarta": [null, null, null, null, null, null, null],
    "quinta": [
      {"inicio":"07:00","fim":"07:45","materia":"Química","turma":"3ª EM"},
      {"inicio":"07:45","fim":"08:30","materia":"Química","turma":"1ª EM"},
      {"inicio":"08:30","fim":"09:15","materia":"Química","turma":"9º ANO"},
      {"inicio":"09:15","fim":"10:00","materia":"Química","turma":"9º ANO"},
      {"inicio":"10:20","fim":"11:05","materia":"Química","turma":"3ª EM"},
      {"inicio":"11:05","fim":"11:50","materia":"Química","turma":"2ª EM"},
      {"inicio":"11:50","fim":"12:35","materia":"Química","turma":"2ª EM"}
    ],
    "sexta": [
      {"inicio":"07:00","fim":"07:45","materia":"Química","turma":"1ª EM"},
      {"inicio":"07:45","fim":"08:30","materia":"Química","turma":"2ª EM"},
      {"inicio":"08:30","fim":"09:15","materia":"Química","turma":"2ª EM"},
      {"inicio":"09:15","fim":"10:00","materia":"Química","turma":"1ª EM"},
      {"inicio":"10:20","fim":"11:05","materia":"Química","turma":"3ª EM"},
      {"inicio":"11:05","fim":"11:50","materia":"Química","turma":"3ª EM"},
      {"inicio":"11:50","fim":"12:35","materia":"Química","turma":"1ª EM"}
    ]
  }'::jsonb
)
ON CONFLICT DO NOTHING;
