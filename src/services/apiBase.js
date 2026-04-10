const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.void-rp.ru/api/v1').replace(/\/$/, '')

async function parseError(response) {
  let detail = `HTTP ${response.status}`

  try {
    const payload = await response.json()
    if (payload?.detail) {
      detail = payload.detail
    } else if (payload?.message) {
      detail = payload.message
    }
  } catch {
    // ignore json parse error
  }

  throw new Error(detail)
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    await parseError(response)
  }

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return null
  }

  return await response.json()
}

export function buildAuthHeaders(token, extraHeaders = {}) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  }
}

export { API_BASE_URL }