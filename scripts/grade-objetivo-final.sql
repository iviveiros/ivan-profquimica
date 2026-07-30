-- Grade OBJETIVO 2026: apenas aulas da GIOVANNA (14 aulas, sem WALLISON)
UPDATE escolas SET grade = '{
  "segunda": [
    {"inicio":"09:00","fim":"09:50","materia":"Química 2 - GIOVANNA","turma":"2ª Série A"},
    {"inicio":"09:50","fim":"10:40","materia":"Química 2 - GIOVANNA","turma":"2ª Série B"},
    {"inicio":"10:50","fim":"11:40","materia":"Química 2 - GIOVANNA","turma":"3ª Série A"},
    {"inicio":"11:40","fim":"12:30","materia":"Química 2 - GIOVANNA","turma":"3ª Série B"}
  ],
  "terca": [
    {"inicio":"07:10","fim":"08:00","materia":"Química 2 - GIOVANNA","turma":"3ª Série B"},
    {"inicio":"09:00","fim":"09:50","materia":"Química 2 - GIOVANNA","turma":"1ª Série A"},
    {"inicio":"09:50","fim":"10:40","materia":"Química 2 - GIOVANNA","turma":"3ª Série A"},
    {"inicio":"11:40","fim":"12:30","materia":"Química 2 - GIOVANNA","turma":"1ª Série B"}
  ],
  "quarta": [],
  "quinta": [],
  "sexta": [
    {"inicio":"07:10","fim":"08:00","materia":"Química 2 - GIOVANNA","turma":"3ª Série A"},
    {"inicio":"08:00","fim":"08:50","materia":"Química 2 - GIOVANNA","turma":"3ª Série B"},
    {"inicio":"09:00","fim":"09:50","materia":"Química 2 - GIOVANNA","turma":"2ª Série B"},
    {"inicio":"09:50","fim":"10:40","materia":"Química 2 - GIOVANNA","turma":"2ª Série A"},
    {"inicio":"10:50","fim":"11:40","materia":"Química 2 - GIOVANNA","turma":"1ª Série B"},
    {"inicio":"11:40","fim":"12:30","materia":"Química 2 - GIOVANNA","turma":"1ª Série A"}
  ]
}'::jsonb WHERE nome ILIKE '%objetivo%';
