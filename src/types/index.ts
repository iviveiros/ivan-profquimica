export type SistemaEnsino = {
  id: number
  nome: string
  descricao: string | null
}

export type Turma = {
  id: number
  sistema_id: number
  nome: string
  ano: string
}

export type Aula = {
  id: string
  turma_id: number
  sistema_id: number
  topico: string
  resumo_md: string | null
  exercicios_md: string | null
  avaliacao_md: string | null
  created_at: string
  updated_at: string
}

export type ConteudoGerado = {
  resumo: string
  exercicios: string
  avaliacao: string
}
