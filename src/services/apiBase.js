import { toastError } from './toast'

const DEFAULT_REMOTE_API_BASE_URL = 'https://api.void-rp.ru/api/v1'

function normalizeBaseUrl(value) {
  return String(value || '').trim().replace(/\/$/, '')
}

function resolveApiBaseUrl() {
  const envBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)
  if (envBaseUrl) {
    return envBaseUrl
  }

  if (import.meta.env.DEV) {
    return '/api/v1'
  }

  return DEFAULT_REMOTE_API_BASE_URL
}

const API_BASE_URL = resolveApiBaseUrl()

function buildUrl(path) {
  const normalizedPath = String(path || '')
  return `${API_BASE_URL}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`
}

async function readResponseBody(response) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  try {
    const text = await response.text()
    return text || null
  } catch {
    return null
  }
}

function buildRequestOptions(options = {}) {
  const headers = { ...(options.headers || {}) }
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  if (!isFormData && options.body != null) {
    const hasContentType = Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')
    if (!hasContentType) {
      headers['Content-Type'] = 'application/json'
    }
  }

  return {
    ...options,
    headers,
  }
}

function buildErrorMessage(response, body) {
  if (typeof body === 'string' && body.trim()) {
    return body.trim()
  }

  if (body && typeof body === 'object') {
    if (typeof body.detail === 'string' && body.detail.trim()) {
      return body.detail.trim()
    }

    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message.trim()
    }
  }

  if (response.status === 401) {
    return 'Нужна авторизация. Войди в аккаунт и попробуй снова.'
  }

  if (response.status === 403) {
    return 'У тебя нет прав для этого действия.'
  }

  if (response.status === 404) {
    return 'Нужный объект не найден.'
  }

  if (response.status >= 500) {
    return 'Сервер вернул внутреннюю ошибку. Проверь backend и миграции.'
  }

  return `HTTP ${response.status}`
}

export async function apiRequest(path, options = {}) {
  let response

  try {
    response = await fetch(buildUrl(path), buildRequestOptions(options))
  } catch {
    const error = new Error('Не удалось связаться с API. Для локальной разработки проверь Vite proxy и CORS.')
    if (options.toast !== false) {
      toastError(error.message, 'Ошибка сети')
    }
    throw error
  }

  const body = response.status === 204 ? null : await readResponseBody(response)

  if (!response.ok) {
    const error = new Error(buildErrorMessage(response, body))
    if (options.toast !== false) {
      toastError(error.message)
    }
    throw error
  }

  return body
}

export function buildAuthHeaders(token, extraHeaders = {}) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  }
}

export { API_BASE_URL }