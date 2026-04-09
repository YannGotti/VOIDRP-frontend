<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginWithPassword } from '../stores/authStore'

const route = useRoute()
const router = useRouter()

const form = reactive({
  login: '',
  password: '',
  device_name: 'VoidRP Site',
})
const isSubmitting = ref(false)
const errorMessage = ref('')
const redirectTarget = computed(() =>
  typeof route.query.redirect === 'string' && route.query.redirect.length > 0
    ? route.query.redirect
    : '/profile',
)

async function submit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await loginWithPassword(form)
    await router.push(redirectTarget.value)
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось войти в аккаунт.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container-shell max-w-2xl">
      <div class="glass-card rounded-[32px] p-8 md:p-10">
        <div class="section-kicker">Вход</div>
        <h1 class="section-title">Войти в аккаунт</h1>
        <p class="section-subtitle">
          Используй логин или email и пароль от аккаунта VoidRP. Эти же данные подойдут для официального лаунчера.
        </p>

        <div
          v-if="route.query.redirect"
          class="mt-6 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700"
        >
          Сначала нужно войти в аккаунт, а потом страница откроется автоматически.
        </div>

        <form class="mt-8 grid gap-4" @submit.prevent="submit">
          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Логин или email</span>
            <input v-model="form.login" class="input input-bordered w-full rounded-2xl" required />
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

          <p
            v-if="errorMessage"
            class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {{ errorMessage }}
          </p>

          <button type="submit" class="btn btn-primary mt-2 rounded-2xl" :disabled="isSubmitting">
            {{ isSubmitting ? 'Входим...' : 'Войти' }}
          </button>
        </form>

        <div class="mt-6 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <RouterLink to="/forgot-password" class="font-semibold text-primary">Забыли пароль?</RouterLink>
          <RouterLink to="/register" class="font-semibold text-primary">Нет аккаунта? Создать</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
