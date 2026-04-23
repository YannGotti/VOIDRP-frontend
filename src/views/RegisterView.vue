<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { previewReferralCode } from '../services/referralApi'
import { registerAndOptionallyStay } from '../stores/authStore'
import { toastInfo, toastSuccess } from '../services/toast'

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
const referralMessage = ref('')
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
    toastSuccess('Код приглашения найден и принят.', 'Приглашение')
  } finally {
    isCheckingReferral.value = false
  }
}

async function submit() {
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

    toastSuccess('Аккаунт создан. Мы отправили письмо для подтверждения почты.', 'Регистрация завершена')

    await router.push({
      path: '/verify-email',
      query: {
        email: form.email,
        sent: '1',
        redirect: typeof route.query.redirect === 'string' ? route.query.redirect : '',
      },
    })
  } finally {
    isSubmitting.value = false
  }
}

function showPasswordHint() {
  toastInfo('Пароль должен быть не короче 8 символов. Лучше использовать буквы разного регистра и цифры.', 'Подсказка по паролю')
}

watch(
  () => form.referral_code,
  () => {
    referralPreview.value = null
    referralMessage.value = ''
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
          <h1 class="section-title">Создать аккаунт</h1>
          <p class="section-subtitle max-w-3xl">
            Этот аккаунт будет работать для сайта, кабинета и официального лаунчера.
            После регистрации письмо для подтверждения почты отправится автоматически.
          </p>

          <form class="mt-8 grid gap-4 md:grid-cols-2" @submit.prevent="submit">
            <label>
              <span class="field-label">Логин</span>
              <input v-model="form.site_login" class="input" placeholder="Как тебя видеть на сайте" required />
            </label>

            <label>
              <span class="field-label">Игровой ник</span>
              <input v-model="form.minecraft_nickname" class="input" placeholder="Ник в Minecraft" required />
            </label>

            <label class="md:col-span-2">
              <span class="field-label">Почта</span>
              <input v-model="form.email" type="email" class="input" placeholder="name@example.com" required />
            </label>

            <label>
              <span class="field-label">Пароль</span>
              <input v-model="form.password" type="password" class="input" placeholder="Минимум 8 символов" required />
            </label>

            <label>
              <span class="field-label">Повтори пароль</span>
              <input v-model="form.password_repeat" type="password" class="input" placeholder="Повтори пароль" required />
            </label>

            <div class="md:col-span-2 rounded-[1.5rem] border border-white/10 bg-slate-950/65 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div class="flex flex-col gap-3 md:flex-row md:items-end">
                <label class="flex-1">
                  <span class="field-label">Код приглашения</span>
                  <input
                    v-model="form.referral_code"
                    class="input"
                    placeholder="Необязательно"
                    autocomplete="off"
                  />
                </label>

                <button
                  type="button"
                  class="btn btn-outline md:w-[220px]"
                  :disabled="isCheckingReferral || !form.referral_code.trim()"
                  @click="resolveReferralCode(form.referral_code)"
                >
                  <span v-if="isCheckingReferral" class="spinner"></span>
                  <span>{{ isCheckingReferral ? 'Проверяем...' : 'Проверить код' }}</span>
                </button>
              </div>

              <p v-if="referralMessage" class="mt-3 text-sm leading-6 text-emerald-300">
                {{ referralMessage }}
              </p>
            </div>

            <div class="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner"></span>
                <span>{{ isSubmitting ? 'Создаём аккаунт...' : 'Создать аккаунт' }}</span>
              </button>

              <button type="button" class="btn btn-outline" @click="showPasswordHint">
                Подсказка по паролю
              </button>
            </div>
          </form>
        </div>

        <aside class="gradient-panel p-6 md:p-8 lg:p-10">
          <div class="section-kicker section-kicker--light">Что дальше</div>
          <h2 class="text-3xl font-black tracking-tight text-white md:text-4xl">
            После регистрации всё будет понятно
          </h2>
          <p class="mt-4 text-base leading-8 text-white/78">
            Сначала подтверждаешь почту, потом скачиваешь лаунчер и входишь под тем же аккаунтом.
            Ничего отдельно настраивать не нужно.
          </p>

          <div class="mt-8 grid gap-3">
            <div class="dark-list-card">
              <p class="text-sm font-black text-white">Шаг 1</p>
              <p class="mt-1.5 text-sm leading-6 text-white/74">Подтверди почту по письму, которое сайт отправит автоматически.</p>
            </div>
            <div class="dark-list-card">
              <p class="text-sm font-black text-white">Шаг 2</p>
              <p class="mt-1.5 text-sm leading-6 text-white/74">Скачай официальный лаунчер и войди под тем же аккаунтом.</p>
            </div>
            <div class="dark-list-card">
              <p class="text-sm font-black text-white">Шаг 3</p>
              <p class="mt-1.5 text-sm leading-6 text-white/74">Запускай игру без поиска модпака, версии и лишних инструкций.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>
