-- Filtrar grade OBJETIVO: manter apenas Química e Ciências Natureza
DO $$
DECLARE
  escola_id UUID;
  grade_original JSONB;
  grade_nova JSONB := '{}'::jsonb;
  dia_rec RECORD;
  aula_rec RECORD;
  arr_filtrado JSONB;
  materia TEXT;
BEGIN
  SELECT id, grade INTO escola_id, grade_original FROM escolas WHERE nome ILIKE '%objetivo%';
  IF NOT FOUND THEN RAISE EXCEPTION 'Escola OBJETIVO não encontrada'; END IF;

  FOR dia_rec IN SELECT * FROM jsonb_each(grade_original)
  LOOP
    arr_filtrado := '[]'::jsonb;

    FOR aula_rec IN SELECT value AS aula FROM jsonb_array_elements(dia_rec.value) AS t
    LOOP
      materia := aula_rec.aula->>'materia';
      IF materia LIKE '%Química%' OR (materia LIKE '%Ciências%' AND materia LIKE '% - G%') THEN
        arr_filtrado := arr_filtrado || aula_rec.aula;
      END IF;
    END LOOP;

    grade_nova := grade_nova || jsonb_build_object(dia_rec.key, arr_filtrado);
  END LOOP;

  UPDATE escolas SET grade = grade_nova WHERE id = escola_id;
  RAISE NOTICE 'Grade filtrada: apenas Química e Ciências Natureza (sem WALLISON)';
END $$;
