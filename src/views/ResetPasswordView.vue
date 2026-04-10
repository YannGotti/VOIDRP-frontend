<script setup>
import { computed, reactive, ref } from 'vue'
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

const hasTokenFromLink = computed(
  () => typeof form.token === 'string' && form.token.trim().length > 0,
)

async function submit() {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    await resetPassword({
      token: form.token.trim(),
      new_password: form.new_password,
      new_password_repeat: form.new_password_repeat,
    })

    successMessage.value = 'Новый пароль сохранён. Сейчас перенаправим на страницу входа.'

    setTimeout(() => {
      router.push('/login')
    }, 1200)
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось сохранить новый пароль.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="py-12 md:py-20">
    <div class="container-shell max-w-4xl">
      <div class="surface-card p-6 md:p-8 lg:p-10">
        <div class="section-kicker">Новый пароль</div>
        <h1 class="section-title">Сменить пароль</h1>
        <p class="section-subtitle">
          Если ты открыл страницу из письма, токен уже подставлен автоматически. Осталось только ввести новый пароль.
        </p>

        <div v-if="hasTokenFromLink" class="alert alert-info mt-6">
          Ссылка из письма распознана. Поле токена можно не заполнять вручную.
        </div>

        <form class="mt-8 grid gap-4" @submit.prevent="submit">
          <label v-if="!hasTokenFromLink">
            <span class="field-label">Токен восстановления</span>
            <input v-model="form.token" class="input" required />
          </label>

          <label>
            <span class="field-label">Новый пароль</span>
            <input v-model="form.new_password" type="password" class="input" required />
          </label>

          <label>
            <span class="field-label">Повтори новый пароль</span>
            <input v-model="form.new_password_repeat" type="password" class="input" required />
          </label>

          <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="alert alert-success">{{ successMessage }}</p>

          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner"></span>
            <span>{{ isSubmitting ? 'Сохраняем...' : 'Сохранить новый пароль' }}</span>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
