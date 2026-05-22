import { apiRequest, buildAuthHeaders } from './apiBase.js'

function ah(token) { return { headers: buildAuthHeaders(token) } }

export async function anticheatListPlayers(token, params = {}) {
  const q = new URLSearchParams()
  if (params.skip !== undefined) q.set('skip', params.skip)
  if (params.limit !== undefined) q.set('limit', params.limit)
  if (params.only_suspicious) q.set('only_suspicious', 'true')
  const qs = q.toString()
  return apiRequest(`/admin/anticheat/players${qs ? '?' + qs : ''}`, { method: 'GET', ...ah(token) })
}

export async function anticheatGetPlayer(token, playerUuid) {
  return apiRequest(`/admin/anticheat/player/${encodeURIComponent(playerUuid)}`, { method: 'GET', ...ah(token) })
}

export async function anticheatPlayerAction(token, playerUuid, action, reason = '', reviewedBy = 'admin') {
  return apiRequest(`/admin/anticheat/player/${encodeURIComponent(playerUuid)}/action`, {
    method: 'POST',
    body: JSON.stringify({ action, reason, reviewed_by: reviewedBy }),
    ...ah(token),
  })
}
