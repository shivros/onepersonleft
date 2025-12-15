# One Person Left - Phase 1

A simulation exploring AI-driven workforce automation in a big tech company.

## Phase 1 Completion Summary

This repository contains the completed Phase 1 implementation, which establishes the foundational infrastructure for the simulation.

### What Was Built

1. **Project Infrastructure**
   - Vite + React + TypeScript setup
   - Tailwind CSS for styling
   - ESLint and Prettier for code quality
   - Zustand for state management

2. **Directory Structure**
   - `/src/sim` - Reserved for future simulation logic
   - `/src/store` - Zustand state management
   - `/src/lib/components` - UI components

3. **Components**
   - **Dashboard** - Main container with 2-column responsive layout
   - **CompanySnapshot** - Displays company metrics (left column)
   - **ActionsPanel** - Shows current week and "Advance 1 Week" button (right top)
   - **EventLog** - Displays simulation events (right bottom)

4. **State Management**
   - Zustand store with dummy company metrics:
     - Ticker: DNSZ
     - Headcount: 50,000 employees
     - Cash: $40B
     - Burn Rate: $70B/year
     - Revenue: $150B/year
     - Stock Price: $666
     - Market Cap: $1.5T

### Success Criteria Met

✅ Working dev server running on auto-selected port
✅ Dashboard renders with all three UI panels
✅ "Advance 1 Week" button increments tick counter
✅ Event log updates when button is clicked
✅ Responsive 2-column layout
✅ No TypeScript or linting errors
✅ Production build succeeds

### Running the Application

```bash
# Install dependencies
pnpm install

# Start development server (auto-selects available port)
pnpm dev

# Run linter
pnpm lint

# Build for production
pnpm build
```

### Validation

- **Dev Server**: Running on http://localhost:5174/
- **Lint**: No errors or warnings
- **Build**: Successful TypeScript compilation and Vite build
- **UI**: All components render correctly with Tailwind styling

### Next Steps (Phase 2+)

Phase 1 deliberately avoids implementing any simulation logic. Future phases will add:
- Actual automation mechanics
- Incident generation and handling
- Financial calculations
- Stock price simulation
- Win/loss conditions
- Data persistence

### Architecture Notes

The code follows strict architectural boundaries:
- UI components use Zustand hooks to access state
- No business logic in components (currently all placeholder)
- Clean separation between `/sim`, `/store`, and `/lib/components`
- All styling uses Tailwind utility classes
