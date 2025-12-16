import { describe, it, expect } from 'vitest'
import { createInitialState, tick } from './index'

describe('Simulation Tick', () => {
  it('should advance tick counter by one', () => {
    const state0 = createInitialState()
    const state1 = tick(state0)
    expect(state1.tick).toBe(1)

    const state2 = tick(state1)
    expect(state2.tick).toBe(2)
  })

  it('should be deterministic with same seed', () => {
    const state1a = createInitialState('determinism-test')
    const state2a = tick(state1a)
    const state3a = tick(state2a)

    const state1b = createInitialState('determinism-test')
    const state2b = tick(state1b)
    const state3b = tick(state2b)

    // Same initial state
    expect(state1a).toEqual(state1b)

    // Same after one tick
    expect(state2a.tick).toEqual(state2b.tick)
    expect(state2a.company.cash).toEqual(state2b.company.cash)
    expect(state2a.company.stockPrice).toEqual(state2b.company.stockPrice)

    // Same after two ticks
    expect(state3a.tick).toEqual(state3b.tick)
    expect(state3a.company.cash).toEqual(state3b.company.cash)
    expect(state3a.company.stockPrice).toEqual(state3b.company.stockPrice)
  })

  it('should never produce negative values for critical metrics', () => {
    let state = createInitialState('no-negatives-test')

    // Run simulation for 100 weeks
    for (let i = 0; i < 100; i++) {
      state = tick(state)

      expect(state.company.cash).toBeGreaterThanOrEqual(0)
      expect(state.company.burnRate).toBeGreaterThanOrEqual(0)
      expect(state.company.revenue).toBeGreaterThanOrEqual(0)
      expect(state.company.stockPrice).toBeGreaterThanOrEqual(0)
      expect(state.company.marketCap).toBeGreaterThanOrEqual(0)

      // All role headcounts should be non-negative
      for (const role of Object.values(state.company.roles)) {
        expect(role.headcount).toBeGreaterThanOrEqual(0)
      }

      // Hidden metrics should be in [0, 1]
      expect(state.hidden.complianceRisk).toBeGreaterThanOrEqual(0)
      expect(state.hidden.complianceRisk).toBeLessThanOrEqual(1)
      expect(state.hidden.auditRisk).toBeGreaterThanOrEqual(0)
      expect(state.hidden.auditRisk).toBeLessThanOrEqual(1)
      expect(state.hidden.agentRisk).toBeGreaterThanOrEqual(0)
      expect(state.hidden.agentRisk).toBeLessThanOrEqual(1)
    }
  })

  it('should calculate burn rate based on headcount', () => {
    const state0 = createInitialState()
    const state1 = tick(state0)

    // Burn rate should be positive when there are employees
    expect(state1.company.burnRate).toBeGreaterThan(0)
  })

  it('should generate events each tick', () => {
    const state0 = createInitialState()
    expect(state0.events.length).toBeGreaterThan(0)

    const state1 = tick(state0)
    // Events array should contain at least the initial events (may or may not add new ones each tick)
    expect(state1.events.length).toBeGreaterThanOrEqual(state0.events.length)
  })

  it('should update cash based on revenue and burn rate', () => {
    const state0 = createInitialState()
    const state1 = tick(state0)

    const weeklyBurn = state1.company.burnRate / 52
    const weeklyRevenue = state1.company.revenue / 52
    const expectedCashDelta = weeklyRevenue - weeklyBurn

    const actualCashDelta = state1.company.cash - state0.company.cash

    // Should be close (allowing for floating point errors)
    expect(Math.abs(actualCashDelta - expectedCashDelta)).toBeLessThan(1)
  })
})
