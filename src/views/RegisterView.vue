<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { previewReferralCode } from '../services/referralApi'
import { registerAndOptionallyStay } from '../stores/authStore'

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
      ? `Приглашение найдено: ${referralPreviewLabel.value}.`
      : 'Код приглашения найден.'
  } catch (error) {
    referralError.value = error.message || 'Не удалось проверить referral code.'
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
</script>

<template>
  <section class="py-12 md:py-20">
    <div class="container-shell max-w-6xl">
      <div class="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div class="surface-card p-6 md:p-8 lg:p-10">
          <div class="section-kicker">Регистрация</div>
          <h1 class="section-title">Создать аккаунт VoidRP</h1>
          <p class="section-subtitle">
            Этот аккаунт нужен для сайта, кабинета и официального лаунчера. После регистрации письмо для подтверждения почты отправится автоматически.
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
              <input v-model="form.password" type="password" class="input" required />
            </label>

            <label>
              <span class="field-label">Повтори пароль</span>
              <input v-model="form.password_repeat" type="password" class="input" required />
            </label>

            <div class="md:col-span-2 rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-5">
              <div class="flex flex-col gap-3 md:flex-row md:items-end">
                <label class="flex-1">
                  <span class="field-label">Referral code</span>
                  <input
                    v-model="form.referral_code"
                    class="input"
                    placeholder="Необязательно"
                  />
                </label>

                <button
                  type="button"
                  class="btn btn-outline"
                  :disabled="isCheckingReferral || !form.referral_code.trim()"
                  @click="resolveReferralCode(form.referral_code)"
                >
                  <span v-if="isCheckingReferral" class="spinner"></span>
                  <span>{{ isCheckingReferral ? 'Проверяем...' : 'Проверить код' }}</span>
                </button>
              </div>

              <p class="helper-text">
                Если тебя пригласил другой игрок, укажи его код. Это зачтётся в его реферальный прогресс.
              </p>

              <p v-if="referralMessage" class="alert alert-success mt-4">{{ referralMessage }}</p>
              <p v-if="referralError" class="alert alert-warn mt-4">{{ referralError }}</p>
            </div>

            <p v-if="errorMessage" class="alert alert-error md:col-span-2">{{ errorMessage }}</p>

            <div class="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner"></span>
                <span>{{ isSubmitting ? 'Создаём аккаунт...' : 'Создать аккаунт' }}</span>
              </button>
              <RouterLink to="/login" class="font-semibold text-indigo-700">
                Уже зарегистрирован? Войти
              </RouterLink>
            </div>
          </form>
        </div>

        <aside class="gradient-panel p-6 md:p-8">
          <div class="section-kicker section-kicker--light">Что получит игрок</div>
          <h2 class="text-3xl font-black tracking-tight text-white md:text-4xl">Нормальный старт без ручной настройки</h2>
          <p class="mt-4 text-base leading-8 text-white/78">
            После регистрации у тебя появится кабинет, публичный профиль и прямой путь к скачиванию лаунчера.
          </p>

          <div class="mt-8 grid gap-3">
            <div class="rounded-[1.3rem] border border-white/10 bg-white/10 p-4 text-sm leading-7 text-white/80">
              Один аккаунт для сайта и официального лаунчера.
            </div>
            <div class="rounded-[1.3rem] border border-white/10 bg-white/10 p-4 text-sm leading-7 text-white/80">
              Письмо подтверждения отправится автоматически.
            </div>
            <div class="rounded-[1.3rem] border border-white/10 bg-white/10 p-4 text-sm leading-7 text-white/80">
              Ник, баннер, фон и статус можно будет настроить в удобном редакторе.
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>
