import { useGameStore } from '../../store/useGameStore'

export function CompanySnapshot() {
  const company = useGameStore((state) => state.company)

  const formatMoney = (amount: number): string => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Company Snapshot</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-600">Ticker</span>
          <span className="font-mono font-bold text-lg">{company.ticker}</span>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-600">Headcount</span>
          <span className="font-semibold">{company.headcount.toLocaleString()} employees</span>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-600">Cash</span>
          <span className="font-semibold text-green-600">{formatMoney(company.cash)}</span>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-600">Burn Rate</span>
          <span className="font-semibold text-red-600">{formatMoney(company.burnRate)}/year</span>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-600">Revenue</span>
          <span className="font-semibold text-blue-600">{formatMoney(company.revenue)}/year</span>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-600">Stock Price</span>
          <span className="font-semibold">${company.stockPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Market Cap</span>
          <span className="font-semibold">{formatMoney(company.marketCap)}</span>
        </div>
      </div>
    </div>
  )
}
