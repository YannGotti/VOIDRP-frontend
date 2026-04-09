<script setup>
import { onMounted, ref } from 'vue'
import { reloadMe, useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const errorMessage = ref('')
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await reloadMe()
  } catch (error) {
    errorMessage.value = error.message || 'Не удалось загрузить профиль.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container-shell">
      <div class="max-w-3xl">
        <div class="section-kicker">Профиль</div>
        <h1 class="section-title">Привет, {{ auth.displayName.value }}</h1>
        <p class="section-subtitle">
          Здесь собраны твои основные данные. Позже на этой странице появятся игровая статистика, скин и заявки на разрешённые моды.
        </p>
      </div>

      <div
        v-if="!auth.emailVerified.value"
        class="mt-8 rounded-[28px] border border-amber-200 bg-amber-50 px-6 py-5 text-sm leading-7 text-amber-900"
      >
        Почта пока не подтверждена. Аккаунт уже работает, но лучше подтвердить почту заранее.
        <RouterLink to="/verify-email" class="ml-2 font-semibold text-primary">Подтвердить почту</RouterLink>
      </div>

      <div class="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div class="glass-card rounded-[32px] p-8">
          <div class="section-kicker">Мои данные</div>
          <div class="mt-6 grid gap-4">
            <div class="build-info-card">
              <p class="build-info-card__label">Логин</p>
              <p class="build-info-card__value">{{ auth.state.user?.site_login }}</p>
            </div>
            <div class="build-info-card">
              <p class="build-info-card__label">Почта</p>
              <p class="build-info-card__value">{{ auth.state.user?.email }}</p>
            </div>
            <div class="build-info-card">
              <p class="build-info-card__label">Статус почты</p>
              <p class="build-info-card__value">
                {{ auth.state.user?.email_verified ? 'Подтверждена' : 'Не подтверждена' }}
              </p>
            </div>
            <div class="build-info-card">
              <p class="build-info-card__label">Игровой ник</p>
              <p class="build-info-card__value">{{ auth.state.playerAccount?.minecraft_nickname }}</p>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink to="/download-launcher" class="btn btn-primary rounded-2xl">Скачать лаунчер</RouterLink>
            <RouterLink v-if="!auth.emailVerified.value" to="/verify-email" class="btn btn-outline rounded-2xl">
              Подтвердить почту
            </RouterLink>
          </div>
        </div>

        <div class="glass-card rounded-[32px] p-8">
          <div class="section-kicker">Скоро здесь</div>
          <div class="mt-6 space-y-4">
            <div class="advantage-row">
              <div class="advantage-row__icon">01</div>
              <div>
                <p class="font-bold text-slate-900">Статистика</p>
                <p class="mt-1 text-slate-600">Здесь появится твоя игровая статистика.</p>
              </div>
            </div>

            <div class="advantage-row">
              <div class="advantage-row__icon">02</div>
              <div>
                <p class="font-bold text-slate-900">Скин</p>
                <p class="mt-1 text-slate-600">Позже можно будет загрузить и посмотреть свой скин.</p>
              </div>
            </div>

            <div class="advantage-row">
              <div class="advantage-row__icon">03</div>
              <div>
                <p class="font-bold text-slate-900">Разрешённые моды</p>
                <p class="mt-1 text-slate-600">Позже здесь появится форма для отправки модов на рассмотрение.</p>
              </div>
            </div>
          </div>

          <p v-if="loading" class="mt-6 text-sm text-slate-500">Обновляем данные...</p>
          <p
            v-if="errorMessage"
            class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {{ errorMessage }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
