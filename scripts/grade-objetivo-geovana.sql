-- Grade do Ivan no OBJETIVO 2026 (apenas Química e Ciências da Natureza)
-- Baseada em meus_horarios_destacados.pdf
UPDATE escolas SET grade = '{
  "segunda": [
    {"inicio":"07:10","fim":"08:00","materia":"Química - G","turma":"9º Ano B"},
    {"inicio":"08:00","fim":"08:50","materia":"Química - G","turma":"9º Ano A"},
    {"inicio":"09:00","fim":"09:50","materia":"Química 2 - GIOVANNA","turma":"2ª Série A"},
    {"inicio":"09:50","fim":"10:40","materia":"Química 2 - GIOVANNA","turma":"2ª Série B"},
    {"inicio":"10:50","fim":"11:40","materia":"Química 2 - GIOVANNA","turma":"3ª Série A"},
    {"inicio":"11:40","fim":"12:30","materia":"Química 2 - GIOVANNA","turma":"3ª Série B"}
  ],
  "terca": [
    {"inicio":"07:10","fim":"08:00","materia":"Química 2 - GIOVANNA","turma":"3ª Série B"},
    {"inicio":"09:00","fim":"09:50","materia":"Química - G","turma":"9º Ano B"},
    {"inicio":"09:00","fim":"09:50","materia":"Química 2 - GIOVANNA","turma":"1ª Série A"},
    {"inicio":"09:50","fim":"10:40","materia":"Química 2 - GIOVANNA","turma":"3ª Série A"},
    {"inicio":"10:50","fim":"11:40","materia":"Química - G","turma":"9º Ano A"},
    {"inicio":"11:40","fim":"12:30","materia":"Química 2 - GIOVANNA","turma":"1ª Série B"},
    {"inicio":"13:00","fim":"13:50","materia":"Química - Giovanna","turma":"9º C"},
    {"inicio":"13:50","fim":"14:40","materia":"Química - Giovanna","turma":"9º C"},
    {"inicio":"14:50","fim":"15:40","materia":"Ciências Natureza - G","turma":"6º C"},
    {"inicio":"15:40","fim":"16:30","materia":"Ciências Natureza - G","turma":"6º C"}
  ],
  "quarta": [
    {"inicio":"07:10","fim":"08:00","materia":"Química 2 - GIOVANNA","turma":"1ª Série A"},
    {"inicio":"08:00","fim":"08:50","materia":"Química 2 - GIOVANNA","turma":"1ª Série B"}
  ],
  "quinta": [],
  "sexta": [
    {"inicio":"07:10","fim":"08:00","materia":"Química 2 - GIOVANNA","turma":"3ª Série A"},
    {"inicio":"08:00","fim":"08:50","materia":"Química 2 - GIOVANNA","turma":"3ª Série B"},
    {"inicio":"09:00","fim":"09:50","materia":"Química 2 - GIOVANNA","turma":"2ª Série B"},
    {"inicio":"09:50","fim":"10:40","materia":"Química 2 - GIOVANNA","turma":"2ª Série A"},
    {"inicio":"15:40","fim":"16:30","materia":"Ciências Natureza - G","turma":"6º C"},
    {"inicio":"16:40","fim":"17:30","materia":"Ciências Natureza - G","turma":"6º C"}
  ]
}'::jsonb WHERE nome ILIKE '%objetivo%';
