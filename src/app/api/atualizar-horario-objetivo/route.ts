import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: escolas, error } = await supabase.from("escolas").select("id, nome").ilike("nome", "%objetivo%")
    if (error || !escolas?.length) {
      return NextResponse.json({ erro: "Escola OBJETIVO não encontrada" }, { status: 404 })
    }

    const escolaId = escolas[0].id
    const h = (inicio: string, fim: string, materia: string, turma: string) => ({ inicio, fim, materia, turma })

    const grade = {
      segunda: [
        h("07:10","08:00","Química 1","1ª Série A"), h("07:10","08:00","Ed. Fisica","1ª Série B"),
        h("07:10","08:00","Matemática 1","2ª Série A"), h("07:10","08:00","Língua Inglesa","2ª Série B"),
        h("07:10","08:00","Geografia","3ª Série A"), h("07:10","08:00","LP","3ª Série B"),
        h("08:00","08:50","Ed. Fisica","1ª Série A"), h("08:00","08:50","Química 1","1ª Série B"),
        h("08:00","08:50","Geografia","2ª Série A"), h("08:00","08:50","Matemática 1","2ª Série B"),
        h("08:00","08:50","LP","3ª Série A"), h("08:00","08:50","Língua Inglesa","3ª Série B"),
        h("09:00","09:50","Língua Inglesa","1ª Série A"), h("09:00","09:50","Geografia","1ª Série B"),
        h("09:00","09:50","Química 2","2ª Série A"), h("09:00","09:50","LP","2ª Série B"),
        h("09:00","09:50","Química 1","3ª Série A"), h("09:00","09:50","Matemática 1","3ª Série B"),
        h("09:50","10:40","Geografia","1ª Série A"), h("09:50","10:40","Língua Inglesa","1ª Série B"),
        h("09:50","10:40","LP","2ª Série A"), h("09:50","10:40","Química 2","2ª Série B"),
        h("09:50","10:40","Matemática 1","3ª Série A"), h("09:50","10:40","Química 1","3ª Série B"),
        h("10:50","11:40","Matemática 1","1ª Série A"), h("10:50","11:40","LP","1ª Série B"),
        h("10:50","11:40","Língua Inglesa","2ª Série A"), h("10:50","11:40","Química 1","2ª Série B"),
        h("10:50","11:40","Química 2","3ª Série A"), h("10:50","11:40","Geografia","3ª Série B"),
        h("11:40","12:30","LP","1ª Série A"), h("11:40","12:30","Matemática 1","1ª Série B"),
        h("11:40","12:30","Química 1","2ª Série A"), h("11:40","12:30","Geografia","2ª Série B"),
        h("11:40","12:30","Língua Inglesa","3ª Série A"), h("11:40","12:30","Química 2","3ª Série B"),
        h("12:30","13:20","Matemática 1","3ª Série A"), h("12:30","13:20","LP","3ª Série B"),
      ],
      terca: [
        h("07:10","08:00","Biologia","1ª Série A"), h("07:10","08:00","Geografia","1ª Série B"),
        h("07:10","08:00","Matemática","2ª Série A"), h("07:10","08:00","Filosofia","2ª Série B"),
        h("07:10","08:00","LP","3ª Série A"), h("07:10","08:00","Química 2","3ª Série B"),
        h("08:00","08:50","Filosofia","1ª Série A"), h("08:00","08:50","Biologia","1ª Série B"),
        h("08:00","08:50","Geografia","2ª Série A"), h("08:00","08:50","LP","2ª Série B"),
        h("08:00","08:50","Matemática","3ª Série A"), h("08:00","08:50","Geografia","3ª Série B"),
        h("09:00","09:50","Química 2","1ª Série A"), h("09:00","09:50","Filosofia","1ª Série B"),
        h("09:00","09:50","Biologia","2ª Série A"), h("09:00","09:50","Matemática","2ª Série B"),
        h("09:00","09:50","Geografia","3ª Série A"), h("09:00","09:50","LP","3ª Série B"),
        h("09:50","10:40","Geografia","1ª Série A"), h("09:50","10:40","Matemática","1ª Série B"),
        h("09:50","10:40","Língua Inglesa","2ª Série A"), h("09:50","10:40","Biologia","2ª Série B"),
        h("09:50","10:40","Química 2","3ª Série A"), h("09:50","10:40","Filosofia","3ª Série B"),
        h("10:50","11:40","Matemática","1ª Série A"), h("10:50","11:40","LP","1ª Série B"),
        h("10:50","11:40","História","2ª Série A"), h("10:50","11:40","Geografia","2ª Série B"),
        h("10:50","11:40","Filosofia","3ª Série A"), h("10:50","11:40","Biologia","3ª Série B"),
        h("11:40","12:30","Arte","1ª Série A"), h("11:40","12:30","Química 2","1ª Série B"),
        h("11:40","12:30","LP","2ª Série A"), h("11:40","12:30","História","2ª Série B"),
        h("11:40","12:30","Biologia","3ª Série A"), h("11:40","12:30","Matemática","3ª Série B"),
        h("12:30","13:20","LP","3ª Série A"), h("12:30","13:20","Matemática 1","3ª Série B"),
      ],
      quarta: [
        h("07:10","08:00","Física","1ª Série A"), h("07:10","08:00","LP","1ª Série B"),
        h("07:10","08:00","Sociologia","2ª Série A"), h("07:10","08:00","Língua Inglesa","2ª Série B"),
        h("07:10","08:00","Física","3ª Série A"), h("07:10","08:00","Biologia","3ª Série B"),
        h("08:00","08:50","Língua Inglesa","1ª Série A"), h("08:00","08:50","Física","1ª Série B"),
        h("08:00","08:50","História","2ª Série A"), h("08:00","08:50","Sociologia","2ª Série B"),
        h("08:00","08:50","Biologia","3ª Série A"), h("08:00","08:50","Física","3ª Série B"),
        h("09:00","09:50","LP","1ª Série A"), h("09:00","09:50","Matemática 1","1ª Série B"),
        h("09:00","09:50","LP","2ª Série A"), h("09:00","09:50","História","2ª Série B"),
        h("09:00","09:50","Física","3ª Série A"), h("09:00","09:50","Biologia","3ª Série B"),
        h("09:50","10:40","Matemática 1","1ª Série A"), h("09:50","10:40","Língua Inglesa","1ª Série B"),
        h("09:50","10:40","História","2ª Série A"), h("09:50","10:40","LP","2ª Série B"),
        h("09:50","10:40","Biologia","3ª Série A"), h("09:50","10:40","Física","3ª Série B"),
        h("10:50","11:40","Biologia","1ª Série A"), h("10:50","11:40","História","1ª Série B"),
        h("10:50","11:40","Física","2ª Série A"), h("10:50","11:40","Biologia","2ª Série B"),
        h("10:50","11:40","História","3ª Série A"), h("10:50","11:40","LP","3ª Série B"),
        h("11:40","12:30","LP","1ª Série A"), h("11:40","12:30","Biologia","1ª Série B"),
        h("11:40","12:30","Biologia","2ª Série A"), h("11:40","12:30","Física","2ª Série B"),
        h("11:40","12:30","LP","3ª Série A"), h("11:40","12:30","História","3ª Série B"),
        h("12:30","13:20","Biologia","1ª Série A"),
        h("13:00","13:40","Física","2ª Série A"), h("13:00","13:40","Biologia","2ª Série B"),
        h("13:00","13:40","Física","3ª Série A"), h("13:00","13:40","LP","3ª Série B"),
        h("13:40","14:20","Biologia","1ª Série A"), h("13:40","14:20","Física","1ª Série B"),
        h("13:40","14:20","LP","3ª Série A"),
      ],
      quinta: [
        h("07:10","08:00","Física","1ª Série A"), h("07:10","08:00","Sociologia","1ª Série B"),
        h("07:10","08:00","Matemática 1","2ª Série A"), h("07:10","08:00","Física","2ª Série B"),
        h("07:10","08:00","Biologia","3ª Série A"), h("07:10","08:00","LP","3ª Série B"),
        h("08:00","08:50","Biologia","1ª Série A"), h("08:00","08:50","Física","1ª Série B"),
        h("08:00","08:50","Física","2ª Série A"), h("08:00","08:50","Matemática 1","2ª Série B"),
        h("08:00","08:50","LP","3ª Série A"), h("08:00","08:50","Sociologia","3ª Série B"),
        h("09:00","09:50","Sociologia","1ª Série A"), h("09:00","09:50","Arte","1ª Série B"),
        h("09:00","09:50","Física","2ª Série A"), h("09:00","09:50","Biologia","2ª Série B"),
        h("09:00","09:50","Física","3ª Série A"), h("09:00","09:50","História","3ª Série B"),
        h("09:50","10:40","História","1ª Série A"), h("09:50","10:40","LP","1ª Série B"),
        h("09:50","10:40","Biologia","2ª Série A"), h("09:50","10:40","Física","2ª Série B"),
        h("09:50","10:40","Sociologia","3ª Série A"), h("09:50","10:40","Física","3ª Série B"),
        h("10:50","11:40","História","1ª Série A"), h("10:50","11:40","Física","1ª Série B"),
        h("10:50","11:40","LP","2ª Série A"), h("10:50","11:40","Ed. Fisica","2ª Série B"),
        h("10:50","11:40","Física","3ª Série A"), h("10:50","11:40","Biologia","3ª Série B"),
        h("11:40","12:30","Física","1ª Série A"), h("11:40","12:30","Biologia","1ª Série B"),
        h("11:40","12:30","Ed. Fisica","2ª Série A"), h("11:40","12:30","LP","2ª Série B"),
        h("11:40","12:30","História","3ª Série A"), h("11:40","12:30","Física","3ª Série B"),
        h("12:30","13:20","Biologia","1ª Série A"),
        h("13:00","13:40","LP","1ª Série A"), h("13:00","13:40","LP","1ª Série B"),
        h("13:00","13:40","Física","3ª Série A"), h("13:00","13:40","Física","3ª Série B"),
        h("13:40","14:20","LP","2ª Série A"), h("13:40","14:20","LP","2ª Série B"),
        h("13:40","14:20","Física","3ª Série A"),
      ],
      sexta: [
        h("07:10","08:00","LP","1ª Série A"), h("07:10","08:00","LP","1ª Série B"),
        h("07:10","08:00","Geografia","2ª Série A"), h("07:10","08:00","Matemática","2ª Série B"),
        h("07:10","08:00","Química 2","3ª Série A"), h("07:10","08:00","Química 1","3ª Série B"),
        h("08:00","08:50","LP","1ª Série A"), h("08:00","08:50","História","1ª Série B"),
        h("08:00","08:50","Matemática","2ª Série A"), h("08:00","08:50","Geografia","2ª Série B"),
        h("08:00","08:50","Química 1","3ª Série A"), h("08:00","08:50","Química 2","3ª Série B"),
        h("09:00","09:50","Química 1","1ª Série A"), h("09:00","09:50","Matemática","1ª Série B"),
        h("09:00","09:50","LP","2ª Série A"), h("09:00","09:50","Química 2","2ª Série B"),
        h("09:00","09:50","Matemática 1","3ª Série A"), h("09:00","09:50","Geografia","3ª Série B"),
        h("09:50","10:40","Matemática","1ª Série A"), h("09:50","10:40","Química 1","1ª Série B"),
        h("09:50","10:40","Química 2","2ª Série A"), h("09:50","10:40","LP","2ª Série B"),
        h("09:50","10:40","História","3ª Série A"), h("09:50","10:40","Matemática 1","3ª Série B"),
        h("10:50","11:40","Matemática 1","1ª Série A"), h("10:50","11:40","Química 2","1ª Série B"),
        h("10:50","11:40","Filosofia","2ª Série A"), h("10:50","11:40","Química 1","2ª Série B"),
        h("10:50","11:40","Matemática","3ª Série A"), h("10:50","11:40","História","3ª Série B"),
        h("11:40","12:30","Química 2","1ª Série A"), h("11:40","12:30","Matemática 1","1ª Série B"),
        h("11:40","12:30","Química 1","2ª Série A"), h("11:40","12:30","História","2ª Série B"),
        h("11:40","12:30","Geografia","3ª Série A"), h("11:40","12:30","Matemática","3ª Série B"),
      ],
    }

    const { error: updateError } = await supabase.from("escolas").update({ grade }).eq("id", escolaId)
    if (updateError) throw updateError

    return NextResponse.json({
      ok: true,
      escola: escolas[0].nome,
      total: Object.values(grade).flat().length,
    })
  } catch (err: any) {
    return NextResponse.json({ erro: err.message }, { status: 500 })
  }
}
