const ADMIN_API_BASE = '/internal-admin-api'

async function adminRequest(path, options = {}) {
  const response = await fetch(`${ADMIN_API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store',
    credentials: 'same-origin',
    ...options,
  })

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const detail =
      typeof body === 'object' && body?.detail
        ? body.detail
        : typeof body === 'string' && body.trim().length > 0
          ? body
          : 'Admin request failed'

    throw new Error(detail)
  }

  return body
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') {
      continue
    }

    searchParams.set(key, String(value))
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function getAdminSummary() {
  return adminRequest('/players/summary')
}

export function listAdminPlayers(params = {}) {
  return adminRequest(`/players${buildQuery(params)}`)
}

export function getAdminPlayer(playerAccountId) {
  return adminRequest(`/players/${playerAccountId}`)
}

export function updateAdminLegacy(playerAccountId, payload) {
  return adminRequest(`/players/${playerAccountId}/legacy`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}