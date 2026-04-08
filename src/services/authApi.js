import { apiRequest } from './api'

export function registerAccount(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginAccount(payload) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function refreshSession(payload) {
  return apiRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logoutSession(payload) {
  return apiRequest('/auth/logout', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getMe(accessToken) {
  return apiRequest('/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export function verifyEmail(payload) {
  return apiRequest('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function resendVerification(payload) {
  return apiRequest('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function requestPasswordReset(payload) {
  return apiRequest('/auth/request-password-reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function resetPassword(payload) {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
