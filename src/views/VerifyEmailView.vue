<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { resendVerification, verifyEmail } from '../services/authApi'
import { reloadMe, useAuthStore } from '../stores/authStore'

const route = useRoute()
const auth = useAuthStore()

const form = reactive({
  token: typeof route.query.token === 'string' ? route.query.token : '',
  email: typeof route.query.email === 'string' ? route.query.email : '',
})

const verifyMessage = ref('')
const resendMessage = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const isResending = ref(false)

const isAlreadyVerified = computed(() => auth.emailVerified.value)
const sentFromRegister = computed(() => route.query.sent === '1')
const hasEmail = computed(() => typeof form.email === 'string' && form.email.trim().length > 0)
const hasToken = computed(() => typeof form.token === 'string' && form.token.trim().length > 0)

async function submitVerify() {
  if (!hasToken.value) return

  errorMessage.value = ''
  verifyMessage.value = ''
  isSubmitting.value = true

  try {
    await verifyEmail({ token: form.token.trim() })
    verifyMessage.value = 'Почта успешно подтверждена.'

    if (auth.isAuthenticated.value) {
      await reloadMe()
    }
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось подтвердить почту.'
  } finally {
    isSubmitting.value = false
  }
}

async function submitResend() {
  errorMessage.value = ''
  resendMessage.value = ''
  isResending.value = true

  try {
    await resendVerification({ email: form.email.trim() })
    resendMessage.value = 'Если аккаунт существует и почта ещё не подтверждена, новое письмо уже отправлено.'
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось отправить письмо повторно.'
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <section class="py-12 md:py-20">
    <div class="container-shell max-w-6xl">
      <div v-if="isAlreadyVerified" class="alert alert-success mb-6">
        Почта уже подтверждена. Можно возвращаться в профиль или переходить к скачиванию лаунчера.
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

            <p v-if="verifyMessage" class="alert alert-success">{{ verifyMessage }}</p>
            <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>

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
          <h2 class="text-3xl font-black tracking-tight text-white md:text-4xl">Запроси новое письмо подтверждения</h2>
          <p class="mt-4 text-base leading-8 text-white/78">
            Для безопасности мы всегда показываем нейтральный ответ. Даже если почта уже подтверждена, экран останется аккуратным и понятным.
          </p>

          <form class="mt-8 grid gap-4" @submit.prevent="submitResend">
            <label>
              <span class="field-label !text-white/88">Email</span>
              <input v-model="form.email" type="email" class="input" required />
            </label>

            <p v-if="resendMessage" class="alert alert-success">{{ resendMessage }}</p>

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
