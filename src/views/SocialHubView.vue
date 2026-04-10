<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AccountTabs from '../components/AccountTabs.vue'
import { getMyFollowers, getMyFollowing, getMyFriends } from '../services/socialApi'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()

const loading = ref(true)
const error = ref('')
const followers = ref({ items: [] })
const following = ref({ items: [] })
const friends = ref({ items: [] })

const counters = computed(() => [
  { label: 'Подписчики', value: followers.value?.items?.length || 0 },
  { label: 'Подписки', value: following.value?.items?.length || 0 },
  { label: 'Друзья', value: friends.value?.items?.length || 0 },
])

function initialFor(item) {
  const value = item?.display_name || item?.minecraft_nickname || item?.slug || 'U'
  return value.slice(0, 1).toUpperCase()
}

async function loadSocial() {
  loading.value = true
  error.value = ''

  try {
    const [followersResponse, followingResponse, friendsResponse] = await Promise.all([
      getMyFollowers(auth.accessToken),
      getMyFollowing(auth.accessToken),
      getMyFriends(auth.accessToken),
    ])

    followers.value = followersResponse || { items: [] }
    following.value = followingResponse || { items: [] }
    friends.value = friendsResponse || { items: [] }
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить социальный блок.'
  } finally {
    loading.value = false
  }
}

onMounted(loadSocial)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="section-kicker !mb-2">Социальный хаб</div>
        <h1 class="text-2xl font-black tracking-tight text-slate-950 md:text-4xl">
          Подписчики, подписки и друзья
        </h1>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-[15px]">
          Вынесено в отдельный раздел, чтобы основной кабинет не захламлялся и оставался удобным для игрока.
        </p>
      </section>

      <AccountTabs />

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <div class="metric-grid metric-grid-3">
        <div v-for="item in counters" :key="item.label" class="metric-card text-center">
          <p class="metric-value">{{ item.value }}</p>
          <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{{ item.label }}</p>
        </div>
      </div>

      <div class="grid gap-5 xl:grid-cols-3">
        <section class="surface-card p-5 md:p-6">
          <div class="flex items-end justify-between gap-3">
            <div>
              <div class="section-kicker !mb-2">Подписчики</div>
              <h2 class="text-xl font-black text-slate-950">Кто подписан на тебя</h2>
            </div>
          </div>

          <div v-if="loading" class="mt-5 space-y-3">
            <div class="skeleton h-18 rounded-2xl"></div>
            <div class="skeleton h-18 rounded-2xl"></div>
          </div>

          <div v-else class="mt-5 space-y-3">
            <RouterLink
              v-for="item in followers.items"
              :key="`followers-${item.slug}`"
              :to="`/u/${item.slug}`"
              class="action-card flex items-center justify-between gap-3 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div class="preview-avatar h-12 w-12 shrink-0 border border-slate-200 text-lg">{{ initialFor(item) }}</div>
                <div class="min-w-0">
                  <div class="truncate font-semibold text-slate-900">{{ item.display_name || item.minecraft_nickname || item.slug }}</div>
                  <div class="truncate text-sm text-slate-500">@{{ item.slug }}</div>
                </div>
              </div>
              <span v-if="item.is_friend" class="badge badge-success">Друг</span>
            </RouterLink>

            <div v-if="!followers.items.length" class="action-card text-sm text-slate-600">Пока пусто.</div>
          </div>
        </section>

        <section class="surface-card p-5 md:p-6">
          <div>
            <div class="section-kicker !mb-2">Подписки</div>
            <h2 class="text-xl font-black text-slate-950">На кого подписан ты</h2>
          </div>

          <div v-if="loading" class="mt-5 space-y-3">
            <div class="skeleton h-18 rounded-2xl"></div>
            <div class="skeleton h-18 rounded-2xl"></div>
          </div>

          <div v-else class="mt-5 space-y-3">
            <RouterLink
              v-for="item in following.items"
              :key="`following-${item.slug}`"
              :to="`/u/${item.slug}`"
              class="action-card flex items-center justify-between gap-3 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div class="preview-avatar h-12 w-12 shrink-0 border border-slate-200 text-lg">{{ initialFor(item) }}</div>
                <div class="min-w-0">
                  <div class="truncate font-semibold text-slate-900">{{ item.display_name || item.minecraft_nickname || item.slug }}</div>
                  <div class="truncate text-sm text-slate-500">@{{ item.slug }}</div>
                </div>
              </div>
              <span v-if="item.is_friend" class="badge badge-success">Друг</span>
            </RouterLink>

            <div v-if="!following.items.length" class="action-card text-sm text-slate-600">Пока пусто.</div>
          </div>
        </section>

        <section class="surface-card p-5 md:p-6">
          <div>
            <div class="section-kicker !mb-2">Друзья</div>
            <h2 class="text-xl font-black text-slate-950">Взаимные связи</h2>
          </div>

          <div v-if="loading" class="mt-5 space-y-3">
            <div class="skeleton h-18 rounded-2xl"></div>
            <div class="skeleton h-18 rounded-2xl"></div>
          </div>

          <div v-else class="mt-5 space-y-3">
            <RouterLink
              v-for="item in friends.items"
              :key="`friends-${item.slug}`"
              :to="`/u/${item.slug}`"
              class="action-card flex items-center justify-between gap-3 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div class="flex min-w-0 items-center gap-3">
                <div class="preview-avatar h-12 w-12 shrink-0 border border-slate-200 text-lg">{{ initialFor(item) }}</div>
                <div class="min-w-0">
                  <div class="truncate font-semibold text-slate-900">{{ item.display_name || item.minecraft_nickname || item.slug }}</div>
                  <div class="truncate text-sm text-slate-500">@{{ item.slug }}</div>
                </div>
              </div>
              <span class="badge badge-success">Друг</span>
            </RouterLink>

            <div v-if="!friends.items.length" class="action-card text-sm text-slate-600">Пока пусто.</div>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>
