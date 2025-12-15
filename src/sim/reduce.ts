/**
 * Pure reducer function for applying actions to simulation state
 * CRITICAL: Must be a pure function - no side effects, no randomness
 */

import type { SimulationState, Role } from './types'
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
