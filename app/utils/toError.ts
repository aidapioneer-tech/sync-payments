/** Безопасно приводит значение из catch (тип unknown) к Error. */
export function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value))
}
