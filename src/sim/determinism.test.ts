import { describe, it, expect } from 'vitest'
import { createInitialState, tick, reduce } from './index'
import { actions } from './actions'

describe('Simulation Determinism', () => {
  it('should produce identical states with same seed after 10 ticks', () => {
    const seed = 'determinism-test-10-ticks'

    // Run simulation A
    let stateA = createInitialState(seed)
    for (let i = 0; i < 10; i++) {
      stateA = tick(stateA)
    }

    // Run simulation B with same seed
    let stateB = createInitialState(seed)
    for (let i = 0; i < 10; i++) {
      stateB = tick(stateB)
    }

    // States should be identical
    expect(stateA).toEqual(stateB)
  })

  it('should produce identical outcomes with same seed and action sequence', () => {
    const seed = 'determinism-test-actions'

    // Run simulation A with actions
    let stateA = createInitialState(seed)
    stateA = tick(stateA)
    stateA = reduce(stateA, actions.setAutomation('support', 0.5))
    stateA = tick(stateA)
    stateA = reduce(stateA, actions.fire('sales', 1000))
    stateA = tick(stateA)
    stateA = tick(stateA)

    // Run simulation B with same seed and actions
    let stateB = createInitialState(seed)
    stateB = tick(stateB)
    stateB = reduce(stateB, actions.setAutomation('support', 0.5))
    stateB = tick(stateB)
    stateB = reduce(stateB, actions.fire('sales', 1000))
    stateB = tick(stateB)
    stateB = tick(stateB)

    // States should be identical
    expect(stateA).toEqual(stateB)
    expect(stateA.tick).toBe(4)
    expect(stateB.tick).toBe(4)
  })

  it('should produce different outcomes with different seeds', () => {
    const seedA = 'determinism-test-seed-a'
    const seedB = 'determinism-test-seed-b'

    // Run simulation A
    let stateA = createInitialState(seedA)
    for (let i = 0; i < 10; i++) {
      stateA = tick(stateA)
    }

    // Run simulation B with different seed
    let stateB = createInitialState(seedB)
    for (let i = 0; i < 10; i++) {
      stateB = tick(stateB)
    }

    // Seeds should be different
    expect(stateA.seed).not.toBe(stateB.seed)

    // At least one of these should differ (with high probability)
    // Testing that randomness actually affects outcomes
    const statesAreDifferent =
      stateA.company.cash !== stateB.company.cash ||
      stateA.company.stockPrice !== stateB.company.stockPrice ||
      stateA.events.length !== stateB.events.length

    expect(statesAreDifferent).toBe(true)
  })

  it('should produce different results when action order changes', () => {
    const seed = 'determinism-test-order'

    // Run simulation A: Fire first, then set automation
    let stateA = createInitialState(seed)
    stateA = tick(stateA)
    stateA = reduce(stateA, actions.fire('sales', 1000))
    stateA = reduce(stateA, actions.setAutomation('support', 0.5))
    stateA = tick(stateA)

    // Run simulation B: Set automation first, then fire
    let stateB = createInitialState(seed)
    stateB = tick(stateB)
    stateB = reduce(stateB, actions.setAutomation('support', 0.5))
    stateB = reduce(stateB, actions.fire('sales', 1000))
    stateB = tick(stateB)

    // Event messages should differ because action order differs
    // Get the action events (skip the initial "Simulation initialized" event)
    const actionEventsA = stateA.events.filter((e) => e.tick > 0)
    const actionEventsB = stateB.events.filter((e) => e.tick > 0)

    // Both should have recorded the actions, but in different order
    // Find the 'fire' event in each
    const fireEventA = actionEventsA.find((e) => e.message.includes('Fired'))
    const fireEventB = actionEventsB.find((e) => e.message.includes('Fired'))

    const automationEventA = actionEventsA.find((e) => e.message.includes('automation'))
    const automationEventB = actionEventsB.find((e) => e.message.includes('automation'))

    // Both should have these events
    expect(fireEventA).toBeDefined()
    expect(fireEventB).toBeDefined()
    expect(automationEventA).toBeDefined()
    expect(automationEventB).toBeDefined()

    // The events array order should reflect the action order
    const fireIndexA = actionEventsA.indexOf(fireEventA!)
    const automationIndexA = actionEventsA.indexOf(automationEventA!)
    const fireIndexB = actionEventsB.indexOf(fireEventB!)
    const automationIndexB = actionEventsB.indexOf(automationEventB!)

    // In stateA, fire comes before automation
    // In stateB, automation comes before fire
    expect(fireIndexA < automationIndexA).toBe(true)
    expect(automationIndexB < fireIndexB).toBe(true)
  })

  it('should be deterministic across multiple action types', () => {
    const seed = 'determinism-test-complex'

    // Complex action sequence
    const runSimulation = () => {
      let state = createInitialState(seed)
      state = tick(state)
      state = reduce(state, actions.hire('engineering', 500))
      state = tick(state)
      state = reduce(state, actions.setAutomation('support', 0.3))
      state = tick(state)
      state = reduce(state, actions.fire('compliance', 200))
      state = tick(state)
      state = reduce(state, actions.deployAgent('generalist'))
      state = tick(state)
      return state
    }

    const stateA = runSimulation()
    const stateB = runSimulation()

    // Should be completely identical
    expect(stateA).toEqual(stateB)
  })

  it('should maintain determinism after agent deployment', () => {
    const seed = 'determinism-test-agents'

    // Run with agent deployment
    const runWithAgent = () => {
      let state = createInitialState(seed)
      state = tick(state)
      state = tick(state)
      state = reduce(state, actions.deployAgent('generalist'))
      state = tick(state)
      state = tick(state)
      return state
    }

    const stateA = runWithAgent()
    const stateB = runWithAgent()

    // Agent IDs should be deterministic
    expect(stateA.company.agents.length).toBe(stateB.company.agents.length)
    expect(stateA.company.agents[0].id).toBe(stateB.company.agents[0].id)
    expect(stateA).toEqual(stateB)
  })

  it('should be deterministic even with game ending', () => {
    const seed = 'determinism-test-ending'

    // Force bankruptcy by firing everyone and running out of money
    const runToBankruptcy = () => {
      let state = createInitialState(seed)
      // Fire most employees to reduce burn rate isn't enough, we need to actually run out of cash
      // Let's just run many ticks to see if game ends deterministically
      for (let i = 0; i < 200; i++) {
        if (state.ending) break
        state = tick(state)
      }
      return state
    }

    const stateA = runToBankruptcy()
    const stateB = runToBankruptcy()

    // Endings should be identical
    expect(stateA.ending).toEqual(stateB.ending)
    expect(stateA.tick).toBe(stateB.tick)
  })
})
