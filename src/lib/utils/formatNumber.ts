/**
 * Number formatting utilities for readable display
 * Handles K/M/B/T abbreviations for large numbers
 */

/**
 * Format a number with K/M/B/T suffixes
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1.5M", "42.0B")
 */
export function formatNumber(num: number, decimals: number = 1): string {
  // Handle edge cases
  if (!Number.isFinite(num)) {
    return num === Infinity ? '∞' : num === -Infinity ? '-∞' : 'N/A'
  }

  if (num === 0) {
    return '0'
  }

  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''

  // Trillion (1,000,000,000,000)
  if (absNum >= 1e12) {
    return sign + (absNum / 1e12).toFixed(decimals) + 'T'
  }

  // Billion (1,000,000,000)
  if (absNum >= 1e9) {
    return sign + (absNum / 1e9).toFixed(decimals) + 'B'
  }

  // Million (1,000,000)
  if (absNum >= 1e6) {
    return sign + (absNum / 1e6).toFixed(decimals) + 'M'
  }

  // Thousand (1,000)
  if (absNum >= 1e3) {
    return sign + (absNum / 1e3).toFixed(decimals) + 'K'
  }

  // Less than 1000 - show as-is with decimals
  return sign + absNum.toFixed(decimals)
}

/**
 * Format a number as currency with K/M/B/T suffixes
 * @param num - The dollar amount to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted currency string (e.g., "$1.5M", "-$42.0B")
 */
export function formatCurrency(num: number, decimals: number = 1): string {
  const formatted = formatNumber(num, decimals)

  // Handle special cases
  if (formatted === '∞' || formatted === '-∞' || formatted === 'N/A') {
    return formatted
  }

  // Add dollar sign
  if (num < 0) {
    // For negative numbers, put $ after the negative sign
    return '-$' + formatted.slice(1) // Remove the leading minus that formatNumber added
  }

  return '$' + formatted
}
