import { describe, it, expect } from 'vitest'
import { toError } from './toError'

describe('toError', () => {
  it('возвращает тот же Error без обёртки', () => {
    const err = new Error('boom')
    expect(toError(err)).toBe(err)
  })

  it('оборачивает строку в Error с тем же сообщением', () => {
    const err = toError('oops')
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('oops')
  })

  it('оборачивает null и undefined', () => {
    expect(toError(null).message).toBe('null')
    expect(toError(undefined).message).toBe('undefined')
  })

  it('оборачивает число/объект через String()', () => {
    expect(toError(42).message).toBe('42')
  })
})
