<template>
  <div class="min-h-screen bg-base-200">
    <div class="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 class="text-3xl font-black tracking-tight">Социальный хаб</h1>
        <p class="mt-2 text-base-content/70">Подписчики, подписки и друзья.</p>
      </div>

      <div v-if="error" class="alert alert-error rounded-2xl shadow-lg">
        <span>{{ error }}</span>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <div class="card rounded-[2rem] bg-base-100 shadow-xl border border-base-300">
          <div class="card-body">
            <h2 class="card-title">Подписчики</h2>
            <div v-if="loading" class="space-y-3">
              <div class="skeleton h-16 rounded-2xl"></div>
              <div class="skeleton h-16 rounded-2xl"></div>
            </div>
            <div v-else class="space-y-3">
              <RouterLink
                v-for="item in followers.items"
                :key="`followers-${item.slug}`"
                :to="`/u/${item.slug}`"
                class="flex items-center justify-between rounded-2xl bg-base-200 p-3 transition hover:bg-base-300"
              >
                <div>
                  <div class="font-bold">{{ item.display_name || item.minecraft_nickname }}</div>
                  <div class="text-sm text-base-content/60">@{{ item.slug }}</div>
                </div>
                <span v-if="item.is_friend" class="badge badge-success">Друг</span>
              </RouterLink>
              <div v-if="!followers.items.length" class="rounded-2xl bg-base-200 p-4 text-sm text-base-content/65">Пока пусто.</div>
            </div>
          </div>
        </div>

        <div class="card rounded-[2rem] bg-base-100 shadow-xl border border-base-300">
          <div class="card-body">
            <h2 class="card-title">Подписки</h2>
            <div v-if="loading" class="space-y-3">
              <div class="skeleton h-16 rounded-2xl"></div>
              <div class="skeleton h-16 rounded-2xl"></div>
            </div>
            <div v-else class="space-y-3">
              <RouterLink
                v-for="item in following.items"
                :key="`following-${item.slug}`"
                :to="`/u/${item.slug}`"
                class="flex items-center justify-between rounded-2xl bg-base-200 p-3 transition hover:bg-base-300"
              >
                <div>
                  <div class="font-bold">{{ item.display_name || item.minecraft_nickname }}</div>
                  <div class="text-sm text-base-content/60">@{{ item.slug }}</div>
                </div>
                <span v-if="item.is_friend" class="badge badge-success">Друг</span>
              </RouterLink>
              <div v-if="!following.items.length" class="rounded-2xl bg-base-200 p-4 text-sm text-base-content/65">Пока пусто.</div>
            </div>
          </div>
        </div>

        <div class="card rounded-[2rem] bg-base-100 shadow-xl border border-base-300">
          <div class="card-body">
            <h2 class="card-title">Друзья</h2>
            <div v-if="loading" class="space-y-3">
              <div class="skeleton h-16 rounded-2xl"></div>
              <div class="skeleton h-16 rounded-2xl"></div>
            </div>
            <div v-else class="space-y-3">
              <RouterLink
                v-for="item in friends.items"
                :key="`friends-${item.slug}`"
                :to="`/u/${item.slug}`"
                class="flex items-center justify-between rounded-2xl bg-base-200 p-3 transition hover:bg-base-300"
              >
                <div>
                  <div class="font-bold">{{ item.display_name || item.minecraft_nickname }}</div>
                  <div class="text-sm text-base-content/60">@{{ item.slug }}</div>
                </div>
                <span class="badge badge-success">Друг</span>
              </RouterLink>
              <div v-if="!friends.items.length" class="rounded-2xl bg-base-200 p-4 text-sm text-base-content/65">Пока пусто.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getMyFollowers, getMyFollowing, getMyFriends } from '../services/socialApi'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const followers = ref({ total: 0, items: [] })
const following = ref({ total: 0, items: [] })
const friends = ref({ total: 0, items: [] })

async function loadSocial() {
  loading.value = true
  error.value = ''

  try {
    const [followersPayload, followingPayload, friendsPayload] = await Promise.all([
      getMyFollowers(authStore.accessToken),
      getMyFollowing(authStore.accessToken),
      getMyFriends(authStore.accessToken),
    ])

    followers.value = followersPayload || { total: 0, items: [] }
    following.value = followingPayload || { total: 0, items: [] }
    friends.value = friendsPayload || { total: 0, items: [] }
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить социальный блок.'
  } finally {
    loading.value = false
  }
}

onMounted(loadSocial)
</script>