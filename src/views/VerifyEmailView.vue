<script setup>
import { reactive, ref } from 'vue'
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

async function submitVerify() {
  errorMessage.value = ''
  verifyMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await verifyEmail({ token: form.token })
    verifyMessage.value = response.message

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
    const response = await resendVerification({ email: form.email })
    resendMessage.value = `${response.message} Если письмо не приходит автоматически, обратись к администратору.`
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось запросить новый код.'
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container-shell max-w-3xl">
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="glass-card rounded-[32px] p-8 md:p-10">
          <div class="section-kicker">Подтверждение почты</div>
          <h1 class="section-title">Подтверди свою почту</h1>
          <p class="section-subtitle">
            Вставь код подтверждения. Пока письмо может выдаваться вручную, если автоматическая отправка ещё не подключена.
          </p>

          <form class="mt-8 grid gap-4" @submit.prevent="submitVerify">
            <label class="form-control w-full">
              <span class="label-text mb-2 font-semibold text-slate-700">Код подтверждения</span>
              <input v-model="form.token" class="input input-bordered w-full rounded-2xl" required />
            </label>

            <p
              v-if="verifyMessage"
              class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              {{ verifyMessage }}
            </p>

            <p
              v-if="errorMessage"
              class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {{ errorMessage }}
            </p>

            <button type="submit" class="btn btn-primary rounded-2xl" :disabled="isSubmitting">
              {{ isSubmitting ? 'Проверяем...' : 'Подтвердить почту' }}
            </button>
          </form>

          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink v-if="auth.isAuthenticated.value" to="/profile" class="btn btn-outline rounded-2xl">
              Вернуться в профиль
            </RouterLink>
            <RouterLink v-else to="/login" class="btn btn-outline rounded-2xl">
              Войти в аккаунт
            </RouterLink>
            <RouterLink to="/download-launcher" class="btn btn-ghost rounded-2xl">
              Скачать лаунчер
            </RouterLink>
          </div>
        </div>

        <div class="glass-card rounded-[32px] p-8 md:p-10">
          <div class="section-kicker">Новый код</div>
          <h2 class="section-title">Запросить код повторно</h2>
          <p class="section-subtitle">
            Если первый код потерялся, можно запросить новый для той же почты.
          </p>

          <form class="mt-8 grid gap-4" @submit.prevent="submitResend">
            <label class="form-control w-full">
              <span class="label-text mb-2 font-semibold text-slate-700">Почта</span>
              <input v-model="form.email" type="email" class="input input-bordered w-full rounded-2xl" required />
            </label>

            <p
              v-if="resendMessage"
              class="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700"
            >
              {{ resendMessage }}
            </p>

            <button type="submit" class="btn btn-outline rounded-2xl" :disabled="isResending">
              {{ isResending ? 'Запрашиваем...' : 'Запросить новый код' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
