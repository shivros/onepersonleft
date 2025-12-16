# One Person Left - Phase 3

A strategic simulation game exploring AI-driven workforce automation in a big tech company.

## Phase 3 Completion Summary

Phase 3 transforms the simulation into an interactive strategy game where players deploy AI agents and use them to automate company roles. This introduces meaningful tradeoffs between cost savings and operational risks.

### What Was Built

1. **AI Agent System**
   - **4 Agent Types**: Generalist, Support, Engineer, Compliance
   - **Agent Properties**:
     - Deployment cost (one-time: $10M-$100M)
     - Annual operational cost ($5M-$30M/year)
     - Reliability rating (60%-80%)
     - Role specialization (which roles they can automate)
   - **Agent Costs**: Added to company burn rate automatically each tick
   - **Risk Modeling**: Low-reliability agents increase incident probability

2. **Role Automation System**
   - **Discrete Automation**: Agents automate roles in 10% increments (not continuous sliders)
   - **Headcount Reduction**: Each automation step reduces headcount proportionally
   - **Compatibility Checking**: Agents can only automate roles in their specialization
   - **Multiple Agents**: Same role can be automated by multiple compatible agents
   - **Automation Cap**: Maximum 100% automation per role

3. **New Game Actions**
   - **DEPLOY_AGENT**: Purchase and deploy an AI agent (costs cash immediately)
   - **AUTOMATE_ROLE**: Use a deployed agent to automate a role by +10%
   - **Debt Mechanic**: Players can go into debt (negative cash) with warning events

4. **UI Components**
   - **AgentPanel.tsx** (new):
     - Displays all 4 agent types with costs and specs
     - Deploy buttons (disabled when insufficient funds)
     - List of currently deployed agents
   - **ActionsPanel.tsx** (refactored):
     - Replaced automation sliders with progress bars (read-only)
     - Added automation buttons per compatible agent
     - Shows which agents can automate each role
   - **Dashboard.tsx** (updated):
     - Restructured to 3-column layout for agent panel

5. **Enhanced Testing**
   - **33 total tests** across 4 test suites
   - New test file: `agents.test.ts` with 16 tests covering:
     - Agent deployment (cash deduction, unique IDs, debt handling)
     - Role automation (headcount reduction, compatibility, error cases)
     - Agent costs in tick calculations
     - Risk calculations based on agent reliability
     - Full integration flows
   - All tests passing with 100% determinism

### Success Criteria Met

✅ **Core Mechanics**:
  - 4 agent types with distinct costs, reliability, and specializations
  - DEPLOY_AGENT action with cash deduction and debt support
  - AUTOMATE_ROLE action with headcount reduction logic
  - Agent costs automatically included in burn rate calculations
  - Risk penalties based on agent reliability

✅ **UI Implementation**:
  - AgentPanel component with deployment interface
  - ActionsPanel refactored for button-based automation
  - Dashboard updated with 3-column layout
  - Proper agent-role compatibility checking

✅ **Testing & Quality**:
  - 33 tests passing (16 new Phase 3 tests)
  - No TypeScript errors
  - No linting warnings
  - Production build succeeds
  - 100% determinism maintained

✅ **Architecture**:
  - Pure simulation core preserved
  - Immutable state updates
  - Agent state stored in CompanyState
  - Zustand store properly wired

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
│   ├── types.ts              # Core types, agent configs, role configs
│   ├── rng.ts                # Seeded random number generator
│   ├── actions.ts            # Player action types (includes DEPLOY_AGENT, AUTOMATE_ROLE)
│   ├── reduce.ts             # Pure state reducer (agent deployment & automation logic)
│   ├── tick.ts               # Time advancement (includes agent costs & risk calculations)
│   ├── index.ts              # Public API
│   ├── rng.test.ts           # RNG determinism tests (5 tests)
│   ├── reduce.test.ts        # Reducer purity tests (6 tests)
│   ├── tick.test.ts          # Simulation invariant tests (6 tests)
│   └── agents.test.ts        # Phase 3 agent/automation tests (16 tests) ✨ NEW
├── store/
│   └── useGameStore.ts       # Zustand store (exposes agents, deployAgent, automateRole)
└── lib/components/
    ├── Dashboard.tsx         # 3-column layout with agent panel ✨ UPDATED
    ├── CompanySnapshot.tsx   # Metrics display
    ├── ActionsPanel.tsx      # Button-based automation controls ✨ UPDATED
    ├── AgentPanel.tsx        # Agent deployment interface ✨ NEW
    └── EventLog.tsx          # Event history
```

### Initial Conditions

- **Ticker**: DNSZ
- **Cash**: $40B
- **Roles**: 50,000 total employees across 5 departments
- **Automation**: 0% (all roles start manual)
- **Agents**: None deployed initially
- **Seed**: "default-seed" (hardcoded)

### Testing

The test suite validates core properties:

1. **Determinism**: Same seed produces identical sequences
2. **Non-negativity**: Cash, headcount, prices never go negative
3. **Range Constraints**: Automation [0,1], risks [0,1]
4. **Immutability**: Reducers don't mutate input state
5. **Consistency**: Financial calculations follow expected formulas

Run `pnpm test` to verify all invariants hold.

### Agent Types Reference

| Agent Type | Deploy Cost | Annual Cost | Reliability | Can Automate |
|------------|-------------|-------------|-------------|--------------|
| Generalist | $10M | $5M/yr | 70% | Support, Sales |
| Support | $25M | $10M/yr | 80% | Support |
| Engineer | $100M | $30M/yr | 60% | Engineering |
| Compliance | $50M | $20M/yr | 75% | Legal, Compliance |

### Gameplay Strategy

**Tradeoffs:**
- Agents reduce headcount → lower salary costs → better margins
- BUT agents cost money to deploy and operate
- AND low-reliability agents increase incident risk
- AND high automation increases fragility

**Optimal Play:**
1. Deploy generalist agents first (cheap, versatile)
2. Automate high-headcount roles (support, engineering)
3. Monitor cash flow (agent costs add to burn rate)
4. Balance risk vs. cost savings
5. Avoid 100% automation too quickly (increased risk)

### Next Steps (Phase 4+)

Phase 3 implements the core gameplay loop. Future phases could add:

- **Win/Loss Conditions**: Reach "1 person left" or go bankrupt
- **Agent Upgrades**: Improve reliability, reduce costs
- **Advanced Events**: PR crises, regulatory audits with financial penalties
- **UI Enhancements**: Risk meters, charts, agent performance tracking
- **Persistence**: Save/load game state
- **Seed Management**: Custom seeds, sharing scenarios
- **Difficulty Levels**: Easy/normal/hard presets

### Verification

- **Tests**: 33/33 passing (`pnpm test`)
- **Lint**: No errors or warnings (`pnpm lint`)
- **Build**: Clean TypeScript compilation (`pnpm build`)
- **Determinism**: Same actions produce identical results
- **Gameplay**: Agent deployment and role automation work as designed
- **Costs**: Agent operational costs properly reflected in burn rate
- **Risks**: Agent reliability impacts incident probabilities

### Known Limitations

- No persistence (state resets on page refresh)
- Hardcoded seed (cannot customize)
- No win/loss conditions (game continues indefinitely)
- No agent upgrades (deferred to Phase 4)
- Simple stock price model (not realistic)
- Events can accumulate unbounded (no limit on event log size)
- No visual risk indicators (hidden metrics not displayed to player)
