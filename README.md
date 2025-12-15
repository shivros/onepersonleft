# One Person Left - Phase 2

A simulation exploring AI-driven workforce automation in a big tech company.

## Phase 2 Completion Summary

Phase 2 implements a deterministic, pure TypeScript simulation core, replacing Phase 1's mock data with real game logic.

### What Was Built

1. **Simulation Core (`/src/sim`)**
   - **types.ts** - Core data structures (roles, company state, events, hidden metrics)
   - **rng.ts** - Seeded PRNG (mulberry32) for deterministic randomness
   - **actions.ts** - Player actions (hire, fire, set automation)
   - **reduce.ts** - Pure reducer for applying actions to state
   - **tick.ts** - Time advancement logic with financial calculations
   - **index.ts** - Public API and initial state creator

2. **Game Mechanics**
   - **5 Employee Roles**: Support, Sales, Engineering, Legal, Compliance
   - **Initial Headcount**: 50,000 total (15k support, 10k sales, 15k engineering, 5k legal, 5k compliance)
   - **Automation**: 0-100% per role, affects costs and revenue
   - **Financial Model**:
     - Role-specific costs (engineers: $200k/yr, sales: $150k/yr, etc.)
     - Automation reduces burn rate up to 30%
     - Sales generates revenue ($500k/employee/yr base)
     - Automation boosts sales revenue up to 50%
     - Weekly cash updates based on revenue - burn rate
   - **Stock Price**: Dynamic calculation based on cash/employee and revenue/employee
   - **Hidden Metrics**: Compliance risk, audit risk, agent risk (not shown to player)
   - **Random Events**: Low-probability incidents based on risk levels

3. **State Management Integration**
   - Zustand store refactored to wrap simulation core
   - UI components unchanged (maintain Phase 1 interface)
   - Added role automation controls to ActionsPanel
   - Reset button for restarting simulation

4. **Testing Infrastructure**
   - Vitest configured for pure TypeScript testing
   - 17 tests across 3 suites (rng, reduce, tick)
   - Test coverage for:
     - Determinism (same seed = same results)
     - Non-negative invariants (no negative cash/headcount)
     - Pure functions (no mutations)
     - Range constraints (automation 0-1, risks 0-1)

### Success Criteria Met

✅ Pure `/src/sim` module with no browser dependencies
✅ Seeded RNG for 100% determinism
✅ Role-specific costs and automation mechanics
✅ Financial calculations (burn rate, revenue, cash flow)
✅ Stock price simulation with random walk
✅ Hidden risk metrics (compliance, audit, agent)
✅ Event log with structured events (type + message)
✅ Zustand store integrated with simulation
✅ Automation controls in UI
✅ Test suite with determinism tests
✅ All tests passing
✅ No TypeScript or linting errors
✅ Production build succeeds

### Running the Application

```bash
# Install dependencies
pnpm install

# Start development server (auto-selects available port)
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Run linter
pnpm lint

# Build for production
pnpm build
```

### Architecture

**Module Dependency Flow:**

```
types → rng → actions → reduce → tick → index (sim public API)
                                          ↓
                                    useGameStore (Zustand)
                                          ↓
                                    UI Components
```

**Key Design Decisions:**

- **Determinism**: Same seed + same actions = identical outcomes
- **Pure Functions**: All sim functions are pure (no side effects)
- **No Browser APIs**: Simulation never calls Math.random(), Date.now(), or any browser APIs
- **Immutable Updates**: All state changes return new objects
- **Thin Store Layer**: Zustand store is just a wrapper calling sim functions

### File Structure

```
src/
├── sim/                      # Pure simulation logic (no React/browser deps)
│   ├── types.ts              # Core types and constants
│   ├── rng.ts                # Seeded random number generator
│   ├── actions.ts            # Player action types
│   ├── reduce.ts             # Pure state reducer
│   ├── tick.ts               # Time advancement logic
│   ├── index.ts              # Public API
│   ├── rng.test.ts           # RNG determinism tests
│   ├── reduce.test.ts        # Reducer purity tests
│   └── tick.test.ts          # Simulation invariant tests
├── store/
│   └── useGameStore.ts       # Zustand store (wraps sim)
└── lib/components/
    ├── Dashboard.tsx         # Main layout
    ├── CompanySnapshot.tsx   # Metrics display
    ├── ActionsPanel.tsx      # Time + automation controls
    └── EventLog.tsx          # Event history
```

### Initial Conditions

- **Ticker**: DNSZ
- **Cash**: $40B
- **Roles**: 50,000 total employees across 5 departments
- **Automation**: 0% (all roles start manual)
- **Seed**: "default-seed" (hardcoded for Phase 2)

### Testing

The test suite validates core properties:

1. **Determinism**: Same seed produces identical sequences
2. **Non-negativity**: Cash, headcount, prices never go negative
3. **Range Constraints**: Automation [0,1], risks [0,1]
4. **Immutability**: Reducers don't mutate input state
5. **Consistency**: Financial calculations follow expected formulas

Run `pnpm test` to verify all invariants hold.

### Next Steps (Phase 3+)

Phase 2 implements core mechanics. Future phases could add:

- **UI Enhancements**: Charts, graphs, risk meters
- **Advanced Features**: Hiring/firing UI, incident handling, audits
- **AI Agents**: Autonomous agents with personalities and goals
- **Win/Loss Conditions**: Bankruptcy detection, game over states
- **Persistence**: Save/load game state
- **Seed Management**: Custom seeds, sharing scenarios
- **Event Filtering**: Filter by type/severity

### Verification

- **Tests**: 17/17 passing (`pnpm test`)
- **Lint**: No errors or warnings (`pnpm lint`)
- **Build**: Clean TypeScript compilation (`pnpm build`)
- **Determinism**: Same actions produce identical results
- **Simulation**: Company metrics update realistically over time

### Known Limitations

- No persistence (state resets on page refresh)
- Hardcoded seed (cannot customize)
- Simple stock price model (not realistic)
- No hire/fire UI controls yet (only automation sliders)
- Events can accumulate unbounded (no limit on event log size)
