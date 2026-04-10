<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getMyNation, getNationsList } from '../services/nationsApi'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const loading = ref(true)
const error = ref('')
const nations = ref({ total: 0, items: [] })
const myNation = ref(null)

const emptyText = computed(() => auth.isAuthenticated.value
  ? 'Пока государств нет. Можно стать первым и создать своё.'
  : 'Войди в аккаунт, чтобы создать своё государство или отправить заявку.')

function recruitmentLabel(value) {
  if (value === 'open') return 'Свободное вступление'
  if (value === 'request') return 'По заявке'
  return 'Только по приглашению'
}

async function loadPage() {
  loading.value = true
  error.value = ''
  try {
    const [listPayload, myPayload] = await Promise.all([
      getNationsList(auth.accessToken || null),
      auth.isAuthenticated.value ? getMyNation(auth.accessToken) : Promise.resolve(null),
    ])
    nations.value = listPayload || { total: 0, items: [] }
    myNation.value = myPayload || null
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить государства.'
  } finally {
    loading.value = false
  }
}

onMounted(loadPage)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div class="section-kicker !mb-2">Государства</div>
            <h1 class="text-2xl font-black tracking-tight text-slate-950 md:text-4xl">Публичные страницы сообществ</h1>
            <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-[15px]">
              Здесь собраны государства игроков: красивые страницы, статус вступления и быстрый переход к управлению своим сообществом.
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <RouterLink v-if="auth.isAuthenticated.value" to="/nation/studio" class="btn btn-primary rounded-2xl">
              {{ myNation ? 'Управлять своим государством' : 'Создать государство' }}
            </RouterLink>
            <RouterLink v-else to="/login" class="btn btn-outline rounded-2xl">Войти</RouterLink>
          </div>
        </div>
      </section>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <section v-if="myNation" class="surface-card p-5 md:p-6">
        <div class="section-kicker !mb-2">Твоё государство</div>
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-xl font-black text-slate-950 md:text-2xl">{{ myNation.title }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">[{{ myNation.tag }}] · {{ myNation.short_description || 'Описание ещё не добавлено' }}</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <RouterLink :to="`/nation/${myNation.slug}`" class="btn btn-outline rounded-2xl">Открыть страницу</RouterLink>
            <RouterLink to="/nation/studio" class="btn btn-primary rounded-2xl">Редактировать</RouterLink>
          </div>
        </div>
      </section>

      <div v-if="loading" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div class="skeleton h-[260px] rounded-[28px]"></div>
        <div class="skeleton h-[260px] rounded-[28px]"></div>
        <div class="skeleton h-[260px] rounded-[28px]"></div>
      </div>

      <div v-else-if="!nations.items.length" class="surface-card p-6 text-sm leading-7 text-slate-600">{{ emptyText }}</div>

      <div v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="nation in nations.items" :key="nation.id" class="surface-card overflow-hidden p-0">
          <div
            class="h-40 bg-slate-950"
            :style="nation.assets.banner_url || nation.assets.banner_preview_url
              ? { backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.12), rgba(15,23,42,0.72)), url(${nation.assets.banner_url || nation.assets.banner_preview_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: `linear-gradient(135deg, ${nation.accent_color || '#6d5df6'}55, rgba(15,23,42,0.95) 58%, rgba(2,6,23,1))` }"
          ></div>

          <div class="px-5 pb-5">
            <div class="-mt-8 flex items-end gap-3">
              <div class="preview-avatar h-16 w-16 border-4 border-white bg-slate-100 shadow-sm">
                <img v-if="nation.assets.icon_url || nation.assets.icon_preview_url" :src="nation.assets.icon_url || nation.assets.icon_preview_url" alt="icon" class="h-full w-full object-cover" />
                <span v-else>{{ nation.tag.slice(0, 2).toUpperCase() }}</span>
              </div>

              <div class="min-w-0">
                <h2 class="truncate text-xl font-black text-slate-950">{{ nation.title }}</h2>
                <p class="mt-1 text-sm text-slate-500">[{{ nation.tag }}] · {{ recruitmentLabel(nation.recruitment_policy) }}</p>
              </div>
            </div>

            <p class="mt-4 text-sm leading-7 text-slate-600">{{ nation.short_description || 'Описание пока не добавлено.' }}</p>

            <div class="metric-grid metric-grid-2 mt-4">
              <div class="metric-card text-center">
                <p class="metric-value !text-[1.35rem]">{{ nation.stats.members_count }}</p>
                <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Участники</p>
              </div>
              <div class="metric-card text-center">
                <p class="metric-value !text-[1.35rem]">{{ nation.stats.pending_requests_count }}</p>
                <p class="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Заявки</p>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-3">
              <RouterLink :to="`/nation/${nation.slug}`" class="btn btn-primary rounded-2xl">Открыть</RouterLink>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
