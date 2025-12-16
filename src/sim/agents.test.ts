/**
 * Phase 3 tests - Agent deployment and role automation
 */

import { describe, it, expect } from 'vitest'
import { createInitialState, reduce, actions, tick, AGENT_CONFIGS } from './index'

describe('Agent Deployment', () => {
  it('should deploy an agent and deduct deployment cost', () => {
    const state = createInitialState()
    const initialCash = state.company.cash

    const newState = reduce(state, actions.deployAgent('generalist'))

    expect(newState.company.agents).toHaveLength(1)
    expect(newState.company.agents[0].type).toBe('generalist')
    expect(newState.company.cash).toBe(initialCash - AGENT_CONFIGS.generalist.deploymentCost)
  })

  it('should allow deployment even with insufficient funds (debt)', () => {
    let state = createInitialState()
    // Drain cash by deploying many expensive agents (100M each)
    // Initial cash is 40B, so we need 400+ deployments to go negative
    // Instead, let's manually set cash low for testing
    state = {
      ...state,
      company: {
        ...state.company,
        cash: 50_000_000, // $50M - less than engineer deployment cost
      },
    }

    // Should still allow deployment (going into debt)
    const newState = reduce(state, actions.deployAgent('engineer'))
    expect(newState.company.cash).toBeLessThan(0)
    expect(newState.company.agents).toHaveLength(1)
  })

  it('should generate unique agent IDs', () => {
    let state = createInitialState()

    state = reduce(state, actions.deployAgent('generalist'))
    state = reduce(state, actions.deployAgent('support'))

    const ids = state.company.agents.map((a) => a.id)
    expect(new Set(ids).size).toBe(2) // All IDs are unique
  })

  it('should record deployment tick', () => {
    let state = createInitialState()
    expect(state.tick).toBe(0)

    state = reduce(state, actions.deployAgent('generalist'))
    expect(state.company.agents[0].deployedAt).toBe(0)

    state = tick(state)
    state = reduce(state, actions.deployAgent('support'))
    expect(state.company.agents[1].deployedAt).toBe(1)
  })
})

describe('Role Automation', () => {
  it('should automate role when compatible agent exists', () => {
    let state = createInitialState()
    const initialHeadcount = state.company.roles.support.headcount

    // Deploy agent that can automate support
    state = reduce(state, actions.deployAgent('generalist'))
    const agentId = state.company.agents[0].id

    // Automate support role
    state = reduce(state, actions.automateRole('support', agentId))

    expect(state.company.roles.support.automationLevel).toBe(0.1)
    expect(state.company.roles.support.headcount).toBeLessThan(initialHeadcount)
  })

  it('should fail when agent does not exist', () => {
    const state = createInitialState()

    const newState = reduce(state, actions.automateRole('support', 'nonexistent-agent'))

    // Should add error event
    const lastEvent = newState.events[newState.events.length - 1]
    expect(lastEvent.type).toBe('danger')
    expect(lastEvent.message).toContain('agent not found')
  })

  it('should fail when agent cannot handle role', () => {
    let state = createInitialState()

    // Deploy support agent (can only automate support)
    state = reduce(state, actions.deployAgent('support'))
    const agentId = state.company.agents[0].id

    // Try to automate engineering (incompatible)
    const newState = reduce(state, actions.automateRole('engineering', agentId))

    // Should add error event
    const lastEvent = newState.events[newState.events.length - 1]
    expect(lastEvent.type).toBe('danger')
    expect(lastEvent.message).toContain('cannot automate')
  })

  it('should reduce headcount proportionally to automation increase', () => {
    let state = createInitialState()
    const initialHeadcount = state.company.roles.support.headcount

    state = reduce(state, actions.deployAgent('generalist'))
    const agentId = state.company.agents[0].id

    state = reduce(state, actions.automateRole('support', agentId))

    const expectedReduction = Math.floor(initialHeadcount * 0.1)
    const actualReduction = initialHeadcount - state.company.roles.support.headcount

    expect(actualReduction).toBe(expectedReduction)
  })

  it('should cap automation at 100%', () => {
    let state = createInitialState()

    state = reduce(state, actions.deployAgent('generalist'))
    const agentId = state.company.agents[0].id

    // Try to automate 11 times (should cap at 100%)
    for (let i = 0; i < 11; i++) {
      state = reduce(state, actions.automateRole('support', agentId))
    }

    expect(state.company.roles.support.automationLevel).toBe(1.0)
  })

  it('should allow multiple agents to automate same role', () => {
    let state = createInitialState()

    state = reduce(state, actions.deployAgent('generalist'))
    state = reduce(state, actions.deployAgent('support'))

    const agent1Id = state.company.agents[0].id
    const agent2Id = state.company.agents[1].id

    state = reduce(state, actions.automateRole('support', agent1Id))
    expect(state.company.roles.support.automationLevel).toBe(0.1)

    state = reduce(state, actions.automateRole('support', agent2Id))
    expect(state.company.roles.support.automationLevel).toBe(0.2)
  })
})

