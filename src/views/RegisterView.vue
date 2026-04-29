<script setup>
import {computed, onMounted, reactive, ref, watch} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { previewReferralCode } from '../services/referralApi'
import { registerAndOptionallyStay } from '../stores/authStore'
import { toastError, toastInfo } from '../services/toast'

const route = useRoute()
const router = useRouter()

const form = reactive({
  site_login: '',
  minecraft_nickname: '',
  email: '',
  password: '',
  password_repeat: '',
  referral_code: '',
})

const isSubmitting = ref(false)
const isCheckingReferral = ref(false)
const showPassword = ref(false)
const showPasswordRepeat = ref(false)
const errorMessage = ref('')
const referralMessage = ref('')
const referralError = ref('')
const referralPreview = ref(null)

const referralPreviewLabel = computed(() => {
  const payload = referralPreview.value
  if (!payload) return ''

  return (
    payload.display_name ||
    payload.inviter_display_name ||
    payload.minecraft_nickname ||
    payload.site_login ||
    payload.code ||
    'Код приглашения принят'
  )
})

async function resolveReferralCode(code) {
  const normalized = (code || '').trim()
  referralPreview.value = null
  referralMessage.value = ''
  referralError.value = ''

  if (!normalized) {
    return
  }

  isCheckingReferral.value = true
  try {
    const payload = await previewReferralCode(normalized)
    referralPreview.value = payload
    referralMessage.value = referralPreviewLabel.value
      ? `Код найден: ${referralPreviewLabel.value}.`
      : 'Код приглашения найден.'
  } catch (error) {
    referralError.value = error.message || 'Не удалось проверить код приглашения.'
  } finally {
    isCheckingReferral.value = false
  }
}

async function submit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await registerAndOptionallyStay({
      site_login: form.site_login,
      minecraft_nickname: form.minecraft_nickname,
      email: form.email,
      password: form.password,
      password_repeat: form.password_repeat,
      referral_code: form.referral_code.trim() || null,
    })

    await router.push({
      path: '/verify-email',
      query: {
        email: form.email,
        sent: '1',
        redirect: typeof route.query.redirect === 'string' ? route.query.redirect : '',
      },
    })
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось создать аккаунт.'
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => form.referral_code,
  () => {
    referralPreview.value = null
    referralMessage.value = ''
    referralError.value = ''
  },
)

onMounted(async () => {
  const refFromQuery =
    typeof route.query.ref === 'string' && route.query.ref.trim().length > 0
      ? route.query.ref.trim()
      : ''

  if (refFromQuery) {
    form.referral_code = refFromQuery
    await resolveReferralCode(refFromQuery)
  }
})
watch(errorMessage, (value) => { if (value) toastError(value) })
watch(referralError, (value) => { if (value) toastError(value, 'Код приглашения') })
watch(referralMessage, (value) => { if (value) toastInfo(value, 'Код приглашения') })
</script>

