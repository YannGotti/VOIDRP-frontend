<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AccountTabs from '../components/AccountTabs.vue'
import { getMyReferralDashboard, regenerateMyReferralCode } from '../services/referralApi'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()

const loading = ref(true)
const regenerating = ref(false)
const error = ref('')
const success = ref('')
const dashboard = ref(null)

const rankLabel = computed(
  () => dashboard.value?.current_reward?.rank_name || dashboard.value?.current_reward?.rank || 'Без ранга',
)

const recentItems = computed(() => {
  if (Array.isArray(dashboard.value?.recent_registrations)) return dashboard.value.recent_registrations
  if (Array.isArray(dashboard.value?.recent_events)) return dashboard.value.recent_events
  return []
})

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function badgeClass(status) {
  if (status === 'qualified') return 'badge badge-success'
  if (status === 'pending') return 'badge badge-warning'
  return 'badge badge-ghost'
}

async function loadDashboard() {
  loading.value = true
  error.value = ''

  try {
    dashboard.value = await getMyReferralDashboard(auth.accessToken)
  } catch (err) {
    error.value = err?.message || 'Не удалось загрузить реферальный центр.'
  } finally {
    loading.value = false
  }
}

async function regenerateCode() {
  regenerating.value = true
  error.value = ''
  success.value = ''

  try {
    dashboard.value = await regenerateMyReferralCode(auth.accessToken)
    success.value = 'Новый реферальный код создан.'
  } catch (err) {
    error.value = err?.message || 'Не удалось сгенерировать новый код.'
  } finally {
    regenerating.value = false
  }
}

async function copyInviteUrl() {
  try {
    await navigator.clipboard.writeText(dashboard.value?.my_code?.invite_url || '')
    success.value = 'Ссылка приглашения скопирована.'
    error.value = ''
  } catch {
    error.value = 'Не удалось скопировать ссылку.'
  }
}

onMounted(loadDashboard)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div class="section-kicker !mb-2">Реферальный центр</div>
            <h1 class="text-2xl font-black tracking-tight text-slate-50 md:text-4xl">
              Приглашай игроков без лишней путаницы
            </h1>
            <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-400 md:text-[15px]">
              Здесь твой код приглашения, прогресс и недавние регистрации. Всё собрано
              компактно и по делу.
            </p>
          </div>

          <RouterLink to="/profile/public" class="btn btn-outline">
            Публичный профиль
          </RouterLink>
        </div>
      </section>

      <AccountTabs />

      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>

      <div v-if="loading" class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div class="skeleton h-[260px] rounded-[28px]"></div>
        <div class="skeleton h-[260px] rounded-[28px]"></div>
      </div>

      <template v-else>
        <div class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Твой код</div>
            <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
              Личная ссылка приглашения
            </h2>

            <div class="action-card mt-5">
              <p class="metric-label">Referral code</p>
              <p class="mt-2 break-all text-3xl font-black tracking-[0.12em] text-slate-50">
                {{ dashboard?.my_code?.code || '—' }}
              </p>
              <p class="mt-4 break-all text-sm leading-6 text-slate-400">
                {{ dashboard?.my_code?.invite_url || '—' }}
              </p>
            </div>

            <div class="mt-4 flex flex-wrap gap-3">
              <button class="btn btn-primary" @click="copyInviteUrl">Скопировать ссылку</button>
              <button class="btn btn-outline" :disabled="regenerating" @click="regenerateCode">
                <span v-if="regenerating" class="spinner"></span>
                <span>{{ regenerating ? 'Создаём...' : 'Новый код' }}</span>
              </button>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Прогресс</div>
            <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
              Текущее состояние
            </h2>

            <div class="metric-grid metric-grid-3 mt-5">
              <div class="metric-card text-center">
                <p class="metric-label">Pending</p>
                <p class="metric-value">{{ dashboard?.totals?.pending || 0 }}</p>
              </div>
              <div class="metric-card text-center">
                <p class="metric-label">Qualified</p>
                <p class="metric-value">{{ dashboard?.totals?.qualified || 0 }}</p>
              </div>
              <div class="metric-card text-center">
                <p class="metric-label">Ранг</p>
                <p class="metric-value !text-[1.2rem] md:!text-[1.5rem]">{{ rankLabel }}</p>
              </div>
            </div>

            <div class="action-card mt-5 text-sm text-slate-300">
              Чем больше приглашённых игроков дойдут до нужного статуса, тем выше твой
              ранг и тем больше ценность реферального центра.
            </div>
          </section>
        </div>

        <section class="surface-card p-5 md:p-6">
          <div class="section-kicker !mb-2">История</div>
          <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
            Недавние регистрации
          </h2>

          <div v-if="!recentItems.length" class="action-card mt-5 text-sm text-slate-400">
            Пока приглашённых регистраций нет.
          </div>

          <div v-else class="table-shell mt-5 overflow-x-auto">
            <table class="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th>Игрок</th>
                  <th>Дата</th>
                  <th>Статус</th>
                  <th>Награда</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in recentItems" :key="item.id || item.player_id || item.created_at">
                  <td>
                    <div class="font-semibold text-slate-100">
                      {{
                        item.display_name ||
                        item.minecraft_nickname ||
                        item.site_login ||
                        item.player_name ||
                        'Игрок'
                      }}
                    </div>
                    <div class="mt-1 text-sm text-slate-500">
                      {{ item.email || item.player_account_id || '—' }}
                    </div>
                  </td>
                  <td>{{ formatDate(item.created_at || item.registered_at) }}</td>
                  <td>
                    <span :class="badgeClass(item.status)">
                      {{ item.status || 'unknown' }}
                    </span>
                  </td>
                  <td>{{ item.reward_name || item.reward || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </section>
</template>
