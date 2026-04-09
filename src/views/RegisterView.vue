<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registerAndOptionallyStay } from '../stores/authStore'

const route = useRoute()
const router = useRouter()

const form = reactive({
  site_login: '',
  minecraft_nickname: '',
  email: '',
  password: '',
  password_repeat: '',
})
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function submit() {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await registerAndOptionallyStay(form)
    successMessage.value = response.message
    await router.push({
      path: '/verify-email',
      query: {
        email: form.email,
        redirect: typeof route.query.redirect === 'string' ? route.query.redirect : '',
      },
    })
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось создать аккаунт.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container-shell max-w-3xl">
      <div class="glass-card rounded-[32px] p-8 md:p-10">
        <div class="section-kicker">Регистрация</div>
        <h1 class="section-title">Создать аккаунт VoidRP</h1>
        <p class="section-subtitle">
          Этот аккаунт нужен для сайта, личного кабинета и официального лаунчера. После регистрации ты сразу перейдёшь к следующему шагу.
        </p>

        <form class="mt-8 grid gap-4 md:grid-cols-2" @submit.prevent="submit">
          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Логин</span>
            <input v-model="form.site_login" class="input input-bordered w-full rounded-2xl" required />
          </label>

          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Игровой ник</span>
            <input v-model="form.minecraft_nickname" class="input input-bordered w-full rounded-2xl" required />
          </label>

          <label class="form-control w-full md:col-span-2">
            <span class="label-text mb-2 font-semibold text-slate-700">Email</span>
            <input v-model="form.email" type="email" class="input input-bordered w-full rounded-2xl" required />
          </label>

          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Пароль</span>
            <input v-model="form.password" type="password" class="input input-bordered w-full rounded-2xl" required />
          </label>

          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Повтори пароль</span>
            <input v-model="form.password_repeat" type="password" class="input input-bordered w-full rounded-2xl" required />
          </label>

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

          <div class="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" class="btn btn-primary rounded-2xl" :disabled="isSubmitting">
              {{ isSubmitting ? 'Создаём аккаунт...' : 'Создать аккаунт' }}
            </button>
            <RouterLink to="/login" class="font-semibold text-primary">Уже зарегистрирован? Войти</RouterLink>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
