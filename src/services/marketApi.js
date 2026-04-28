import { apiRequest } from './apiBase'

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue
    searchParams.set(key, String(value))
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export async function getMarketSummary() {
  return await apiRequest('/market/summary', { method: 'GET' })
}

export async function getMarketItems(params = {}) {
  return await apiRequest(`/market/items${buildQuery(params)}`, { method: 'GET' })
}

export async function getMarketItem(material) {
  return await apiRequest(`/market/items/${encodeURIComponent(material)}`, { method: 'GET' })
}

export async function getNationMarketListings(params = {}) {
  return await apiRequest(`/market/nation-listings${buildQuery(params)}`, { method: 'GET' })
}

export async function getMarketTransactions(params = {}) {
  return await apiRequest(`/market/transactions${buildQuery(params)}`, { method: 'GET' })
}
