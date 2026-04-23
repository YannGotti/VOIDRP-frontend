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

const FIELD_LABELS = {
  site_login: 'логин',
  minecraft_nickname: 'игровой ник',
  email: 'почта',
  password: 'пароль',
  password_repeat: 'повтор пароля',
  login: 'логин или почта',
  token: 'токен',
  new_password: 'новый пароль',
  new_password_repeat: 'повтор нового пароля',
  referral_code: 'код приглашения',
  slug: 'адрес страницы',
  display_name: 'отображаемое имя',
  bio: 'описание',
  status_text: 'статус',
  accent_color: 'цвет',
}

function humanizeFieldName(name) {
  const key = String(name || '').trim()
  if (!key) return 'поле'
  return FIELD_LABELS[key] || key.replaceAll('_', ' ')
}

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

function formatValidationErrorItem(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  const loc = Array.isArray(item.loc) ? item.loc : []
  const field = [...loc].reverse().find((entry) => typeof entry === 'string' && !['body', 'query', 'path', 'header'].includes(entry))
  const label = humanizeFieldName(field)
  const msg = String(item.msg || '').trim()

  if (!msg) {
    return `Проверь поле «${label}».`
  }

  const lowered = msg.toLowerCase()
  const ctx = item.ctx || {}

  if (lowered === 'field required') {
    return `Заполни поле «${label}».`
  }

  if (lowered.includes('should have at least')) {
    const minimum = ctx.min_length ?? ctx.ge
    return minimum != null
      ? `Поле «${label}» должно содержать минимум ${minimum} символов.`
      : `Поле «${label}» заполнено слишком коротко.`
  }

  if (lowered.includes('should have at most')) {
    const maximum = ctx.max_length ?? ctx.le
    return maximum != null
      ? `Поле «${label}» должно содержать не больше ${maximum} символов.`
      : `Поле «${label}» заполнено слишком длинно.`
  }

  if (lowered.includes('valid email address')) {
    return 'Укажи корректную почту.'
  }

  if (lowered.includes('input should be a valid string')) {
    return `Поле «${label}» заполнено некорректно.`
  }

  return `Проверь поле «${label}»: ${msg}`
}

function formatValidationErrors(errors) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return ''
  }

  const messages = []
  for (const item of errors) {
    const text = formatValidationErrorItem(item)
    if (text && !messages.includes(text)) {
      messages.push(text)
    }
  }

  if (messages.length === 0) {
    return ''
  }

  if (messages.length === 1) {
    return messages[0]
  }

  const preview = messages.slice(0, 3).join('; ')
  return messages.length > 3 ? `${preview}. Ещё ошибок: ${messages.length - 3}.` : preview
}

function extractMessage(body) {
  if (typeof body === 'string' && body.trim()) {
    return body.trim()
  }

  if (body && typeof body === 'object') {
    if (typeof body.detail === 'string' && body.detail.trim()) {
      return body.detail.trim()
    }

    const validationMessage = formatValidationErrors(body.detail || body.errors)
    if (validationMessage) {
      return validationMessage
    }

    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message.trim()
    }
  }

  return ''
}

function buildErrorMessage(response, body) {
  const extracted = extractMessage(body)
  if (extracted) {
    return extracted
  }

  if (response.status === 400) {
    return 'Запрос заполнен некорректно. Проверь данные и попробуй снова.'
  }

  if (response.status === 401) {
    return 'Нужна авторизация. Войди в аккаунт и попробуй снова.'
  }

  if (response.status === 403) {
    return 'У тебя нет прав для этого действия.'
  }

  if (response.status === 404) {
    return 'Нужный раздел или объект не найден.'
  }

  if (response.status === 409) {
    return 'Такое действие сейчас выполнить нельзя из-за конфликта данных.'
  }

  if (response.status === 422) {
    return 'Проверь заполненные поля и попробуй снова.'
  }

  if (response.status >= 500) {
    return 'На сервере произошла ошибка. Попробуй ещё раз чуть позже.'
  }

  return `Ошибка ${response.status}`
}

export async function apiRequest(path, options = {}) {
  let response

  try {
    response = await fetch(buildUrl(path), buildRequestOptions(options))
  } catch {
    const error = new Error('Не удалось связаться с сервером. Проверь подключение и попробуй снова.')
    if (options.toast !== false) {
      toastError(error.message, 'Ошибка сети')
    }
    throw error
  }

  const body = response.status === 204 ? null : await readResponseBody(response)

  if (!response.ok) {
    const error = new Error(buildErrorMessage(response, body))
    error.status = response.status
    error.body = body
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
