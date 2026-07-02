"use client"

import { supabase } from "@/lib/supabase"

export class ServiceError extends Error {
  constructor(message: string, public original?: unknown) {
    super(message)
    this.name = "ServiceError"
  }
}

export async function safeQuery<T>(fn: () => any): Promise<T[]> {
  try {
    const response = await fn()
    const { data, error } = response
    if (error) throw new ServiceError(error.message, error)
    return (data as T[]) || []
  } catch (err) {
    if (err instanceof ServiceError) throw err
    throw new ServiceError("Erro de conexão com o banco de dados", err)
  }
}

export async function safeSingle<T>(fn: () => any): Promise<T | null> {
  try {
    const response = await fn()
    const { data, error } = response
    if (error) throw new ServiceError(error.message, error)
    return data
  } catch (err) {
    if (err instanceof ServiceError) throw err
    throw new ServiceError("Erro de conexão com o banco de dados", err)
  }
}

export async function safeMutate(fn: () => any): Promise<void> {
  try {
    const response = await fn()
    const { error } = response
    if (error) throw new ServiceError(error.message, error)
  } catch (err) {
    if (err instanceof ServiceError) throw err
    throw new ServiceError("Erro de conexão com o banco de dados", err)
  }
}
