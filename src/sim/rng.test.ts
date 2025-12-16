import { describe, it, expect } from 'vitest'
import { SeededRNG } from './rng'

describe('SeededRNG', () => {
  it('should produce deterministic results with same seed', () => {
    const rng1 = new SeededRNG('test-seed')
    const rng2 = new SeededRNG('test-seed')

    const values1 = Array.from({ length: 10 }, () => rng1.next())
    const values2 = Array.from({ length: 10 }, () => rng2.next())

    expect(values1).toEqual(values2)
  })

  it('should produce different results with different seeds', () => {
    const rng1 = new SeededRNG('seed-a')
    const rng2 = new SeededRNG('seed-b')

    const values1 = Array.from({ length: 10 }, () => rng1.next())
    const values2 = Array.from({ length: 10 }, () => rng2.next())

    expect(values1).not.toEqual(values2)
  })

  it('should produce values in range [0, 1)', () => {
    const rng = new SeededRNG('range-test')
    for (let i = 0; i < 100; i++) {
      const val = rng.next()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })

  it('should produce integers in specified range', () => {
    const rng = new SeededRNG('int-test')
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(5, 10)
      expect(val).toBeGreaterThanOrEqual(5)
      expect(val).toBeLessThanOrEqual(10)
      expect(Number.isInteger(val)).toBe(true)
    }
  })

  it('should clone RNG state correctly', () => {
    const rng1 = new SeededRNG('clone-test')
    rng1.next() // Advance state
    rng1.next()

    const rng2 = rng1.clone()

    const values1 = Array.from({ length: 5 }, () => rng1.next())
    const values2 = Array.from({ length: 5 }, () => rng2.next())

    expect(values1).toEqual(values2)
  })
})
