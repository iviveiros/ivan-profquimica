export function dataHojeBR(): string {
  const d = new Date()
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().split("T")[0]
}

export function formatarDataBR(data: string): string {
  if (!data) return ""
  const [y, m, d] = data.split("-").map(Number)
  if (!y || !m || !d) return data
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR")
}
