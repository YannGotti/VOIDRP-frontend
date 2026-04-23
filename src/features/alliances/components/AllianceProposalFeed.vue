<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canVote: {
    type: Boolean,
    default: false,
  },
  votingDisabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['vote'])

function statusLabel(item) {
  const status = String(item?.status || '').toLowerCase()
  const executionStatus = String(item?.execution_status || '').toLowerCase()

  if (status === 'executed') return 'Исполнено'
  if (status === 'approved' && executionStatus === 'executed') return 'Исполнено'
  if (status === 'approved' && executionStatus === 'failed') return 'Одобрено, но не исполнено'
  if (status === 'approved') return 'Одобрено'
  if (status === 'rejected') return 'Отклонено'
  if (status === 'expired') return 'Закрыто'
  return 'Открыто'
}

function proposalTypeLabel(value) {
  switch (String(value || '').toLowerCase()) {
    case 'set_policy':
      return 'Изменение правил'
    case 'treasury_transfer':
      return 'Финансовый перевод'
    case 'add_member':
      return 'Принятие государства'
    case 'remove_member':
      return 'Исключение государства'
    default:
      return 'Решение союза'
  }
}

function canVoteForItem(item) {
  return props.canVote && !props.votingDisabled && String(item?.status || '').toLowerCase() === 'open'
}

function vote(id, value) {
  emit('vote', { id, vote: value })
}
</script>

<template>
  <section class="surface-card p-5 md:p-6">
    <div class="section-kicker !mb-2">Решения</div>
    <h2 class="text-xl font-black text-slate-50 md:text-2xl">Что обсуждает союз</h2>

    <div v-if="loading" class="mt-5 space-y-3">
      <div class="skeleton h-28 rounded-[22px]"></div>
      <div class="skeleton h-28 rounded-[22px]"></div>
    </div>

    <div v-else-if="!items.length" class="action-card mt-5 text-sm text-slate-400">
      Пока нет открытых или завершённых решений.
    </div>

    <div v-else class="mt-5 space-y-3">
      <article v-for="item in items" :key="item.id" class="action-card">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-semibold text-slate-100">{{ item.title }}</p>
            <p class="mt-2 text-sm leading-6 text-slate-400">
              {{ item.description || 'Подробное описание не добавлено.' }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <span class="footer-chip">{{ proposalTypeLabel(item.proposal_type) }}</span>
            <span class="footer-chip">{{ statusLabel(item) }}</span>
          </div>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-4">
          <div class="metric-card text-center">
            <p class="metric-value !text-[1.05rem]">{{ item.vote_summary?.yes ?? 0 }}</p>
            <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">За</p>
          </div>
          <div class="metric-card text-center">
            <p class="metric-value !text-[1.05rem]">{{ item.vote_summary?.no ?? 0 }}</p>
            <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Против</p>
          </div>
          <div class="metric-card text-center">
            <p class="metric-value !text-[1.05rem]">{{ item.vote_summary?.veto ?? 0 }}</p>
            <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Вето</p>
          </div>
          <div class="metric-card text-center">
            <p class="metric-value !text-[1.05rem]">{{ item.vote_summary?.total ?? 0 }}</p>
            <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Всего голосов</p>
          </div>
        </div>

        <div v-if="item.execution_status && item.execution_status !== 'pending'" class="mt-4 rounded-[18px] border border-white/10 bg-slate-950/40 px-4 py-3">
          <p class="text-sm font-semibold text-slate-100">
            Исполнение: {{ item.execution_status }}
          </p>
          <p v-if="item.execution_result" class="mt-2 text-sm leading-6 text-slate-400">
            {{ item.execution_result }}
          </p>
        </div>

        <div v-if="canVoteForItem(item)" class="mt-4 flex flex-wrap gap-2">
          <button type="button" class="btn btn-primary btn-sm" @click="vote(item.id, 'yes')">За</button>
          <button type="button" class="btn btn-outline btn-sm" @click="vote(item.id, 'no')">Против</button>
          <button type="button" class="btn btn-outline btn-sm" @click="vote(item.id, 'veto')">Вето</button>
        </div>
      </article>
    </div>
  </section>
</template>
