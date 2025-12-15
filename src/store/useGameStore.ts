import { create } from 'zustand'

export interface CompanyMetrics {
  ticker: string
  headcount: number
  cash: number
  burnRate: number
  revenue: number
  stockPrice: number
  marketCap: number
}

export interface GameState {
  tick: number
  company: CompanyMetrics
  events: string[]
}

interface GameStore extends GameState {
  advanceTick: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  tick: 0,
  company: {
    ticker: 'DNSZ',
    headcount: 50000,
    cash: 40_000_000_000,
    burnRate: 70_000_000_000,
    revenue: 150_000_000_000,
    stockPrice: 666,
    marketCap: 1_500_000_000_000,
  },
  events: ['Simulation initialized. Welcome to One Person Left.'],
  advanceTick: () =>
    set((state) => ({
      tick: state.tick + 1,
      events: [...state.events, `Week ${state.tick + 1}: Time advances...`],
    })),
}))
