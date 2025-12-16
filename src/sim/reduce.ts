/**
 * Pure reducer function for applying actions to simulation state
 * CRITICAL: Must be a pure function - no side effects, no randomness
 */

import type { SimulationState, Role, Agent } from './types'
import { AGENT_CONFIGS } from './types'
import type { GameAction } from './actions'

/**
 * Apply a single action to the simulation state
 * Returns a new state object (immutable update)
 */
export function reduce(state: SimulationState, action: GameAction): SimulationState {
  switch (action.type) {
    case 'SET_AUTOMATION': {
      const { role, level } = action
      return {
        ...state,
        company: {
          ...state.company,
          roles: {
            ...state.company.roles,
            [role]: {
              ...state.company.roles[role],
              automationLevel: level,
            },
          },
        },
        events: [
          ...state.events,
          {
            tick: state.tick,
            type: 'info',
            message: `Set ${role} automation to ${(level * 100).toFixed(0)}%`,
          },
        ],
      }
    }

    case 'HIRE': {
      const { role, count } = action
      const newHeadcount = state.company.roles[role].headcount + count
      return {
        ...state,
        company: {
          ...state.company,
          roles: {
            ...state.company.roles,
            [role]: {
              ...state.company.roles[role],
              headcount: newHeadcount,
            },
          },
        },
        events: [
          ...state.events,
          {
            tick: state.tick,
            type: 'success',
            message: `Hired ${count} ${role} (now ${newHeadcount})`,
          },
        ],
      }
    }

    case 'FIRE': {
      const { role, count } = action
      const currentHeadcount = state.company.roles[role].headcount
      const actualFired = Math.min(count, currentHeadcount) // Can't fire more than you have
      const newHeadcount = currentHeadcount - actualFired

      return {
        ...state,
        company: {
          ...state.company,
          roles: {
            ...state.company.roles,
            [role]: {
              ...state.company.roles[role],
              headcount: newHeadcount,
            },
          },
        },
        events: [
          ...state.events,
          {
            tick: state.tick,
            type: 'warning',
            message: `Fired ${actualFired} ${role} (now ${newHeadcount})`,
          },
        ],
      }
    }

    case 'DEPLOY_AGENT': {
      const { agentType } = action
      const config = AGENT_CONFIGS[agentType]

      // Check if player can afford the deployment cost
      // Following plan review decision point 3: allow debt with penalties
      const newCash = state.company.cash - config.deploymentCost

      // Generate unique agent ID (using tick + agent count for determinism)
      const agentId = `agent-${state.tick}-${state.company.agents.length}`

      const newAgent: Agent = {
        id: agentId,
        type: agentType,
        deployedAt: state.tick,
      }

      return {
        ...state,
        company: {
          ...state.company,
          cash: newCash,
          agents: [...state.company.agents, newAgent],
        },
        events: [
          ...state.events,
          {
            tick: state.tick,
            type: newCash < 0 ? 'warning' : 'success',
            message: `Deployed ${agentType} agent for $${(config.deploymentCost / 1_000_000).toFixed(0)}M${newCash < 0 ? ' (debt incurred)' : ''}`,
          },
        ],
      }
    }

    case 'AUTOMATE_ROLE': {
      const { role, agentId } = action

      // Verify the agent exists and can handle this role
      const agent = state.company.agents.find((a) => a.id === agentId)
      if (!agent) {
        return {
          ...state,
          events: [
            ...state.events,
            {
              tick: state.tick,
              type: 'danger',
              message: `Failed to automate ${role}: agent not found`,
            },
          ],
        }
      }

      const agentConfig = AGENT_CONFIGS[agent.type]
      const canAutomate = agentConfig.specialization.includes(role)

      if (!canAutomate) {
        return {
          ...state,
          events: [
            ...state.events,
            {
              tick: state.tick,
              type: 'danger',
              message: `${agent.type} agent cannot automate ${role} role`,
            },
          ],
        }
      }

      // Calculate headcount reduction based on automation increase
      // Following plan review decision point 2: store automation level separately
      const currentAutomation = state.company.roles[role].automationLevel
      const newAutomation = Math.min(1.0, currentAutomation + 0.1) // +10% automation
      const currentHeadcount = state.company.roles[role].headcount

      // Reduce headcount proportionally to automation increase
      const automationIncrease = newAutomation - currentAutomation
      const headcountReduction = Math.floor(currentHeadcount * automationIncrease)
      const newHeadcount = Math.max(0, currentHeadcount - headcountReduction)

      return {
        ...state,
        company: {
          ...state.company,
          roles: {
            ...state.company.roles,
            [role]: {
              ...state.company.roles[role],
              automationLevel: newAutomation,
              headcount: newHeadcount,
            },
          },
        },
        events: [
          ...state.events,
          {
            tick: state.tick,
            type: 'success',
            message: `${agent.type} agent automated ${role} to ${(newAutomation * 100).toFixed(0)}% (reduced headcount by ${headcountReduction})`,
          },
        ],
      }
    }

    case 'ADVANCE_TICK':
      // ADVANCE_TICK is handled by the tick function, not here
      // The reducer only handles player actions that modify state directly
      return state

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = action
      void _exhaustive
      return state
    }
  }
}

/**
 * Helper to calculate total headcount across all roles
 */
export function getTotalHeadcount(state: SimulationState): number {
  return Object.values(state.company.roles).reduce((sum, role) => sum + role.headcount, 0)
}

/**
 * Helper to get headcount for a specific role
 */
export function getRoleHeadcount(state: SimulationState, role: Role): number {
  return state.company.roles[role].headcount
}
