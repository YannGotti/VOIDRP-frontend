<template>
  <div class="min-h-screen bg-base-200">
    <div class="mx-auto max-w-6xl px-4 py-8">
      <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-3xl font-black tracking-tight">Реферальный центр</h1>
          <p class="mt-2 text-base-content/70">
            Управляй кодом приглашения, смотри прогресс и текущий месячный ранг.
          </p>
        </div>
        <RouterLink to="/profile/public" class="btn btn-outline rounded-2xl">Публичный профиль</RouterLink>
      </div>

      <div v-if="loading" class="space-y-4">
        <div class="skeleton h-40 rounded-3xl"></div>
        <div class="skeleton h-72 rounded-3xl"></div>
      </div>

      <div v-else class="space-y-6">
        <div v-if="error" class="alert alert-error rounded-2xl shadow-lg">
          <span>{{ error }}</span>
        </div>

        <div v-if="success" class="alert alert-success rounded-2xl shadow-lg">
          <span>{{ success }}</span>
        </div>

        <section class="grid gap-6 lg:grid-cols-[1.3fr,.9fr]">
          <div class="card rounded-[2rem] bg-base-100 shadow-xl border border-base-300">
            <div class="card-body">
              <h2 class="card-title text-xl">Твой код</h2>
              <div class="rounded-[1.5rem] bg-base-200 p-5">
                <div class="text-sm text-base-content/60">Referral code</div>
                <div class="mt-2 break-all text-3xl font-black tracking-wider">{{ dashboard?.my_code.code || '—' }}</div>
                <div class="mt-4 text-sm text-base-content/65 break-all">{{ dashboard?.my_code.invite_url || '—' }}</div>
              </div>
              <div class="mt-4 flex flex-wrap gap-3">
                <button class="btn btn-primary rounded-2xl" @click="copyInviteUrl">Скопировать ссылку</button>
                <button class="btn btn-outline rounded-2xl" :disabled="regenerating" @click="regenerateCode">
                  <span v-if="regenerating" class="loading loading-spinner loading-sm"></span>
                  <span v-else>Сгенерировать новый код</span>
                </button>
              </div>
            </div>
          </div>

          <div class="card rounded-[2rem] bg-base-100 shadow-xl border border-base-300">
            <div class="card-body">
              <h2 class="card-title text-xl">Прогресс</h2>
              <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div class="rounded-[1.5rem] bg-base-200 p-4 text-center">
                  <div class="text-sm text-base-content/60">Pending</div>
                  <div class="mt-2 text-3xl font-black text-primary">{{ dashboard?.totals.pending || 0 }}</div>
                </div>
                <div class="rounded-[1.5rem] bg-base-200 p-4 text-center">
                  <div class="text-sm text-base-content/60">Qualified</div>
                  <div class="mt-2 text-3xl font-black text-secondary">{{ dashboard?.totals.qualified || 0 }}</div>
                </div>
                <div class="rounded-[1.5rem] bg-base-200 p-4 text-center">
                  <div class="text-sm text-base-content/60">Текущий ранг</div>
                  <div class="mt-2 text-xl font-black">{{ rankLabel }}</div>
                </div>
              </div>

              <div class="mt-4 rounded-[1.5rem] bg-base-200 p-4">
                <div class="text-sm text-base-content/60">Лестница рангов</div>
                <div class="mt-3 space-y-2 text-sm">
                  <div class="flex items-center justify-between rounded-xl bg-base-100 px-3 py-2">
                    <span>1 приглашённый</span>
                    <span class="font-bold">Ранг III</span>
                  </div>
                  <div class="flex items-center justify-between rounded-xl bg-base-100 px-3 py-2">
                    <span>5 приглашённых</span>
                    <span class="font-bold">Ранг II</span>
                  </div>
                  <div class="flex items-center justify-between rounded-xl bg-base-100 px-3 py-2">
                    <span>10 приглашённых</span>
                    <span class="font-bold">Ранг I</span>
                  </div>
                </div>
                <div v-if="dashboard?.current_reward?.expires_at" class="mt-4 text-sm text-base-content/65">
                  Действует до {{ formatDate(dashboard.current_reward.expires_at) }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="card rounded-[2rem] bg-base-100 shadow-xl border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-xl">Последние приглашения</h2>
            <div v-if="!dashboard?.recent_links?.length" class="rounded-[1.5rem] bg-base-200 p-6 text-base-content/65">
              Пока приглашений нет.
            </div>
            <div v-else class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Site login</th>
                    <th>Minecraft</th>
                    <th>Статус</th>
                    <th>Создано</th>
                    <th>Qualified</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in dashboard.recent_links" :key="`${item.site_login}-${item.created_at}`">
                    <td>{{ item.site_login }}</td>
                    <td>{{ item.minecraft_nickname }}</td>
                    <td>
                      <span class="badge" :class="badgeClass(item.status)">{{ item.status }}</span>
                    </td>
                    <td>{{ formatDate(item.created_at) }}</td>
                    <td>{{ item.qualified_at ? formatDate(item.qualified_at) : '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getMyReferralDashboard, regenerateMyReferralCode } from '../services/referralApi'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const loading = ref(true)
const regenerating = ref(false)
const error = ref('')
const success = ref('')
const dashboard = ref(null)

const rankLabel = computed(() => {
  const rank = dashboard.value?.current_reward?.referral_rank || dashboard.value?.totals?.current_rank
  if (rank === 'rank_1') return 'Ранг I'
  if (rank === 'rank_2') return 'Ранг II'
  if (rank === 'rank_3') return 'Ранг III'
  return 'Без ранга'
})

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('ru-RU')
}

function badgeClass(status) {
  if (status === 'qualified') return 'badge-success'
  if (status === 'pending') return 'badge-warning'
  return 'badge-ghost'
}

async function loadDashboard() {
  loading.value = true
  error.value = ''

  try {
    dashboard.value = await getMyReferralDashboard(authStore.accessToken)
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить реферальный кабинет.'
  } finally {
    loading.value = false
  }
}

async function regenerateCode() {
  regenerating.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = await regenerateMyReferralCode(authStore.accessToken)
    success.value = payload.message || 'Код обновлён.'
    await loadDashboard()
  } catch (err) {
    error.value = err.message || 'Не удалось обновить код.'
  } finally {
    regenerating.value = false
  }
}

async function copyInviteUrl() {
  try {
    await navigator.clipboard.writeText(dashboard.value?.my_code?.invite_url || '')
    success.value = 'Ссылка приглашения скопирована.'
  } catch {
    error.value = 'Не удалось скопировать ссылку.'
  }
}

onMounted(loadDashboard)
</script>