import { useSearchParams } from 'react-router-dom'
import type { SetStateAction } from 'react'

/** Mantém os filtros na entrada atual do histórico, inclusive ao recarregar ou voltar. */
export function useUrlFilters<T extends Record<string, string>>(
  defaults: T,
  names: Record<keyof T, string>,
  allowed: Partial<Record<keyof T, readonly string[]>> = {},
): [T, (value: SetStateAction<T>) => void] {
  const [params, setParams] = useSearchParams()
  function read(source: URLSearchParams): T {
    const result = { ...defaults }
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const value = source.get(names[key])
      if (value !== null && (!allowed[key] || allowed[key]!.includes(value))) result[key] = value as T[keyof T]
    }
    return result
  }
  return [read(params), value => setParams(current => {
    const next = new URLSearchParams(current)
    const filters = typeof value === 'function' ? value(read(current)) : value
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      if (filters[key] === defaults[key]) next.delete(names[key])
      else next.set(names[key], filters[key])
    }
    return next
  }, { replace: true })]
}
