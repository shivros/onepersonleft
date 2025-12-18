# One Person Left - Phase 5

A strategic simulation game exploring AI-driven workforce automation in a big tech company.

## Phase 5 Completion Summary

Phase 5 adds game ending conditions and shareable URLs, transforming the game from an endless simulation into a complete experience with victory and defeat scenarios. Players can now reach a WIN ending (1 person left) or various LOSE endings (bankruptcy, delisting, catastrophic AI failure), and share their playthroughs via encoded URL links.

### What Was Built

1. **Game Ending System**

   - **WIN Condition**: Reach exactly 1 employee with positive cash and no other failures
   - **LOSE Conditions**:
     - **Bankruptcy**: 4 consecutive weeks with cash ≤ $0
     - **Delisted**: SEC delists company after critical compliance audit failures
     - **Catastrophic AI Failure**: Multiple AI agents fail simultaneously, destroying stakeholder confidence
   - **Ending State Tracking**: New fields in SimulationState track bankruptcy weeks, delisting status, and catastrophic failures
   - **Deterministic Triggers**: Risk-based probabilities determine when delisting/catastrophic events occur

2. **End Screen UI**

   - **EndScreen.tsx** (new):
     - Modal overlay showing game outcome (Victory! or Game Over)
     - Contextual blurbs tailored to each ending type
     - Stats panel: Weeks survived, final headcount, final cash, final stock price
     - "Restart" button (generates new seed for fresh game)
     - "Share" button (generates shareable URL)
   - **Dashboard.tsx** (updated):
     - Conditional rendering of EndScreen when ending is set
     - Share handler with clipboard API integration

3. **State Sharing System**

   - **URL-Based Encoding**:
     - Full simulation state encoded to base64url (URL-safe)
     - State compressed into URL hash (typical size: ~766 characters)
     - State with 100 events: ~12KB (still manageable for URLs)
   - **Zod Validation**:
     - `SimulationStateSchema` ensures decoded states are valid
     - Graceful error handling for malformed URLs
     - Backward compatibility with states missing Phase 5 fields
   - **Auto-loading**:
     - On app mount, checks for URL hash and loads shared state
     - Falls back to fresh game if hash is invalid

4. **Store Enhancements**

   - **useGameStore.ts** (updated):
     - New `ending` field exposed to UI
     - `restart(seed?)` method for fresh games
     - `getShareURL()` method generates shareable links
     - `loadFromHash()` method decodes and validates URL shares

5. **Enhanced Testing**
   - **56 total tests** across 6 test suites (23 new tests)
   - New test files:
     - `endings.test.ts` (9 tests): WIN/LOSE conditions, bankruptcy counter, determinism
     - `encode.test.ts` (14 tests): Round-trip encoding, invalid input handling, URL length, special characters
   - All tests passing with 100% determinism

### Success Criteria Met

✅ **Game Ending System**:

- WIN condition: headcount === 1 && cash > 0 && !delisted && !catastrophicFailure
- LOSE condition (bankruptcy): 4+ consecutive weeks at cash ≤ 0
- LOSE condition (delisted): High compliance/audit risk triggers SEC delisting
- LOSE condition (catastrophic): Very high agent risk triggers catastrophic AI failure
- Ending state persists once set (game stops advancing)

✅ **End Screen UI**:

- EndScreen component displays with victory/defeat title
- Contextual blurbs for each ending type (satirical tone)
- Stats panel shows weeks survived, final metrics
- Restart button generates new game with new seed
- Share button copies URL to clipboard with success alert

✅ **State Sharing System**:

- Full state encoded to base64url (URL-safe, no padding)
- Zod schema validates decoded states
- Malformed/invalid URLs handled gracefully (no crash)
- URL hash auto-loads on app mount
- Backward compatibility with pre-Phase-5 states

✅ **Testing & Quality**:

- 56 tests passing (23 new Phase 5 tests)
- No TypeScript errors
- No linting warnings
- Production build succeeds
- 100% determinism maintained

✅ **Architecture**:

- Pure simulation core preserved
- New `src/share/` module for encoding/validation
- Ending logic integrated into tick pipeline
- Store methods for restart/share/load

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

### Pre-commit Hooks