describe('Agent Costs in Tick', () => {
  it('should add agent annual costs to burn rate', () => {
    let state = createInitialState()

    // Tick once to get baseline burn rate
    state = tick(state)
    const baselineBurnRate = state.company.burnRate

    // Deploy agent
    state = reduce(state, actions.deployAgent('generalist'))

    // Tick again
    state = tick(state)

    const expectedIncrease = AGENT_CONFIGS.generalist.annualCost
    expect(state.company.burnRate).toBeCloseTo(baselineBurnRate + expectedIncrease, -5)
  })

  it('should accumulate costs for multiple agents', () => {
    let state = createInitialState()

    state = tick(state)
    const baselineBurnRate = state.company.burnRate

    state = reduce(state, actions.deployAgent('generalist'))
    state = reduce(state, actions.deployAgent('support'))
    state = reduce(state, actions.deployAgent('engineer'))

    state = tick(state)

    const expectedIncrease =
      AGENT_CONFIGS.generalist.annualCost +
      AGENT_CONFIGS.support.annualCost +
      AGENT_CONFIGS.engineer.annualCost

    expect(state.company.burnRate).toBeCloseTo(baselineBurnRate + expectedIncrease, -5)
  })
})

describe('Agent Risk Calculation', () => {
  it('should increase agent risk with low-reliability agents', () => {
    let state = createInitialState()

    // Tick to get baseline risk
    state = tick(state)
    const baselineRisk = state.hidden.agentRisk

    // Deploy low-reliability engineer agent (0.6 reliability)
    state = reduce(state, actions.deployAgent('engineer'))

    // Tick to calculate new risk
    state = tick(state)

    // Risk should increase (lower reliability = higher risk)
    expect(state.hidden.agentRisk).toBeGreaterThan(baselineRisk)
  })

  it('should have lower risk with high-reliability agents', () => {
    let state1 = createInitialState()
    let state2 = createInitialState()

    // State 1: Deploy low-reliability engineer (0.6)
    state1 = reduce(state1, actions.deployAgent('engineer'))
    state1 = tick(state1)

    // State 2: Deploy high-reliability support agent (0.8)
    state2 = reduce(state2, actions.deployAgent('support'))
    state2 = tick(state2)

    // Lower reliability should result in higher risk
    // (Note: there's randomness, so we check multiple ticks)
    let engineer_risk_sum = 0
    let support_risk_sum = 0

    for (let i = 0; i < 10; i++) {
      state1 = tick(state1)
      state2 = tick(state2)
      engineer_risk_sum += state1.hidden.agentRisk
      support_risk_sum += state2.hidden.agentRisk
    }

    // Engineer agent should have higher average risk
    expect(engineer_risk_sum / 10).toBeGreaterThan(support_risk_sum / 10)
  })
})

describe('Integration: Full Automation Flow', () => {
  it('should complete a full automation cycle', () => {
    let state = createInitialState()
    const initialCash = state.company.cash
    const initialHeadcount = state.company.roles.support.headcount

    // Deploy agent
    state = reduce(state, actions.deployAgent('generalist'))
    expect(state.company.agents).toHaveLength(1)

    // Automate role
    const agentId = state.company.agents[0].id
    state = reduce(state, actions.automateRole('support', agentId))

    expect(state.company.roles.support.automationLevel).toBe(0.1)
    expect(state.company.roles.support.headcount).toBeLessThan(initialHeadcount)

    // Advance tick and check costs
    state = tick(state)

    expect(state.company.burnRate).toBeGreaterThan(0)
    expect(state.company.cash).toBeLessThan(initialCash - AGENT_CONFIGS.generalist.deploymentCost)
    expect(state.tick).toBe(1)
  })

  it('should handle multiple automation steps', () => {
    let state = createInitialState()

    // Deploy multiple agents
    state = reduce(state, actions.deployAgent('generalist'))
    state = reduce(state, actions.deployAgent('support'))
    state = reduce(state, actions.deployAgent('engineer'))

    expect(state.company.agents).toHaveLength(3)

    // Automate different roles
    const agent1 = state.company.agents[0]
    const agent2 = state.company.agents[1]
    const agent3 = state.company.agents[2]

    state = reduce(state, actions.automateRole('support', agent1.id))
    state = reduce(state, actions.automateRole('support', agent2.id))
    state = reduce(state, actions.automateRole('engineering', agent3.id))

    expect(state.company.roles.support.automationLevel).toBe(0.2)
    expect(state.company.roles.engineering.automationLevel).toBe(0.1)

    // Advance several weeks
    for (let i = 0; i < 10; i++) {
      state = tick(state)
    }

    expect(state.tick).toBe(10)
    expect(state.company.cash).toBeGreaterThan(0) // Should still have cash
  })
})
