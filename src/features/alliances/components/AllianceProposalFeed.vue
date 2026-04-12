<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['vote'])

function sendVote(proposalId, vote) {
  emit('vote', { proposalId, vote })
}
</script>

<template>
  <section class="surface-card p-5 md:p-6">
    <div class="section-kicker !mb-2">Голосования</div>
    <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
      Предложения альянса
    </h2>

    <div v-if="loading" class="mt-5 space-y-3">
      <div class="skeleton h-28 rounded-[24px]"></div>
      <div class="skeleton h-28 rounded-[24px]"></div>
    </div>

    <div v-else-if="!items.length" class="action-card mt-5 text-sm text-slate-400">
      Предложений пока нет.
    </div>

    <div v-else class="mt-5 space-y-3">
      <div v-for="item in items" :key="item.id" class="action-card">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="font-semibold text-slate-100">{{ item.title }}</p>
            <p class="mt-2 text-sm leading-6 text-slate-400">{{ item.description || 'Описание не указано.' }}</p>
          </div>
          <span class="footer-chip">{{ item.status }}</span>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" class="btn btn-primary btn-sm" @click="sendVote(item.id, 'yes')">За</button>
          <button type="button" class="btn btn-outline btn-sm" @click="sendVote(item.id, 'no')">Против</button>
          <button type="button" class="btn btn-outline btn-sm" @click="sendVote(item.id, 'veto')">Вето</button>
        </div>
      </div>
    </div>
  </section>
</template>
