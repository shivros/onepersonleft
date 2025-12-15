import { describe, it, expect } from 'vitest'
import { createInitialState, reduce, actions } from './index'

describe('State Reducer', () => {
  it('should handle SET_AUTOMATION action', () => {
    const state0 = createInitialState()
    const state1 = reduce(state0, actions.setAutomation('engineering', 0.5))

    expect(state1.company.roles.engineering.automationLevel).toBe(0.5)
    expect(state1.events.length).toBeGreaterThan(state0.events.length)
  })

  it('should clamp automation level to [0, 1]', () => {
    const state0 = createInitialState()

    const stateNeg = reduce(state0, actions.setAutomation('sales', -0.5))
    expect(stateNeg.company.roles.sales.automationLevel).toBe(0)

    const stateOver = reduce(state0, actions.setAutomation('sales', 1.5))
    expect(stateOver.company.roles.sales.automationLevel).toBe(1)
  })

  it('should handle HIRE action', () => {
    const state0 = createInitialState()
    const initialHeadcount = state0.company.roles.support.headcount

    const state1 = reduce(state0, actions.hire('support', 100))

    expect(state1.company.roles.support.headcount).toBe(initialHeadcount + 100)
    expect(state1.events.length).toBeGreaterThan(state0.events.length)
  })

  it('should handle FIRE action', () => {
    const state0 = createInitialState()
    const initialHeadcount = state0.company.roles.legal.headcount

    const state1 = reduce(state0, actions.fire('legal', 50))

    expect(state1.company.roles.legal.headcount).toBe(initialHeadcount - 50)
    expect(state1.events.length).toBeGreaterThan(state0.events.length)
  })

  it('should not fire more employees than exist', () => {
    const state0 = createInitialState()
    const initialHeadcount = state0.company.roles.compliance.headcount

    const state1 = reduce(state0, actions.fire('compliance', initialHeadcount + 1000))

    expect(state1.company.roles.compliance.headcount).toBe(0)
  })

  it('should be a pure function (not mutate input)', () => {
    const state0 = createInitialState()
    const state0Copy = JSON.parse(JSON.stringify(state0))

    reduce(state0, actions.hire('sales', 100))

    expect(state0).toEqual(state0Copy)
  })
})
