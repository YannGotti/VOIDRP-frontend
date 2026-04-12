<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  title: { type: String, default: 'Последние события' },
  subtitle: { type: String, default: 'Жизнь государства в одном журнале.' },
  compact: { type: Boolean, default: false },
})

function formatActor(entry, key = 'actor') {
  const value = entry?.[key]
  if (!value) return 'Система'
  return value.minecraft_nickname || value.site_login || 'Игрок'
}

function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function buildFallback(entry) {
  const actor = formatActor(entry, 'actor')
  const target = formatActor(entry, 'target')
  switch (entry?.event_type) {
    case 'nation_created': return `${actor} создал государство.`
    case 'nation_updated': return `${actor} обновил настройки государства.`
    case 'join_requested': return `${actor} подал заявку на вступление.`
    case 'join_approved': return `${actor} одобрил заявку игрока ${target}.`
    case 'join_rejected': return `${actor} отклонил заявку игрока ${target}.`
    case 'member_joined': return `${target} вступил в государство.`
    case 'member_left': return `${target} покинул государство.`
    case 'member_removed': return `${actor} исключил игрока ${target}.`
    case 'member_role_updated': return `${actor} изменил роль игрока ${target}.`
    case 'leadership_transferred': return `${actor} передал лидерство игроку ${target}.`
    case 'asset_updated': return `${actor} обновил оформление государства.`
    case 'asset_deleted': return `${actor} удалил элемент оформления.`
    default: return entry?.message || 'Событие зафиксировано.'
  }
}

const normalizedItems = computed(() => props.items.map((entry) => ({
  ...entry,
  renderedMessage: entry?.message || buildFallback(entry),
  renderedTime: formatTime(entry?.created_at),
})))
</script>

<template>
  <section class="surface-card p-4 md:p-5">
    <div class="section-kicker !mb-2">Журнал</div>
    <h2 class="text-lg font-black text-slate-50 md:text-xl">{{ title }}</h2>
    <p class="mt-2 text-sm leading-6 text-slate-400">{{ subtitle }}</p>

    <div v-if="loading" class="mt-4 space-y-3">
      <div class="skeleton h-20 rounded-2xl"></div>
      <div class="skeleton h-20 rounded-2xl"></div>
      <div class="skeleton h-20 rounded-2xl"></div>
    </div>

    <div v-else-if="!normalizedItems.length" class="action-card mt-4 text-sm text-slate-400">
      Пока нет событий. После вступлений, изменений ролей и обновлений оформления журнал начнёт наполняться.
    </div>

    <div v-else class="mt-4 space-y-3">
      <article
        v-for="item in normalizedItems"
        :key="item.id"
        class="action-card"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold leading-6 text-slate-100">{{ item.renderedMessage }}</p>
            <p v-if="item.metadata && Object.keys(item.metadata).length" class="mt-2 text-xs leading-5 text-slate-500">
              {{ item.event_type }}
            </p>
          </div>
          <div class="shrink-0 text-right">
            <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{{ item.event_type }}</p>
            <p class="mt-2 text-xs text-slate-400">{{ item.renderedTime }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
