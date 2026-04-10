import { siteConfig } from '../config.site'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${siteConfig.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const detail = typeof body === 'object' && body?.detail ? body.detail : 'Request failed'
    throw new Error(detail)
  }

  return body
}