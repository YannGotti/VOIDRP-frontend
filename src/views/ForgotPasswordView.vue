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
    await requestPasswordReset(form)
    successMessage.value =
      'Если аккаунт с такой почтой существует, письмо со ссылкой для смены пароля уже отправлено.'
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось запросить восстановление доступа.'
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
        <h1 class="section-title">Забыли пароль?</h1>
        <p class="section-subtitle">
          Укажи свою почту. Мы отправим письмо со ссылкой на страницу смены пароля.
        </p>

        <form class="mt-8 grid gap-4" @submit.prevent="submit">
          <label class="form-control w-full">
            <span class="label-text mb-2 font-semibold text-slate-700">Email</span>
            <input v-model="form.email" type="email" class="input input-bordered w-full rounded-2xl" required />
          </label>

          <p
            v-if="errorMessage"
            class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {{ errorMessage }}
          </p>

          <p
            v-if="successMessage"
            class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {{ successMessage }}
          </p>

          <button type="submit" class="btn btn-primary rounded-2xl" :disabled="isSubmitting">
            {{ isSubmitting ? 'Отправляем письмо...' : 'Отправить письмо' }}
          </button>
        </form>

        <div class="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          Для безопасности мы не показываем, существует ли аккаунт с этой почтой. Если письмо не пришло сразу, проверь папку «Спам».
        </div>
      </div>
    </div>
  </section>
</template>