This project uses [pre-commit](https://pre-commit.com/) to automatically run code quality checks before each commit. The hooks help maintain code consistency and catch issues early.

**What runs automatically:**

- **Prettier**: Auto-formats code (TypeScript, JSON, YAML, Markdown, CSS)
- **ESLint**: Lints TypeScript/React code with auto-fix for safe issues
- **TypeScript**: Type-checks staged files
- **File checks**: Removes trailing whitespace, fixes end-of-file formatting, checks for merge conflicts

**Setup (first time):**

```bash
# Install pre-commit (if not already installed)
pip install pre-commit  # or use your system package manager

# Install the git hooks
pre-commit install
```

**Usage:**

The hooks run automatically when you commit. If issues are found:

- **Auto-fixed issues** (formatting): Files are modified automatically, just re-stage and commit again
- **Blocking issues** (linting errors, type errors): Fix the issues manually, then commit again

**Manual commands:**

```bash
# Run hooks on all files (useful after updating hook config)
pre-commit run --all-files

# Run hooks on staged files only
pre-commit run

# Update hook versions
pre-commit autoupdate

# Bypass hooks in emergencies (use sparingly!)
git commit --no-verify
```

**Troubleshooting:**

- If hooks fail, read the error messages carefully - they show exactly what needs to be fixed
- Prettier and ESLint auto-fix most issues, so re-staging and committing usually works
- For type errors, run `pnpm build` to see the full TypeScript output
- If pre-commit isn't installed, install it system-wide or use a Python virtual environment

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
│   ├── types.ts              # Core types (includes Ending type) ✨ UPDATED
│   ├── rng.ts                # Seeded random number generator
│   ├── actions.ts            # Player action types
│   ├── reduce.ts             # Pure state reducer
│   ├── tick.ts               # Time advancement + ending checks ✨ UPDATED
│   ├── index.ts              # Public API
│   ├── rng.test.ts           # RNG determinism tests (5 tests)
│   ├── reduce.test.ts        # Reducer purity tests (6 tests)
│   ├── tick.test.ts          # Simulation invariant tests (6 tests)
│   ├── agents.test.ts        # Agent/automation tests (16 tests)
│   └── endings.test.ts       # Ending condition tests (9 tests) ✨ NEW
├── share/                    # State encoding for shareable URLs ✨ NEW
│   ├── encode.ts             # Base64url encoding/decoding
│   ├── schema.ts             # Zod validation schema
│   └── encode.test.ts        # Encoding tests (14 tests) ✨ NEW
├── store/
│   └── useGameStore.ts       # Zustand store (restart/share/load methods) ✨ UPDATED
└── lib/components/
    ├── Dashboard.tsx         # Conditional EndScreen rendering ✨ UPDATED
    ├── CompanySnapshot.tsx   # Metrics display
    ├── ActionsPanel.tsx      # Button-based automation controls
    ├── AgentPanel.tsx        # Agent deployment interface
    ├── EventLog.tsx          # Event history
    └── EndScreen.tsx         # Game over modal with share button ✨ NEW
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

| Agent Type | Deploy Cost | Annual Cost | Reliability | Can Automate      |
| ---------- | ----------- | ----------- | ----------- | ----------------- |
| Generalist | $10M        | $5M/yr      | 70%         | Support, Sales    |
| Support    | $25M        | $10M/yr     | 80%         | Support           |
| Engineer   | $100M       | $30M/yr     | 60%         | Engineering       |
| Compliance | $50M        | $20M/yr     | 75%         | Legal, Compliance |

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

### Gameplay

**How to Win:**

- Fire employees aggressively while maintaining cash flow
- Deploy AI agents to automate roles and reduce headcount
- Reach exactly 1 employee without going bankrupt or getting delisted
- Keep compliance/legal roles staffed to avoid delisting risk
- Balance agent reliability vs. cost to avoid catastrophic failures

**How to Lose:**

- Go 4+ consecutive weeks with cash ≤ $0 (bankruptcy)
- Trigger SEC delisting via high compliance/audit risk + bad RNG
- Cause catastrophic AI failure via very high agent risk (>0.8) + bad RNG

**Strategy Tips:**

1. Fire aggressively early when cash is high
2. Deploy generalist agents first (cheap, versatile)
3. Keep legal/compliance headcount above 0 to reduce delisting risk
4. Don't rely solely on low-reliability agents (engineer agents at 60%)
5. Watch for bankruptcy warnings and adjust hiring/firing accordingly

### Verification

- **Tests**: 56/56 passing (`pnpm test`)
- **Lint**: No errors or warnings (`pnpm lint`)
- **Build**: Clean TypeScript compilation (`pnpm build`)
- **Determinism**: Same seed + actions produce identical endings
- **Endings**: WIN/LOSE conditions trigger correctly
- **Sharing**: URL encoding/decoding works with backward compatibility
- **UI**: EndScreen displays properly, share button copies to clipboard

### Known Limitations

- Share URLs can be long (~766 chars for initial state, ~12KB with 100 events)
- No persistence beyond URL sharing (state resets without sharing URL)
- Seed is auto-generated on restart (cannot customize)
- Simple stock price model (not realistic)
- Events can accumulate unbounded (no limit on event log size)
- No visual risk indicators (hidden metrics not displayed to player)
- Ending probabilities depend on RNG (same strategy may yield different outcomes)
