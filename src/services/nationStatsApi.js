import { apiRequest, buildAuthHeaders } from './apiBase'

export async function getNationRankings(accessToken = null) {
  return await apiRequest('/nation-stats/rankings', {
    method: 'GET',
    headers: buildAuthHeaders(accessToken),
  })
}

export async function getNationStatsBySlug(slug, accessToken = null) {
  return await apiRequest(`/nation-stats/nations/${encodeURIComponent(slug)}`, {
    method: 'GET',
    headers: buildAuthHeaders(accessToken),
  })
}
