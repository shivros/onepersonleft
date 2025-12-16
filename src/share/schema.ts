/**
 * Zod schema for validating SimulationState during share link decoding
 * Ensures backward/forward compatibility by making new Phase 5 fields optional
 */

import { z } from 'zod'

const RoleSchema = z.enum(['support', 'sales', 'engineering', 'legal', 'compliance'])

const AgentTypeSchema = z.enum(['generalist', 'support', 'engineer', 'compliance'])

const AgentSchema = z.object({
  id: z.string(),
  type: AgentTypeSchema,
  deployedAt: z.number(),
})

const RoleDataSchema = z.object({
  headcount: z.number(),
  automationLevel: z.number(),
})

const CompanyStateSchema = z.object({
  ticker: z.string(),
  cash: z.number(),
  burnRate: z.number(),
  revenue: z.number(),
  stockPrice: z.number(),
  marketCap: z.number(),
  roles: z.record(RoleSchema, RoleDataSchema),
  agents: z.array(AgentSchema),
})

const HiddenMetricsSchema = z.object({
  complianceRisk: z.number(),
  auditRisk: z.number(),
  agentRisk: z.number(),
})

const EventTypeSchema = z.enum(['info', 'warning', 'danger', 'success'])

const GameEventSchema = z.object({
  tick: z.number(),
  type: EventTypeSchema,
  message: z.string(),
})

const EndingSchema = z.object({
  type: z.enum(['win', 'lose']),
  reason: z.string(),
  tick: z.number(),
})

export const SimulationStateSchema = z
  .object({
    tick: z.number(),
    seed: z.string(),
    company: CompanyStateSchema,
    hidden: HiddenMetricsSchema,
    events: z.array(GameEventSchema),
    // Phase 5 fields - optional for backward compatibility
    ending: EndingSchema.optional(),
    bankruptTicks: z.number().optional(),
    delisted: z.boolean().optional(),
    catastrophicFailure: z.boolean().optional(),
  })
  .passthrough() // Allow extra fields for forward compatibility
