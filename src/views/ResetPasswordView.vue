<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword } from '../services/authApi'

const route = useRoute()
const router = useRouter()
const form = reactive({
  token: typeof route.query.token === 'string' ? route.query.token : '',
  new_password: '',
  new_password_repeat: '',
})
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function submit() {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await resetPassword(form)
    successMessage.value = response.message
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось сбросить пароль.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container-shell max-w-2xl">
      <div class="glass-card rounded-[32px] p-8 md:p-10">
        <div class="section-kicker">Новый пароль</div>
        <h1 class="section-title">Сброс пароля аккаунта</h1>
        <p class="section-subtitle">
          Вставь reset token из логов backend и задай новый пароль для аккаунта VoidRP.
        </p>

        <form class="mt-8 grid gap-4" @submit.prevent="submit">
          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Reset token</span>
            <input v-model="form.token" class="input input-bordered w-full rounded-2xl" required />
          </label>

          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Новый пароль</span>
            <input v-model="form.new_password" type="password" class="input input-bordered w-full rounded-2xl" required />
          </label>

          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Повтор нового пароля</span>
            <input v-model="form.new_password_repeat" type="password" class="input input-bordered w-full rounded-2xl" required />
          </label>

          <p v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ errorMessage }}
          </p>

          <p v-if="successMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {{ successMessage }}
          </p>

          <button type="submit" class="btn btn-primary rounded-2xl" :disabled="isSubmitting">
            {{ isSubmitting ? 'Сохраняем пароль...' : 'Сбросить пароль' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
