/**
 * Tests for game ending conditions
 */

import { describe, it, expect } from 'vitest'
import { tick } from './tick'
import type { SimulationState } from './types'
import { createInitialState } from './index'

describe('Game Endings', () => {
  describe('WIN condition', () => {
    it('should trigger WIN ending when headcount reaches 1 with positive cash', () => {
      // Create a state with 1 person left and positive cash
      const state: SimulationState = {
        ...createInitialState('test-win-seed'),
        company: {
          ...createInitialState('test-win-seed').company,
          cash: 1_000_000,
          roles: {
            support: { headcount: 0, automationLevel: 1.0 },
            sales: { headcount: 1, automationLevel: 0 },
            engineering: { headcount: 0, automationLevel: 1.0 },
            legal: { headcount: 0, automationLevel: 1.0 },
            compliance: { headcount: 0, automationLevel: 1.0 },
          },
        },
      }

      const nextState = tick(state)

      expect(nextState.ending).toBeDefined()
      expect(nextState.ending?.type).toBe('win')
      expect(nextState.ending?.reason).toBe('one_person_left')
    })

    it('should NOT trigger WIN if headcount is 1 but no cash', () => {
      // Use initial state with all initial employees
      const initial = createInitialState('test-no-win-seed')

      // Modify to have 1 person and 0 cash
      const state: SimulationState = {
        ...initial,
        company: {
          ...initial.company,
          cash: 0, // Bankrupt
          roles: {
            ...initial.company.roles,
            support: { headcount: 0, automationLevel: 1.0 },
            sales: { headcount: 1, automationLevel: 0 },
            engineering: { headcount: 0, automationLevel: 1.0 },
          },
        },
        bankruptTicks: 1, // Already 1 tick bankrupt
      }

      const nextState = tick(state)

      // Should not have a WIN ending (cash is 0)
      expect(nextState.ending?.type).not.toBe('win')
      // Should have more bankruptcy ticks
      expect(nextState.bankruptTicks).toBeGreaterThanOrEqual(2)
    })

    it('should NOT trigger WIN if headcount is more than 1', () => {
      // Use initial state (50,000 employees) with huge cash
      const state: SimulationState = {
        ...createInitialState('test-no-win-seed2'),
        company: {
          ...createInitialState('test-no-win-seed2').company,
          cash: 100_000_000_000, // Huge cash to avoid bankruptcy
        },
      }

      const nextState = tick(state)

      // Should have no ending (50,000 people, positive cash, not bankrupt)
      expect(nextState.ending).toBeUndefined()
    })
  })

  describe('LOSE condition: bankruptcy', () => {
    it('should trigger LOSE ending after 4 consecutive weeks at cash = 0', () => {
      let state: SimulationState = {
        ...createInitialState('test-bankruptcy-seed'),
        company: {
          ...createInitialState('test-bankruptcy-seed').company,
          cash: 0,
          burnRate: 1_000_000, // High burn rate ensures we stay at 0
          revenue: 0,
        },
      }

      // Run 4 ticks to accumulate bankruptcy weeks
      for (let i = 0; i < 4; i++) {
        state = tick(state)
      }

      expect(state.ending).toBeDefined()
      expect(state.ending?.type).toBe('lose')
      expect(state.ending?.reason).toBe('bankruptcy')
      expect(state.bankruptTicks).toBe(4)
    })

    it('should reset bankruptcy counter if cash becomes positive', () => {
      // Use default initial state with lots of employees and cash
      const initial = createInitialState('test-bankruptcy-reset-seed')

      // Simulate having been bankrupt for 2 ticks by manually setting the field
      let state: SimulationState = {
        ...initial,
        bankruptTicks: 2,
        company: {
          ...initial.company,
          cash: 100_000_000_000, // Huge cash reserves
        },
      }

      state = tick(state)

      // With positive cash, bankruptcy counter should reset
      expect(state.bankruptTicks).toBe(0)
      expect(state.ending).toBeUndefined()
    })
  })

  describe('LOSE condition: delisted', () => {
    it('should trigger LOSE ending when delisted flag is set', () => {
      const state: SimulationState = {
        ...createInitialState('test-delisted-seed'),
        delisted: true,
      }

      const nextState = tick(state)

      expect(nextState.ending).toBeDefined()
      expect(nextState.ending?.type).toBe('lose')
      expect(nextState.ending?.reason).toBe('delisted')
    })
  })

  describe('LOSE condition: catastrophic failure', () => {
    it('should trigger LOSE ending when catastrophicFailure flag is set', () => {
      const state: SimulationState = {
        ...createInitialState('test-catastrophic-seed'),
        catastrophicFailure: true,
      }

      const nextState = tick(state)

      expect(nextState.ending).toBeDefined()
      expect(nextState.ending?.type).toBe('lose')
      expect(nextState.ending?.reason).toBe('catastrophic')
    })
  })

  describe('Determinism', () => {
    it('should produce identical endings with same seed', () => {
      const seed = 'determinism-test-seed'
      let state1 = createInitialState(seed)
      let state2 = createInitialState(seed)

      // Run both simulations for 50 ticks
      for (let i = 0; i < 50; i++) {
        state1 = tick(state1)
        state2 = tick(state2)
      }

      // Both should have identical ending states
      expect(state1.ending).toEqual(state2.ending)
      expect(state1.bankruptTicks).toBe(state2.bankruptTicks)
      expect(state1.delisted).toBe(state2.delisted)
      expect(state1.catastrophicFailure).toBe(state2.catastrophicFailure)
    })
  })

  describe('Ending persistence', () => {
    it('should maintain ending once set', () => {
      let state: SimulationState = {
        ...createInitialState('test-persistence-seed'),
        company: {
          ...createInitialState('test-persistence-seed').company,
          cash: 1_000_000,
          roles: {
            support: { headcount: 0, automationLevel: 1.0 },
            sales: { headcount: 1, automationLevel: 0 },
            engineering: { headcount: 0, automationLevel: 1.0 },
            legal: { headcount: 0, automationLevel: 1.0 },
            compliance: { headcount: 0, automationLevel: 1.0 },
          },
        },
      }

      // Trigger WIN
      state = tick(state)
      const firstEnding = state.ending

      expect(firstEnding).toBeDefined()

      // Run another tick - ending should persist
      state = tick(state)

      expect(state.ending).toEqual(firstEnding)
    })
  })
})
