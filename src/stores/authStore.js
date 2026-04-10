import { computed, reactive } from 'vue'
import {
  getMe,
  loginAccount,
  logoutSession,
  refreshSession,
  registerAccount,
  revokeOtherSessions,
} from '../services/authApi'

const STORAGE_KEY = 'voidrp_auth_v1'

export const authState = reactive({
  accessToken: null,
  refreshToken: null,
  user: null,
  playerAccount: null,
  security: null,
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
    authState.security = parsed.security || null
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
      security: authState.security,
    }),
  )
}

function clearAuthState() {
  authState.accessToken = null
  authState.refreshToken = null
  authState.user = null
  authState.playerAccount = null
  authState.security = null
  localStorage.removeItem(STORAGE_KEY)
}

function applyTokenResponse(payload) {
  authState.accessToken = payload.access_token
  authState.refreshToken = payload.refresh_token
  authState.user = payload.user
  authState.playerAccount = payload.player_account
  authState.security = payload.security || null
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
  return await registerAccount(payload)
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
  authState.security = response.security || null
  persistAuth()
  return response
}

export async function revokeOtherSessionsForCurrentAccount() {
  if (!authState.accessToken || !authState.refreshToken) {
    throw new Error('Нет активной сессии для управления другими входами.')
  }

  const response = await revokeOtherSessions(authState.accessToken, {
    refresh_token: authState.refreshToken,
  })

  await reloadMe()
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

    get accessToken() {
      return authState.accessToken
    },

    get refreshToken() {
      return authState.refreshToken
    },

    ready: computed(() => authState.ready),
    isAuthenticated: computed(() => getIsAuthenticated()),

    displayName: computed(
      () => authState.playerAccount?.minecraft_nickname || authState.user?.site_login || 'Игрок',
    ),

    emailVerified: computed(() => Boolean(authState.user?.email_verified)),
    nicknameLocked: computed(() => Boolean(authState.playerAccount?.nickname_locked)),
    legacyAuthEnabled: computed(() => Boolean(authState.playerAccount?.legacy_auth_enabled)),
    activeSessions: computed(() => Number(authState.security?.active_refresh_sessions || 0)),
    mustUseLauncher: computed(() => Boolean(authState.security?.must_use_launcher)),
    legacyReady: computed(() => Boolean(authState.security?.legacy_ready)),
    legacyHashPresent: computed(() => Boolean(authState.security?.legacy_hash_present)),

    accountModeText: computed(() => {
      if (authState.security?.must_use_launcher) return 'Только официальный лаунчер'
      if (authState.playerAccount?.legacy_auth_enabled) return 'Смешанный режим: лаунчер + legacy'
      return 'Режим не определён'
    }),
  }
}