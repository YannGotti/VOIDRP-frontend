import { computed, reactive } from 'vue'
import {
  getMe,
  loginAccount,
  logoutSession,
  refreshSession,
  registerAccount,
} from '../services/authApi'

const STORAGE_KEY = 'voidrp_auth_v1'

export const authState = reactive({
  accessToken: null,
  refreshToken: null,
  user: null,
  playerAccount: null,
  ready: false,
})

let bootstrapPromise = null

function loadStoredAuth() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return

  try {
    const parsed = JSON.parse(raw)
    authState.accessToken = parsed.accessToken || null
    authState.refreshToken = parsed.refreshToken || null
    authState.user = parsed.user || null
    authState.playerAccount = parsed.playerAccount || null
  } catch {
    clearAuthState()
  }
}

function persistAuth() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accessToken: authState.accessToken,
      refreshToken: authState.refreshToken,
      user: authState.user,
      playerAccount: authState.playerAccount,
    }),
  )
}

function clearAuthState() {
  authState.accessToken = null
  authState.refreshToken = null
  authState.user = null
  authState.playerAccount = null
  localStorage.removeItem(STORAGE_KEY)
}

function applyTokenResponse(payload) {
  authState.accessToken = payload.access_token
  authState.refreshToken = payload.refresh_token
  authState.user = payload.user
  authState.playerAccount = payload.player_account
  persistAuth()
}

export function getIsAuthenticated() {
  return Boolean(authState.accessToken && authState.user)
}

export async function bootstrapAuth() {
  if (authState.ready) return
  if (bootstrapPromise) return bootstrapPromise

  bootstrapPromise = (async () => {
    loadStoredAuth()

    if (!authState.refreshToken) {
      authState.ready = true
      return
    }

    try {
      const response = await refreshSession({
        refresh_token: authState.refreshToken,
        device_name: 'VoidRP Site',
      })
      applyTokenResponse(response)
    } catch {
      clearAuthState()
    } finally {
      authState.ready = true
    }
  })()

  try {
    await bootstrapPromise
  } finally {
    bootstrapPromise = null
  }
}

export async function registerAndOptionallyStay(payload) {
  return registerAccount(payload)
}

export async function loginWithPassword(payload) {
  const response = await loginAccount(payload)
  applyTokenResponse(response)
  authState.ready = true
  return response
}

export async function reloadMe() {
  if (!authState.accessToken) {
    clearAuthState()
    return null
  }

  const response = await getMe(authState.accessToken)
  authState.user = response.user
  authState.playerAccount = response.player_account
  persistAuth()
  return response
}

export async function logoutCurrentSession() {
  const refreshToken = authState.refreshToken
  clearAuthState()
  authState.ready = true

  if (!refreshToken) return

  try {
    await logoutSession({ refresh_token: refreshToken })
  } catch {
    // ignore logout transport errors; local state is already cleared
  }
}

export function useAuthStore() {
  return {
    state: authState,
    ready: computed(() => authState.ready),
    isAuthenticated: computed(() => getIsAuthenticated()),
    displayName: computed(
      () => authState.playerAccount?.minecraft_nickname || authState.user?.site_login || 'Игрок',
    ),
    emailVerified: computed(() => Boolean(authState.user?.email_verified)),
  }
}
