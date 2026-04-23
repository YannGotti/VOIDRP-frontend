<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginWithPassword } from '../stores/authStore'
import { toastInfo, toastSuccess } from '../services/toast'

const route = useRoute()
const router = useRouter()

const form = reactive({
  login: '',
  password: '',
  device_name: 'VoidRP Site',
})

const isSubmitting = ref(false)

const redirectTarget = computed(() =>
  typeof route.query.redirect === 'string' && route.query.redirect.length > 0
    ? route.query.redirect
    : '/profile',
)

async function submit() {
  isSubmitting.value = true

  try {
    await loginWithPassword(form)
    toastSuccess('Вход выполнен. Аккаунт готов к игре и настройке профиля.', 'С возвращением')
    await router.push(redirectTarget.value)
  } finally {
    isSubmitting.value = false
  }
}

function showPasswordHint() {
  toastInfo('Если не помнишь пароль, открой восстановление доступа по кнопке ниже.', 'Подсказка')
}
</script>

<template>
  <section class="py-10 md:py-16">
    <div class="container-shell max-w-6xl">
      <div class="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <aside class="gradient-panel p-6 md:p-8">
          <div class="section-kicker section-kicker--light">Вход в аккаунт</div>
          <h1 class="text-3xl font-black tracking-tight text-white md:text-5xl">
            Вернуться в аккаунт за минуту
          </h1>
          <p class="mt-4 text-base leading-8 text-white/78">
            Один и тот же вход работает для сайта, кабинета и официального лаунчера.
            Без лишних шагов и непонятных экранов.
          </p>

          <div class="mt-8 grid gap-3">
            <div class="dark-list-card">
              <p class="text-sm font-black text-white">Логин или почта</p>
              <p class="mt-1.5 text-sm leading-6 text-white/74">
                Можно ввести любой удобный вариант — система примет оба.
              </p>
            </div>
            <div class="dark-list-card">
              <p class="text-sm font-black text-white">Один аккаунт на всё</p>
              <p class="mt-1.5 text-sm leading-6 text-white/74">
                После входа ты сразу сможешь открыть кабинет, скачать лаунчер или перейти к настройке профиля.
              </p>
            </div>
            <div class="dark-list-card">
              <p class="text-sm font-black text-white">Если забыл пароль</p>
              <p class="mt-1.5 text-sm leading-6 text-white/74">
                Доступ можно быстро восстановить через почту.
              </p>
            </div>
          </div>
        </aside>

        <div class="surface-card p-6 md:p-8 lg:p-10">
          <div class="section-kicker">Вход</div>
          <h2 class="section-title">Войти в аккаунт</h2>
          <p class="section-subtitle">
            Введи данные от аккаунта VoidRP. Если тебя перекинуло сюда автоматически, после входа нужная страница откроется сама.
          </p>

          <div v-if="route.query.redirect" class="alert alert-info mt-6">
            Сначала войди в аккаунт, а потом сайт сам откроет нужный раздел.
          </div>

          <form class="mt-8 grid gap-4" @submit.prevent="submit">
            <label>
              <span class="field-label">Логин или почта</span>
              <input
                v-model="form.login"
                class="input"
                autocomplete="username"
                placeholder="Например: YannGotti или почта"
                required
              />
            </label>

            <label>
              <span class="field-label">Пароль</span>
              <input
                v-model="form.password"
                type="password"
                class="input"
                autocomplete="current-password"
                placeholder="Введите пароль"
                required
              />
            </label>

            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner"></span>
              <span>{{ isSubmitting ? 'Входим...' : 'Войти' }}</span>
            </button>
          </form>

          <div class="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <button type="button" class="text-left text-slate-300 transition hover:text-white" @click="showPasswordHint">
              Подсказка по паролю
            </button>
            <RouterLink to="/forgot-password" class="text-slate-300 transition hover:text-white">
              Не помню пароль
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
