/**
 * Player actions that can modify simulation state
 * Actions are the only way to interact with the simulation (besides advancing time)
 */

import type { Role, AgentType } from './types'

export type GameAction =
  | { type: 'SET_AUTOMATION'; role: Role; level: number }
  | { type: 'HIRE'; role: Role; count: number }
  | { type: 'FIRE'; role: Role; count: number }
  | { type: 'DEPLOY_AGENT'; agentType: AgentType }
  | { type: 'AUTOMATE_ROLE'; role: Role; agentId: string }
  | { type: 'ADVANCE_TICK' }

/**
 * Action creator helpers for type safety and convenience
 */
export const actions = {
  setAutomation: (role: Role, level: number): GameAction => ({
    type: 'SET_AUTOMATION',
    role,
    level: Math.max(0, Math.min(1, level)), // Clamp to [0, 1]
  }),

  hire: (role: Role, count: number): GameAction => ({
    type: 'HIRE',
    role,
    count: Math.max(0, Math.floor(count)), // Non-negative integers only
  }),

  fire: (role: Role, count: number): GameAction => ({
    type: 'FIRE',
    role,
    count: Math.max(0, Math.floor(count)), // Non-negative integers only
  }),

  advanceTick: (): GameAction => ({
    type: 'ADVANCE_TICK',
  }),

  deployAgent: (agentType: AgentType): GameAction => ({
    type: 'DEPLOY_AGENT',
    agentType,
  }),

  automateRole: (role: Role, agentId: string): GameAction => ({
    type: 'AUTOMATE_ROLE',
    role,
    agentId,
  }),
}
