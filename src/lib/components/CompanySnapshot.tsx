import { useGameStore } from '../../store/useGameStore'
import { formatCurrency } from '../utils/formatNumber'

export function CompanySnapshot() {
  const company = useGameStore((state) => state.company)

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
          <span className="font-semibold text-green-600">{formatCurrency(company.cash)}</span>
        </div>
        <div className="border-b pb-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Burn Rate</span>
            <span className="font-semibold text-red-600">{formatCurrency(company.burnRate)}/year</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Weekly operating costs</p>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-gray-600">Revenue</span>
          <span className="font-semibold text-blue-600">{formatCurrency(company.revenue)}/year</span>
        </div>
        <div className="border-b pb-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Stock Price</span>
            <span className="font-semibold">{formatCurrency(company.stockPrice)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Driven by margins and risk</p>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Market Cap</span>
          <span className="font-semibold">{formatCurrency(company.marketCap)}</span>
        </div>
      </div>
    </div>
  )
}
