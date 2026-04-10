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
const successMessage = ref('')
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
  successMessage.value = ''
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
  <section class="py-16 md:py-24">
    <div class="container-shell max-w-3xl">
      <div class="glass-card rounded-[32px] p-8 md:p-10">
        <div class="section-kicker">Регистрация</div>
        <h1 class="section-title">Создать аккаунт VoidRP</h1>
        <p class="section-subtitle">
          Этот аккаунт нужен для сайта, личного кабинета и официального лаунчера. После регистрации мы сразу отправим письмо для подтверждения почты.
        </p>

        <form class="mt-8 grid gap-4 md:grid-cols-2" @submit.prevent="submit">
          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Логин</span>
            <input
              v-model="form.site_login"
              class="input input-bordered w-full rounded-2xl"
              required
            />
          </label>

          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Игровой ник</span>
            <input
              v-model="form.minecraft_nickname"
              class="input input-bordered w-full rounded-2xl"
              required
            />
          </label>

          <label class="form-control w-full md:col-span-2">
            <span class="label-text mb-2 font-semibold text-slate-700">Email</span>
            <input
              v-model="form.email"
              type="email"
              class="input input-bordered w-full rounded-2xl"
              required
            />
          </label>

          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Пароль</span>
            <input
              v-model="form.password"
              type="password"
              class="input input-bordered w-full rounded-2xl"
              required
            />
          </label>

          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Повтори пароль</span>
            <input
              v-model="form.password_repeat"
              type="password"
              class="input input-bordered w-full rounded-2xl"
              required
            />
          </label>

          <div class="md:col-span-2 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div class="flex flex-col gap-4 md:flex-row md:items-end">
              <label class="form-control w-full">
                <span class="label-text mb-2 font-semibold text-slate-700">Referral code</span>
                <input
                  v-model="form.referral_code"
                  class="input input-bordered w-full rounded-2xl"
                  placeholder="Необязательно"
                />
              </label>

              <button
                type="button"
                class="btn btn-outline rounded-2xl"
                :disabled="isCheckingReferral || !form.referral_code.trim()"
                @click="resolveReferralCode(form.referral_code)"
              >
                {{ isCheckingReferral ? 'Проверяем...' : 'Проверить код' }}
              </button>
            </div>

            <p class="mt-3 text-sm leading-6 text-slate-600">
              Если тебя пригласил другой игрок, укажи его код. Это засчитается в его реферальный прогресс.
            </p>

            <p
              v-if="referralMessage"
              class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {{ referralMessage }}
            </p>

            <p
              v-if="referralError"
              class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {{ referralError }}
            </p>
          </div>

          <p
            v-if="errorMessage"
            class="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {{ errorMessage }}
          </p>

          <p
            v-if="successMessage"
            class="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {{ successMessage }}
          </p>

          <div
            class="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <button type="submit" class="btn btn-primary rounded-2xl" :disabled="isSubmitting">
              {{ isSubmitting ? 'Создаём аккаунт...' : 'Создать аккаунт' }}
            </button>
            <RouterLink to="/login" class="font-semibold text-primary">
              Уже зарегистрирован? Войти
            </RouterLink>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>