<script setup>
import {computed, reactive, ref, watch} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginWithPassword } from '../stores/authStore'
import { toastError, toastSuccess } from '../services/toast'

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
    toastSuccess('Вход выполнен. Аккаунт готов к игре.', 'С возвращением')
    await router.push(redirectTarget.value)
  } catch (error) {
    errorMessage.value = error?.message || 'Не удалось войти в аккаунт.'
  } finally {
    isSubmitting.value = false
  }
}
watch(errorMessage, (value) => { if (value) toastError(value) })
</script>

<template>
  <section class="py-10 md:py-16">
    <div class="container-shell max-w-6xl">
      <div class="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <aside class="gradient-panel p-6 md:p-8">
          <div class="section-kicker section-kicker--light">Вход в аккаунт</div>
          <h1 class="text-3xl font-black tracking-tight text-white md:text-5xl">
            Возвращайся в игру без лишних экранов
          </h1>
          <p class="mt-4 text-base leading-8 text-white/78">
            Тот же аккаунт работает для сайта, кабинета и официального лаунчера.
            После входа игрок сразу попадает туда, куда шёл.
          </p>

          <div class="mt-8 grid gap-3">
            <div class="dark-list-card">
              <p class="text-sm font-black text-white">Логин или почта</p>
              <p class="mt-1.5 text-sm leading-6 text-white/74">
                Можно использовать любой из вариантов — система примет оба.
              </p>
            </div>
            <div class="dark-list-card">
              <p class="text-sm font-black text-white">Один вход на всё</p>
              <p class="mt-1.5 text-sm leading-6 text-white/74">
                Кабинет, профиль, лаунчер и дальнейший запуск игры идут через одну точку.
              </p>
            </div>
            <div class="dark-list-card">
              <p class="text-sm font-black text-white">Никакой путаницы</p>
              <p class="mt-1.5 text-sm leading-6 text-white/74">
                После входа ты сразу сможешь скачать лаунчер или открыть свой кабинет.
              </p>
            </div>
          </div>
        </aside>

        <div class="surface-card p-6 md:p-8 lg:p-10">
          <div class="section-kicker">Вход</div>
          <h2 class="section-title">Войти в аккаунт</h2>
          <p class="section-subtitle">
            Используй логин или почту и пароль от аккаунта VoidRP.
          </p>

          <div v-if="route.query.redirect" class="alert alert-info mt-6">
            Сначала нужно войти, а затем страница откроется автоматически.
          </div>

          <form class="mt-8 grid gap-4" @submit.prevent="submit">
            <label>
              <span class="field-label">Логин или почта</span>
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


