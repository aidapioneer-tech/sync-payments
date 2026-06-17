import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from './user'

describe('useUserStore.initFromBatch', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('склеивает имя и фамилию в login через пробел', () => {
    const store = useUserStore()
    store.initFromBatch({ name: 'Иван', lastName: 'Петров', isAdmin: true })
    expect(store.login).toBe('Иван Петров')
    expect(store.isAdmin).toBe(true)
  })

  it('использует только имеющуюся часть имени', () => {
    const store = useUserStore()
    store.initFromBatch({ name: 'Иван' })
    expect(store.login).toBe('Иван')
  })

  it('использует только фамилию, если имя не задано', () => {
    const store = useUserStore()
    store.initFromBatch({ lastName: 'Петров' })
    expect(store.login).toBe('Петров')
  })

  it('подставляет пробел, если имя и фамилия не заданы', () => {
    const store = useUserStore()
    store.initFromBatch({})
    expect(store.login).toBe(' ')
  })

  it('isAdmin по умолчанию false', () => {
    const store = useUserStore()
    store.initFromBatch({ name: 'A', lastName: 'B' })
    expect(store.isAdmin).toBe(false)
  })
})
