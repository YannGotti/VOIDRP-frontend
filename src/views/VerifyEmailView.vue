<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { resendVerification, verifyEmail } from '../services/authApi'
import { reloadMe, useAuthStore } from '../stores/authStore'
import { toastSuccess } from '../services/toast'

const route = useRoute()
const auth = useAuthStore()

const form = reactive({
  token: typeof route.query.token === 'string' ? route.query.token : '',
  email: typeof route.query.email === 'string' ? route.query.email : '',
})

const isSubmitting = ref(false)
const isResending = ref(false)

const isAlreadyVerified = computed(() => auth.emailVerified.value)
const sentFromRegister = computed(() => route.query.sent === '1')
const hasEmail = computed(() => typeof form.email === 'string' && form.email.trim().length > 0)
const hasToken = computed(() => typeof form.token === 'string' && form.token.trim().length > 0)

async function submitVerify() {
  if (!hasToken.value) return

  isSubmitting.value = true

  try {
    await verifyEmail({ token: form.token.trim() })
    toastSuccess('Почта успешно подтверждена. Теперь можно переходить к игре.', 'Почта подтверждена')

    if (auth.isAuthenticated.value) {
      await reloadMe()
    }
  } finally {
    isSubmitting.value = false
  }
}

async function submitResend() {
  isResending.value = true

  try {
    await resendVerification({ email: form.email.trim() })
    toastSuccess(
      'Если почта привязана к аккаунту и ещё не подтверждена, новое письмо уже отправлено.',
      'Письмо отправлено',
    )
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <section class="py-12 md:py-20">
    <div class="container-shell max-w-6xl">
      <div v-if="isAlreadyVerified" class="alert alert-success mb-6">
        Почта уже подтверждена. Можно возвращаться в профиль или скачивать лаунчер.
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="surface-card p-6 md:p-8 lg:p-10">
          <div class="section-kicker">Подтверждение почты</div>
          <h1 class="section-title">Проверь почту</h1>
          <p class="section-subtitle">
            Обычно достаточно открыть письмо и нажать кнопку подтверждения. Если нужно, токен можно вставить вручную.
          </p>

          <div v-if="sentFromRegister && hasEmail" class="alert alert-info mt-6">
            Мы отправили письмо на <strong>{{ form.email }}</strong>. Если его нет во входящих, проверь папку «Спам» или запроси отправку ещё раз.
          </div>

          <div v-else-if="hasEmail" class="alert alert-info mt-6">
            Почта для подтверждения: <strong>{{ form.email }}</strong>
          </div>

          <form class="mt-8 grid gap-4" @submit.prevent="submitVerify">
            <label>
              <span class="field-label">Токен подтверждения</span>
              <input v-model="form.token" class="input" placeholder="Вставь токен, если нужно" />
            </label>

            <button type="submit" class="btn btn-primary" :disabled="isSubmitting || !hasToken">
              <span v-if="isSubmitting" class="spinner"></span>
              <span>{{ isSubmitting ? 'Проверяем...' : 'Подтвердить вручную' }}</span>
            </button>
          </form>

          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink v-if="auth.isAuthenticated.value" to="/profile" class="btn btn-outline">
              Вернуться в профиль
            </RouterLink>
            <RouterLink v-else to="/login" class="btn btn-outline">
              Войти
            </RouterLink>
            <RouterLink to="/download-launcher" class="btn btn-ghost">
              Скачать лаунчер
            </RouterLink>
          </div>
        </div>

        <div class="gradient-panel p-6 md:p-8 lg:p-10">
          <div class="section-kicker section-kicker--light">Не пришло письмо?</div>
          <h2 class="text-3xl font-black tracking-tight text-white md:text-4xl">Запроси новое письмо</h2>
          <p class="mt-4 text-base leading-8 text-white/78">
            Укажи почту ещё раз, и сайт отправит новое письмо, если подтверждение всё ещё нужно.
          </p>

          <form class="mt-8 grid gap-4" @submit.prevent="submitResend">
            <label>
              <span class="field-label !text-white/88">Почта</span>
              <input v-model="form.email" type="email" class="input" required />
            </label>

            <button type="submit" class="btn btn-light" :disabled="isResending">
              <span v-if="isResending" class="spinner"></span>
              <span>{{ isResending ? 'Отправляем...' : 'Отправить письмо повторно' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
