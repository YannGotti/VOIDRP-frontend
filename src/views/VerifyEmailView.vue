<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { resendVerification, verifyEmail } from '../services/authApi'
import { reloadMe, useAuthStore } from '../stores/authStore'

const route = useRoute()
const auth = useAuthStore()

const form = reactive({
  token: typeof route.query.token === 'string' ? route.query.token : '',
  email: typeof route.query.email === 'string' ? route.query.email : '',
})

const verifyMessage = ref('')
const resendMessage = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const isResending = ref(false)

const isAlreadyVerified = computed(() => auth.emailVerified.value)
const sentFromRegister = computed(() => route.query.sent === '1')
const hasEmail = computed(() => typeof form.email === 'string' && form.email.trim().length > 0)
const hasToken = computed(() => typeof form.token === 'string' && form.token.trim().length > 0)

async function submitVerify() {
  if (!hasToken.value) return

  errorMessage.value = ''
  verifyMessage.value = ''
  isSubmitting.value = true

  try {
    await verifyEmail({ token: form.token.trim() })
    verifyMessage.value = 'Почта успешно подтверждена.'

    if (auth.isAuthenticated.value) {
      await reloadMe()
    }
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось подтвердить почту.'
  } finally {
    isSubmitting.value = false
  }
}

async function submitResend() {
  errorMessage.value = ''
  resendMessage.value = ''
  isResending.value = true

  try {
    await resendVerification({ email: form.email.trim() })
    resendMessage.value = 'Если аккаунт существует и почта ещё не подтверждена, новое письмо уже отправлено.'
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось отправить письмо повторно.'
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container-shell max-w-5xl">
      <div
        v-if="isAlreadyVerified"
        class="mb-6 rounded-[28px] border border-emerald-200 bg-emerald-50 px-6 py-5 text-sm leading-7 text-emerald-900"
      >
        Почта уже подтверждена. Можно возвращаться в профиль или переходить к скачиванию лаунчера.
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="glass-card rounded-[32px] p-8 md:p-10">
          <div class="section-kicker">Подтверждение почты</div>
          <h1 class="section-title">Проверь почту</h1>
          <p class="section-subtitle">
            Обычно достаточно открыть письмо и нажать кнопку подтверждения. После этого backend сам завершит подтверждение и покажет страницу успеха.
          </p>

          <div
            v-if="sentFromRegister && hasEmail"
            class="mt-6 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800"
          >
            Мы отправили письмо на <strong>{{ form.email }}</strong>. Если его нет во входящих, проверь папку «Спам» или запроси отправку ещё раз.
          </div>

          <div
            v-else-if="hasEmail"
            class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
          >
            Почта для подтверждения: <strong>{{ form.email }}</strong>
          </div>

          <div class="mt-8 rounded-[24px] border border-slate-200 bg-white/70 p-5">
            <p class="text-sm font-semibold text-slate-900">Ручное подтверждение</p>
            <p class="mt-2 text-sm leading-7 text-slate-600">
              Этот вариант нужен редко. Если у тебя есть токен отдельно, его можно вставить вручную.
            </p>

            <form class="mt-5 grid gap-4" @submit.prevent="submitVerify">
              <label class="form-control w-full">
                <span class="label-text mb-2 font-semibold text-slate-700">Токен подтверждения</span>
                <input
                  v-model="form.token"
                  class="input input-bordered w-full rounded-2xl"
                  placeholder="Вставь токен, если он у тебя есть"
                />
              </label>

              <p
                v-if="verifyMessage"
                class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {{ verifyMessage }}
              </p>

              <p
                v-if="errorMessage"
                class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {{ errorMessage }}
              </p>

              <button
                type="submit"
                class="btn btn-primary rounded-2xl"
                :disabled="isSubmitting || !hasToken"
              >
                {{ isSubmitting ? 'Проверяем...' : 'Подтвердить вручную' }}
              </button>
            </form>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink v-if="auth.isAuthenticated.value" to="/profile" class="btn btn-outline rounded-2xl">
              Вернуться в профиль
            </RouterLink>
            <RouterLink v-else to="/login" class="btn btn-outline rounded-2xl">
              Войти
            </RouterLink>
            <RouterLink to="/download-launcher" class="btn btn-ghost rounded-2xl">
              Скачать лаунчер
            </RouterLink>
          </div>
        </div>

        <div class="glass-card rounded-[32px] p-8 md:p-10">
          <div class="section-kicker">Отправить письмо ещё раз</div>
          <h2 class="section-title">Не пришло письмо?</h2>
          <p class="section-subtitle">
            Можно запросить новое письмо подтверждения на ту же почту. Для безопасности мы всегда показываем нейтральный ответ.
          </p>

          <form class="mt-8 grid gap-4" @submit.prevent="submitResend">
            <label class="form-control w-full">
              <span class="label-text mb-2 font-semibold text-slate-700">Email</span>
              <input
                v-model="form.email"
                type="email"
                class="input input-bordered w-full rounded-2xl"
                required
              />
            </label>

            <p
              v-if="resendMessage"
              class="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700"
            >
              {{ resendMessage }}
            </p>

            <button type="submit" class="btn btn-outline rounded-2xl" :disabled="isResending">
              {{ isResending ? 'Отправляем...' : 'Отправить письмо повторно' }}
            </button>
          </form>

          <div class="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            Иногда письмо приходит не сразу. Подожди немного, затем проверь входящие, «Спам» и «Промоакции».
          </div>
        </div>
      </div>
    </div>
  </section>
</template>