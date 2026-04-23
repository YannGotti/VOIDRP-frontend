<script setup>
import { reactive, ref } from 'vue'
import { requestPasswordReset } from '../services/authApi'
import { toastSuccess } from '../services/toast'

const form = reactive({ email: '' })
const isSubmitting = ref(false)

async function submit() {
  isSubmitting.value = true

  try {
    await requestPasswordReset(form)
    toastSuccess(
      'Если аккаунт с такой почтой существует, письмо со ссылкой для смены пароля уже отправлено.',
      'Письмо отправлено',
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="py-12 md:py-20">
    <div class="container-shell max-w-4xl">
      <div class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside class="gradient-panel p-6 md:p-8">
          <div class="section-kicker section-kicker--light">Восстановление доступа</div>
          <h1 class="text-3xl font-black tracking-tight text-white md:text-4xl">Вернуть доступ без лишней паники</h1>
          <p class="mt-4 text-base leading-8 text-white/78">
            Укажи почту от аккаунта. Если она есть в системе, мы сразу отправим письмо со ссылкой для смены пароля.
          </p>
        </aside>

        <div class="surface-card p-6 md:p-8 lg:p-10">
          <div class="section-kicker">Сброс пароля</div>
          <h2 class="section-title">Не помню пароль</h2>
          <p class="section-subtitle">
            Введи почту от аккаунта VoidRP. Письмо придёт автоматически, если аккаунт существует.
          </p>

          <form class="mt-8 grid gap-4" @submit.prevent="submit">
            <label>
              <span class="field-label">Почта</span>
              <input v-model="form.email" type="email" class="input" placeholder="name@example.com" required />
            </label>

            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner"></span>
              <span>{{ isSubmitting ? 'Отправляем письмо...' : 'Отправить письмо' }}</span>
            </button>
          </form>

          <div class="alert alert-info mt-6">
            Для безопасности сайт не показывает, есть ли аккаунт на этой почте. Если письмо не пришло сразу, проверь папку «Спам».
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