<template>
  <section class="py-12 md:py-20">
    <div class="container-shell max-w-6xl">
      <div class="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div class="surface-card p-6 md:p-8 lg:p-10">
          <div class="section-kicker">Регистрация</div>
          <h1 class="section-title">Создать аккаунт VoidRP</h1>
          <p class="section-subtitle max-w-3xl">
            Один аккаунт нужен для сайта, кабинета и официального лаунчера. После регистрации
            письмо для подтверждения почты отправится автоматически.
          </p>

          <form class="mt-8 grid gap-4 md:grid-cols-2" @submit.prevent="submit">
            <label>
              <span class="field-label">Логин</span>
              <input v-model="form.site_login" class="input" required />
            </label>

            <label>
              <span class="field-label">Игровой ник</span>
              <input v-model="form.minecraft_nickname" class="input" required />
            </label>

            <label class="md:col-span-2">
              <span class="field-label">Email</span>
              <input v-model="form.email" type="email" class="input" required />
            </label>

            <label>
              <span class="field-label">Пароль</span>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input"
                  style="padding-right: 2.75rem;"
                  required
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  style="position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 0; color: rgb(100 116 139);"
                  @mouseenter="$event.currentTarget.style.color = 'rgb(203 213 225)'"
                  @mouseleave="$event.currentTarget.style.color = 'rgb(100 116 139)'"
                >
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </label>

            <label>
              <span class="field-label">Повтори пароль</span>
              <div class="relative">
                <input
                  v-model="form.password_repeat"
                  :type="showPasswordRepeat ? 'text' : 'password'"
                  class="input"
                  style="padding-right: 2.75rem;"
                  required
                />
                <button
                  type="button"
                  @click="showPasswordRepeat = !showPasswordRepeat"
                  style="position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 0; color: rgb(100 116 139);"
                  @mouseenter="$event.currentTarget.style.color = 'rgb(203 213 225)'"
                  @mouseleave="$event.currentTarget.style.color = 'rgb(100 116 139)'"
                >
                  <svg v-if="!showPasswordRepeat" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </label>

            <div class="md:col-span-2 rounded-[1.5rem] border border-white/10 bg-slate-950/65 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div class="flex flex-col gap-3 md:flex-row md:items-end">
                <label class="flex-1">
                  <span class="field-label">Код приглашения</span>
                  <input
                    v-model="form.referral_code"
                    class="input"
                    placeholder="Необязательно"
                  />
                </label>

                <button
                  type="button"
                  class="btn btn-outline md:min-w-[12.5rem]"
                  :disabled="isCheckingReferral || !form.referral_code.trim()"
                  @click="resolveReferralCode(form.referral_code)"
                >
                  <span v-if="isCheckingReferral" class="spinner"></span>
                  <span>{{ isCheckingReferral ? 'Проверяем...' : 'Проверить код' }}</span>
                </button>
              </div>

              <p class="helper-text mt-3">
                Если тебя пригласил другой игрок, укажи его код. Это зачтётся в его реферальный прогресс.
              </p>
            </div>

            <div class="md:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner"></span>
                <span>{{ isSubmitting ? 'Создаём аккаунт...' : 'Создать аккаунт' }}</span>
              </button>
              <RouterLink to="/login" class="text-sm font-semibold text-violet-300 transition hover:text-violet-200">
                Уже зарегистрирован? Войти
              </RouterLink>
            </div>

            <p class="md:col-span-2 -mt-1 rounded-[1.1rem] border border-white/10 bg-slate-950/45 px-4 py-3 text-xs leading-5 text-slate-400">
              Регистрируясь и играя на сервере, вы соглашаетесь с
              <RouterLink
                to="/privacy"
                target="_blank"
                class="font-bold text-violet-300 transition hover:text-violet-200"
              >
                Политикой конфиденциальности
              </RouterLink>
              и
              <RouterLink
                to="/offer"
                target="_blank"
                class="font-bold text-violet-300 transition hover:text-violet-200"
              >
                Договором оферты
              </RouterLink>.
            </p>
          </form>
        </div>

        <aside class="gradient-panel p-6 md:p-8">
          <div class="section-kicker section-kicker--light">Что получит игрок</div>
          <h2 class="text-3xl font-black tracking-tight text-white md:text-4xl">Нормальный старт без ручной настройки</h2>
          <p class="mt-4 text-base leading-8 text-white/78">
            После регистрации откроется кабинет, публичный профиль и прямой путь к скачиванию лаунчера.
          </p>

          <div class="mt-8 grid gap-3">
            <div class="dark-list-card">
              <p class="text-sm font-black text-white">Один аккаунт</p>
              <p class="mt-1.5 text-sm leading-6 text-white/74">
                Для сайта, кабинета, публичного профиля и лаунчера не нужны разные входы.
              </p>
            </div>
            <div class="dark-list-card">
              <p class="text-sm font-black text-white">Письмо придёт автоматически</p>
              <p class="mt-1.5 text-sm leading-6 text-white/74">
                Сразу после регистрации можно подтвердить почту и продолжить путь к игре.
              </p>
            </div>
            <div class="dark-list-card">
              <p class="text-sm font-black text-white">Оформление потом</p>
              <p class="mt-1.5 text-sm leading-6 text-white/74">
                Аватар, баннер, фон и описание можно спокойно настроить уже после входа.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>