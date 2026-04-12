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
    errorMessage.value = error?.message || 'Не удалось войти в аккаунт.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="py-10 md:py-16">
    <div class="container-shell max-w-6xl">
      <div class="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <aside class="gradient-panel p-6 md:p-8">
          <div class="section-kicker section-kicker--light">Вход в аккаунт</div>
          <h1 class="text-3xl font-black tracking-tight text-white md:text-5xl">
            Возвращайся в игру без путаницы
          </h1>
          <p class="mt-4 text-base leading-8 text-white/78">
            Один аккаунт работает для сайта, кабинета и официального лаунчера.
            После входа ты сразу попадёшь туда, куда собирался перейти.
          </p>

          <div class="mt-8 grid gap-3">
            <div class="rounded-[1.3rem] border border-white/10 bg-white/10 p-4 text-sm leading-7 text-white/80">
              Логин или email подойдут одинаково.
            </div>
            <div class="rounded-[1.3rem] border border-white/10 bg-white/10 p-4 text-sm leading-7 text-white/80">
              Почта и ник уже будут связаны с твоим аккаунтом.
            </div>
            <div class="rounded-[1.3rem] border border-white/10 bg-white/10 p-4 text-sm leading-7 text-white/80">
              После входа можно сразу скачать лаунчер и перейти к игре.
            </div>
          </div>
        </aside>

        <div class="surface-card p-6 md:p-8 lg:p-10">
          <div class="section-kicker">Вход</div>
          <h2 class="section-title">Войти в аккаунт</h2>
          <p class="section-subtitle">
            Используй логин или email и пароль от аккаунта VoidRP. Эти же данные
            подойдут для официального лаунчера.
          </p>

          <div v-if="route.query.redirect" class="alert alert-info mt-6">
            Сначала нужно войти, а затем страница откроется автоматически.
          </div>

          <form class="mt-8 grid gap-4" @submit.prevent="submit">
            <label>
              <span class="field-label">Логин или email</span>
              <input v-model="form.login" class="input" autocomplete="username" required />
            </label>

            <label>
              <span class="field-label">Пароль</span>
              <input
                v-model="form.password"
                type="password"
                class="input"
                autocomplete="current-password"
                required
              />
            </label>

            <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>

            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner"></span>
              <span>{{ isSubmitting ? 'Входим...' : 'Войти' }}</span>
            </button>
          </form>

          <div class="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <RouterLink to="/forgot-password" class="text-slate-300 transition hover:text-white">
              Забыли пароль?
            </RouterLink>
            <RouterLink to="/register" class="text-slate-300 transition hover:text-white">
              Нет аккаунта? Создать
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
