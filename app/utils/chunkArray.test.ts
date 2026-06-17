import { describe, it, expect } from 'vitest'
import { chunkArray, chunkProductsList } from './chunkArray'

describe('chunkArray', () => {
  it('возвращает пустой массив для пустого ввода', () => {
    expect(chunkArray([])).toEqual([])
  })

  it('кладёт всё в один чанк, если массив меньше размера чанка', () => {
    expect(chunkArray([1, 2, 3], 5)).toEqual([[1, 2, 3]])
  })

  it('делит на чанки заданного размера', () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  it('делит ровно, когда длина кратна размеру', () => {
    expect(chunkArray([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4]
    ])
  })

  it('использует размер чанка 50 по умолчанию', () => {
    const input = Array.from({ length: 120 }, (_, i) => i)
    const result = chunkArray(input)
    expect(result).toHaveLength(3)
    expect(result[0]).toHaveLength(50)
    expect(result[1]).toHaveLength(50)
    expect(result[2]).toHaveLength(20)
  })

  it('не мутирует исходный массив', () => {
    const input = [1, 2, 3]
    chunkArray(input, 2)
    expect(input).toEqual([1, 2, 3])
  })
})

describe('chunkProductsList', () => {
  it('возвращает пустой массив для пустого ввода', () => {
    expect(chunkProductsList([])).toEqual([])
  })

  it('делит первую и последующие страницы по заданным размерам', () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7]
    // fix=0, чтобы размер первой страницы не корректировался
    expect(chunkProductsList(items, { first: 2, second: 3 }, 0)).toEqual([
      [0, 1],
      [2, 3, 4],
      [5, 6, 7]
    ])
  })

  it('увеличивает первую страницу на fix, если элементов больше first + fix', () => {
    const items = Array.from({ length: 12 }, (_, i) => i)
    // length(12) > first(9) + fix(2) -> first становится 11
    const result = chunkProductsList(items)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveLength(11)
    expect(result[1]).toHaveLength(1)
  })

  it('не увеличивает первую страницу, если элементов мало', () => {
    const items = [0, 1, 2, 3, 4]
    // length(5) <= first(9) + fix(2) -> всё на одной странице
    expect(chunkProductsList(items)).toEqual([[0, 1, 2, 3, 4]])
  })
})
