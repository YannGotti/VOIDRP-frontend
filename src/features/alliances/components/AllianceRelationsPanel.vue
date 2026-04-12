<script setup>
import { computed } from 'vue'

const props = defineProps({
  alliance: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  editable: { type: Boolean, default: false },
})

const policyItems = computed(() => {
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
      Политики и участники
    </h2>

    <div v-if="loading" class="mt-5 space-y-3">
      <div class="skeleton h-24 rounded-[24px]"></div>
      <div class="skeleton h-24 rounded-[24px]"></div>
    </div>

    <div v-else-if="!alliance" class="action-card mt-5 text-sm text-slate-400">
      Альянс пока не выбран.
    </div>

    <div v-else class="mt-5 space-y-5">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div v-for="item in policyItems" :key="item.label" class="metric-card">
          <p class="metric-label">{{ item.label }}</p>
          <p class="mt-3 text-sm font-semibold text-slate-100">{{ item.value }}</p>
        </div>
      </div>

      <div>
        <div class="section-kicker !mb-2">Государства-участники</div>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div v-for="member in alliance.members || []" :key="member.id" class="action-card">
            <p class="font-semibold text-slate-100">{{ member.nation?.title || member.nation?.slug }}</p>
            <p class="mt-2 text-sm leading-6 text-slate-400">[{{ member.nation?.tag }}]</p>
            <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {{ member.role }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
