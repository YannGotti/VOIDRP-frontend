<script setup>
import { computed } from 'vue'

const props = defineProps({
  alliance: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  editable: { type: Boolean, default: false },
})

function allianceTypeLabel(value) {
  switch (String(value || '').toLowerCase()) {
    case 'nato':
      return 'Военный союз'
    case 'economic':
      return 'Экономический союз'
    case 'un':
      return 'Политический союз'
    default:
      return 'Союз государств'
  }
}

function memberRoleLabel(value) {
  switch (String(value || '').toLowerCase()) {
    case 'founder':
      return 'Основатель'
    case 'member':
      return 'Участник'
    default:
      return 'Участник'
  }
}

const overviewItems = computed(() => {
  const alliance = props.alliance || {}
  return [
    { label: 'Тип союза', value: allianceTypeLabel(alliance.alliance_type) },
    { label: 'Государств в составе', value: String(alliance.members_count ?? alliance.members?.length ?? 0) },
    { label: 'Казна союза', value: String(alliance.treasury_balance ?? 0) },
    { label: 'Порог для создания', value: String(alliance.min_power_required ?? 0) },
  ]
})

const publicRules = computed(() => {
  const alliance = props.alliance || {}
  return [
    {
      title: 'Переводы между союзниками',
      value: alliance.allow_internal_transfers ? 'Разрешены' : 'Отключены',
      description: alliance.allow_internal_transfers
        ? 'Государства внутри союза могут переводить средства друг другу.'
        : 'Переводы между государствами внутри союза сейчас отключены.',
    },
    {
      title: 'Совместная оборона',
      value: alliance.allow_joint_defense ? 'Включена' : 'Отключена',
      description: alliance.allow_joint_defense
        ? 'Союз рассчитан на взаимную поддержку участников.'
        : 'Этот союз не делает упор на совместную оборону.',
    },
    {
      title: 'Торговые бонусы',
      value: alliance.allow_trade_bonus ? 'Активны' : 'Не используются',
      description: alliance.allow_trade_bonus
        ? 'Внутри союза действуют торговые послабления и бонусы.'
        : 'Дополнительных торговых бонусов сейчас нет.',
    },
    {
      title: 'Защита между союзниками',
      value: alliance.allow_pvp_protection ? 'Активна' : 'Отключена',
      description: alliance.allow_pvp_protection
        ? 'Союз ограничивает враждебные действия между участниками.'
        : 'Отдельной защиты между союзниками сейчас нет.',
    },
  ]
})

const managementRules = computed(() => {
  const alliance = props.alliance || {}
  return [
    { label: 'Внутренние переводы', value: alliance.allow_internal_transfers ? 'Разрешены' : 'Отключены' },
    { label: 'Совместная защита', value: alliance.allow_joint_defense ? 'Активна' : 'Отключена' },
    { label: 'Торговый бонус', value: alliance.allow_trade_bonus ? 'Активен' : 'Отключён' },
    { label: 'PvP защита', value: alliance.allow_pvp_protection ? 'Активна' : 'Отключена' },
    { label: 'Комиссия перевода', value: `${alliance.transfer_fee_percent ?? 0}%` },
  ]
})
</script>

<template>
  <section class="surface-card p-5 md:p-6">
    <div class="section-kicker !mb-2">Альянс</div>
    <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
      {{ editable ? 'Правила и состав' : 'О союзе' }}
    </h2>

    <div v-if="loading" class="mt-5 space-y-3">
      <div class="skeleton h-24 rounded-[24px]"></div>
      <div class="skeleton h-24 rounded-[24px]"></div>
    </div>

    <div v-else-if="!alliance" class="action-card mt-5 text-sm text-slate-400">
      Альянс пока не выбран.
    </div>

    <div v-else class="mt-5 space-y-5">
      <div class="action-card">
        <p class="text-lg font-black text-slate-50">{{ alliance.title }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-400">
          [{{ alliance.tag }}] · {{ allianceTypeLabel(alliance.alliance_type) }}
        </p>
        <p class="mt-3 text-sm leading-6 text-slate-300">
          {{ alliance.description || 'Описание альянса пока не заполнено.' }}
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="item in overviewItems" :key="item.label" class="metric-card">
          <p class="metric-label">{{ item.label }}</p>
          <p class="mt-3 text-sm font-semibold text-slate-100">{{ item.value }}</p>
        </div>
      </div>

      <div>
        <div class="section-kicker !mb-2">Что даёт союз</div>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
          <div v-for="item in publicRules" :key="item.title" class="action-card">
            <div class="flex items-start justify-between gap-3">
              <p class="font-semibold text-slate-100">{{ item.title }}</p>
              <span class="footer-chip">{{ item.value }}</span>
            </div>
            <p class="mt-3 text-sm leading-6 text-slate-400">{{ item.description }}</p>
          </div>
        </div>
      </div>

      <div v-if="editable">
        <div class="section-kicker !mb-2">Служебные параметры</div>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div v-for="item in managementRules" :key="item.label" class="metric-card">
            <p class="metric-label">{{ item.label }}</p>
            <p class="mt-3 text-sm font-semibold text-slate-100">{{ item.value }}</p>
          </div>
        </div>
      </div>

      <div>
        <div class="section-kicker !mb-2">Государства в составе</div>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div v-for="member in alliance.members || []" :key="member.id" class="action-card">
            <p class="font-semibold text-slate-100">{{ member.nation?.title || member.nation?.slug }}</p>
            <p class="mt-2 text-sm leading-6 text-slate-400">[{{ member.nation?.tag }}]</p>
            <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {{ memberRoleLabel(member.role) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
