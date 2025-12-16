import { CompanySnapshot } from './CompanySnapshot'
import { ActionsPanel } from './ActionsPanel'
import { AgentPanel } from './AgentPanel'
import { EventLog } from './EventLog'
import { EndScreen } from './EndScreen'
import { useGameStore } from '../../store/useGameStore'

export function Dashboard() {
  const ending = useGameStore((state) => state.ending)
  const company = useGameStore((state) => state.company)
  const tick = useGameStore((state) => state.tick)
  const restart = useGameStore((state) => state.restart)
  const getShareURL = useGameStore((state) => state.getShareURL)

  const handleShare = () => {
    const url = getShareURL()
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert('Share link copied to clipboard!')
      })
      .catch((err) => {
        console.error('Failed to copy share link:', err)
        alert('Failed to copy link. Please try again.')
      })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">One Person Left</h1>
          <p className="text-gray-600 mt-2">
            A simulation of AI-driven workforce automation - Phase 5
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

        {/* End screen overlay */}
        {ending && (
          <EndScreen
            ending={ending}
            metrics={company}
            tick={tick}
            onRestart={() => restart()}
            onShare={handleShare}
          />
        )}
      </div>
    </div>
  )
}
