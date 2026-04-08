<script setup>
import { reactive, ref } from 'vue'
import { requestPasswordReset } from '../services/authApi'

const form = reactive({ email: '' })
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function submit() {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    const response = await requestPasswordReset(form)
    successMessage.value = response.message
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось запросить сброс пароля.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container-shell max-w-2xl">
      <div class="glass-card rounded-[32px] p-8 md:p-10">
        <div class="section-kicker">Восстановление доступа</div>
        <h1 class="section-title">Запросить сброс пароля</h1>
        <p class="section-subtitle">
          На текущем этапе reset token будет записан в логи backend, потому что email backend пока работает в режиме logging.
        </p>

        <form class="mt-8 grid gap-4" @submit.prevent="submit">
          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Email</span>
            <input v-model="form.email" type="email" class="input input-bordered w-full rounded-2xl" required />
          </label>

          <p v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ errorMessage }}
          </p>

          <p v-if="successMessage" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {{ successMessage }}
          </p>

          <button type="submit" class="btn btn-primary rounded-2xl" :disabled="isSubmitting">
            {{ isSubmitting ? 'Отправляем запрос...' : 'Запросить токен сброса' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
