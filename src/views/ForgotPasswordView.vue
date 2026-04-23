<script setup>
import {reactive, ref, watch} from 'vue'
import { requestPasswordReset } from '../services/authApi'
import { toastError, toastSuccess } from '../services/toast'

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
watch(errorMessage, (value) => { if (value) toastError(value) })
watch(successMessage, (value) => { if (value) toastSuccess(value, 'Письмо отправлено') })
</script>

<template>
  <section class="py-12 md:py-20">
    <div class="container-shell max-w-4xl">
      <div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside class="gradient-panel p-6 md:p-8">
          <div class="section-kicker section-kicker--light">Восстановление доступа</div>
          <h1 class="text-3xl font-black tracking-tight text-white md:text-4xl">Верни доступ к аккаунту спокойно</h1>
          <p class="mt-4 text-base leading-8 text-white/78">
            Укажи почту, и система отправит письмо со ссылкой на страницу смены пароля. Ответ всегда нейтральный — это нормально.
          </p>
        </aside>

        <div class="surface-card p-6 md:p-8 lg:p-10">
          <div class="section-kicker">Сброс пароля</div>
          <h2 class="section-title">Забыли пароль?</h2>
          <p class="section-subtitle">
            Укажи свою почту. Мы отправим письмо со ссылкой на страницу смены пароля.
          </p>

          <form class="mt-8 grid gap-4" @submit.prevent="submit">
            <label>
              <span class="field-label">Почта</span>
              <input v-model="form.email" type="email" class="input" required />
            </label>


            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner"></span>
              <span>{{ isSubmitting ? 'Отправляем письмо...' : 'Отправить письмо' }}</span>
            </button>
          </form>

          <div class="alert alert-info mt-6">
            Для безопасности мы не показываем, существует ли аккаунт с этой почтой. Если письмо не пришло сразу, проверь папку «Спам».
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


