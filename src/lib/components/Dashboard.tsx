import { CompanySnapshot } from './CompanySnapshot'
import { ActionsPanel } from './ActionsPanel'
import { AgentPanel } from './AgentPanel'
import { EventLog } from './EventLog'

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">One Person Left</h1>
          <p className="text-gray-600 mt-2">
            A simulation of AI-driven workforce automation - Phase 3
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Company Snapshot */}
          <div className="lg:col-span-1">
            <CompanySnapshot />
          </div>

          {/* Middle Column: Agent Panel */}
          <div className="lg:col-span-1">
            <AgentPanel />
          </div>

          {/* Right Column: Actions Panel and Event Log stacked */}
          <div className="lg:col-span-1 space-y-6">
            <ActionsPanel />
            <EventLog />
          </div>
        </div>
      </div>
    </div>
  )
}
