-- =============================================
-- ATUALIZAR 6º Ano do OBJETIVO: Química → Ciências da Natureza
-- Execute no SQL Editor: https://supabase.com/dashboard/project/teceqqvslldlrvhmjyhg/sql/new
-- =============================================

-- PASSO 1: Ver o que existe atualmente para o 6º Ano
SELECT id, jsonb_pretty(grade) AS grade_atual
FROM escolas
WHERE nome = 'OBJETIVO';

-- PASSO 2 (se a Step 1 mostrou dados): executa a atualização
-- Descomente e execute DEPOIS de verificar a Step 1:

DO $$
DECLARE
  escola_id UUID;
  grade_json JSONB;
  dia TEXT;
  aulas JSONB;
  i INT;
  aula JSONB;
  updated BOOLEAN;
BEGIN
  SELECT id, grade INTO escola_id, grade_json FROM escolas WHERE nome = 'OBJETIVO';
  IF grade_json IS NULL THEN RAISE NOTICE 'Grade não encontrada'; RETURN; END IF;

  updated := false;

  FOR dia IN SELECT jsonb_object_keys(grade_json) LOOP
    aulas := grade_json->>dia;

    FOR i IN 0..jsonb_array_length(aulas)-1 LOOP
      aula := aulas->i;
      IF aula IS NOT NULL AND aula ? 'turma' AND aula ? 'materia' THEN
        IF lower(aula->>'turma') LIKE '%6%' AND aula->>'materia' = 'Química' THEN
          RAISE NOTICE 'Atualizando: %[%] turma=% materia=% → Ciências da Natureza', dia, i, aula->>'turma', aula->>'materia';
          grade_json := jsonb_set(grade_json, ARRAY[dia, i::text, 'materia'], '"Ciências da Natureza"'::jsonb);
          updated := true;
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  IF updated THEN
    UPDATE escolas SET grade = grade_json WHERE id = escola_id;
    RAISE NOTICE '✅ Grade atualizada!';
  ELSE
    RAISE NOTICE 'Nenhuma aula do 6º Ano com Química encontrada.';
  END IF;
END $$;
