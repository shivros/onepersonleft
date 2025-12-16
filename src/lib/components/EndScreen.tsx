import type { Ending } from '../../sim/types'
import type { CompanyMetrics } from '../../store/useGameStore'

interface EndScreenProps {
  ending: Ending
  metrics: CompanyMetrics
  tick: number
  onRestart: () => void
  onShare: () => void
}

/**
 * Get contextual blurb based on ending type and reason
 */
function getEndingBlurb(ending: Ending): { title: string; message: string } {
  if (ending.type === 'win') {
    return {
      title: 'Victory!',
      message:
        "Against all odds, you've achieved peak efficiency: one person left. Your shareholders are thrilled. The lonely employee? Less so. You've automated your way to the ultimate dystopian endgame.",
    }
  }

  // LOSE conditions
  switch (ending.reason) {
    case 'bankruptcy':
      return {
        title: 'Game Over',
        message:
          'The company burned through its cash reserves. Investors pulled out. The dream of full automation ends in liquidation. Perhaps humans were more cost-effective after all.',
      }
    case 'delisted':
      return {
        title: 'Game Over',
        message:
          'Regulatory audits uncovered critical compliance failures. The SEC has delisted your company. Automation at what cost? Turns out, compliance officers were important.',
      }
    case 'catastrophic':
      return {
        title: 'Game Over',
        message:
          'A catastrophic AI incident has destroyed stakeholder confidence. The board has voted to dissolve the company immediately. Your AI agents decided they had better ideas about how to run things.',
      }
    default:
      return {
        title: 'Game Over',
        message:
          'The automation experiment has ended. The path to peak efficiency was more treacherous than anticipated.',
      }
  }
}

/**
 * Format money for display
 */
function formatMoney(amount: number): string {
  if (amount >= 1_000_000_000_000) {
    return `$${(amount / 1_000_000_000_000).toFixed(2)}T`
  }
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)}B`
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`
  }
  return `$${amount.toLocaleString()}`
}

export function EndScreen({ ending, metrics, tick, onRestart, onShare }: EndScreenProps) {
  const { title, message } = getEndingBlurb(ending)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-8">
        {/* Title */}
        <h1
          className={`text-4xl font-bold mb-4 ${
            ending.type === 'win' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {title}
        </h1>

        {/* Contextual message */}
        <p className="text-gray-700 text-lg mb-6 leading-relaxed">{message}</p>

        {/* Stats panel */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Run Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 text-sm">Weeks Survived</span>
              <p className="font-semibold text-lg">{tick}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Final Headcount</span>
              <p className="font-semibold text-lg">{metrics.headcount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Final Cash</span>
              <p className="font-semibold text-lg">{formatMoney(metrics.cash)}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Final Stock Price</span>
              <p className="font-semibold text-lg">${metrics.stockPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={onRestart}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Restart Game
          </button>
          <button
            onClick={onShare}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Share Link
          </button>
        </div>
      </div>
    </div>
  )
}
