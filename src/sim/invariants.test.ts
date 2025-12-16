import { describe, it, expect } from 'vitest'
import { createInitialState, tick, reduce, getTotalHeadcount } from './index'
import { actions } from './actions'
import type { Role } from './types'

describe('Simulation Invariants', () => {
  it('should never have negative headcount in any role', () => {
    let state = createInitialState('invariants-test-headcount')

    // Try to create negative headcount scenarios
    for (let i = 0; i < 50; i++) {
      state = tick(state)

      // Fire more than available (should be capped at 0)
      state = reduce(state, actions.fire('support', 999999))
      state = reduce(state, actions.fire('sales', 999999))
      state = reduce(state, actions.fire('engineering', 999999))

      // Check all roles
      const roles: Role[] = ['support', 'sales', 'engineering', 'legal', 'compliance']
      for (const role of roles) {
        expect(state.company.roles[role].headcount).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('should maintain headcount consistency: total equals sum of roles', () => {
    let state = createInitialState('invariants-test-consistency')

    for (let i = 0; i < 30; i++) {
      state = tick(state)
      state = reduce(state, actions.hire('engineering', 100))
      state = reduce(state, actions.fire('sales', 50))

      // Calculate total headcount manually
      const manualTotal =
        state.company.roles.support.headcount +
        state.company.roles.sales.headcount +
        state.company.roles.engineering.headcount +
        state.company.roles.legal.headcount +
        state.company.roles.compliance.headcount

      // Compare with helper function
      const helperTotal = getTotalHeadcount(state)

      expect(manualTotal).toBe(helperTotal)
    }
  })

  it('should make ending sticky once set (never unset)', () => {
    let state = createInitialState('invariants-test-ending')

    // Run until game ends
    for (let i = 0; i < 300; i++) {
      state = tick(state)

      if (state.ending) {
        // Capture the ending
        const firstEnding = state.ending

        // Continue ticking - ending should never change
        for (let j = 0; j < 10; j++) {
          state = tick(state)
          expect(state.ending).toBeDefined()
          expect(state.ending).toEqual(firstEnding)
        }

        // Found and verified ending is sticky
        return
      }
    }

    // If we get here, game didn't end in 300 ticks - that's fine for this test
    // The important thing is that IF an ending is set, it stays set
  })

  it('should keep automation percentages in [0, 1] range', () => {
    let state = createInitialState('invariants-test-automation')

    const roles: Role[] = ['support', 'sales', 'engineering', 'legal', 'compliance']

    for (let i = 0; i < 50; i++) {
      state = tick(state)

      // Try to set automation beyond bounds (should be clamped)
      state = reduce(state, actions.setAutomation('support', 1.5)) // Above 1
      state = reduce(state, actions.setAutomation('sales', -0.5)) // Below 0
      state = reduce(state, actions.setAutomation('engineering', 0.5)) // Normal

      // Check all roles stay in bounds
      for (const role of roles) {
        const automation = state.company.roles[role].automationLevel
        expect(automation).toBeGreaterThanOrEqual(0)
        expect(automation).toBeLessThanOrEqual(1)
        expect(Number.isFinite(automation)).toBe(true)
      }
    }
  })

  it('should keep risk metrics in [0, 1] range', () => {
    let state = createInitialState('invariants-test-risk')

    for (let i = 0; i < 100; i++) {
      state = tick(state)

      // Deploy agents to increase risk
      if (i % 10 === 0) {
        state = reduce(state, actions.deployAgent('generalist'))
      }

      // Set high automation
      if (i % 5 === 0) {
        state = reduce(state, actions.setAutomation('support', 0.9))
      }

      // All risk metrics must stay in [0, 1]
      expect(state.hidden.complianceRisk).toBeGreaterThanOrEqual(0)
      expect(state.hidden.complianceRisk).toBeLessThanOrEqual(1)
      expect(Number.isFinite(state.hidden.complianceRisk)).toBe(true)

      expect(state.hidden.auditRisk).toBeGreaterThanOrEqual(0)
      expect(state.hidden.auditRisk).toBeLessThanOrEqual(1)
      expect(Number.isFinite(state.hidden.auditRisk)).toBe(true)

      expect(state.hidden.agentRisk).toBeGreaterThanOrEqual(0)
      expect(state.hidden.agentRisk).toBeLessThanOrEqual(1)
      expect(Number.isFinite(state.hidden.agentRisk)).toBe(true)
    }
  })

  it('should never produce NaN or undefined for cash/stock/revenue', () => {
    let state = createInitialState('invariants-test-nan')

    for (let i = 0; i < 100; i++) {
      state = tick(state)

      // Perform random actions
      if (i % 3 === 0) {
        state = reduce(state, actions.fire('sales', 500))
      }
      if (i % 7 === 0) {
        state = reduce(state, actions.deployAgent('engineer'))
      }

      // Critical financial metrics must be valid numbers
      expect(Number.isFinite(state.company.cash)).toBe(true)
      expect(Number.isNaN(state.company.cash)).toBe(false)

      expect(Number.isFinite(state.company.stockPrice)).toBe(true)
      expect(Number.isNaN(state.company.stockPrice)).toBe(false)

      expect(Number.isFinite(state.company.revenue)).toBe(true)
      expect(Number.isNaN(state.company.revenue)).toBe(false)

      expect(Number.isFinite(state.company.burnRate)).toBe(true)
      expect(Number.isNaN(state.company.burnRate)).toBe(false)

      expect(Number.isFinite(state.company.marketCap)).toBe(true)
      expect(Number.isNaN(state.company.marketCap)).toBe(false)
    }
  })

  it('should never allow negative total headcount', () => {
    let state = createInitialState('invariants-test-total-negative')

    for (let i = 0; i < 50; i++) {
      state = tick(state)

      // Fire everyone
      const roles: Role[] = ['support', 'sales', 'engineering', 'legal', 'compliance']
      for (const role of roles) {
        state = reduce(state, actions.fire(role, 999999))
      }

      const totalHeadcount = getTotalHeadcount(state)
      expect(totalHeadcount).toBeGreaterThanOrEqual(0)
    }
  })

  it('should never produce negative burn rate or revenue', () => {
    let state = createInitialState('invariants-test-financials')

    for (let i = 0; i < 50; i++) {
      state = tick(state)

      // Even with extreme scenarios, these should never be negative
      expect(state.company.burnRate).toBeGreaterThanOrEqual(0)
      expect(state.company.revenue).toBeGreaterThanOrEqual(0)
    }
  })

  it('should handle automation with agent deployment maintaining invariants', () => {
    let state = createInitialState('invariants-test-agent-automation')

    // Deploy agent and automate role
    state = tick(state)
    state = reduce(state, actions.deployAgent('generalist'))
    const agentId = state.company.agents[0].id

    for (let i = 0; i < 20; i++) {
      state = tick(state)

      // Try to automate support role (generalist can do this)
      state = reduce(state, actions.automateRole('support', agentId))

      // Automation should stay in bounds
      expect(state.company.roles.support.automationLevel).toBeGreaterThanOrEqual(0)
      expect(state.company.roles.support.automationLevel).toBeLessThanOrEqual(1)

      // Headcount should stay non-negative
      expect(state.company.roles.support.headcount).toBeGreaterThanOrEqual(0)
    }
  })

  it('should never produce invalid stock price or market cap', () => {
    let state = createInitialState('invariants-test-market')

    for (let i = 0; i < 100; i++) {
      state = tick(state)

      // Stock price must be non-negative
      expect(state.company.stockPrice).toBeGreaterThanOrEqual(0)
      expect(Number.isFinite(state.company.stockPrice)).toBe(true)

      // Market cap must be non-negative
      expect(state.company.marketCap).toBeGreaterThanOrEqual(0)
      expect(Number.isFinite(state.company.marketCap)).toBe(true)
    }
  })
})
