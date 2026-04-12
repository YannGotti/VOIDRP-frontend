<script setup>
import { onMounted, reactive, ref } from 'vue'
import AllianceProposalFeed from '../features/alliances/components/AllianceProposalFeed.vue'
import AllianceRelationsPanel from '../features/alliances/components/AllianceRelationsPanel.vue'
import {
  createAlliance,
  createAllianceProposal,
  getAllianceBySlug,
  getAllianceProposals,
  getAlliances,
  joinAlliance,
  transferAllianceFunds,
  updateAlliancePolicies,
  voteAllianceProposal,
} from '../services/alliancesApi'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()

const loading = ref(true)
const proposalsLoading = ref(false)
const error = ref('')
const success = ref('')
const alliances = ref([])
const selectedAlliance = ref(null)
const proposals = ref([])

const createForm = reactive({
  slug: '',
  title: '',
  tag: '',
  alliance_type: 'un',
  description: '',
})

const proposalForm = reactive({
  proposal_type: 'set_policy',
  title: '',
  description: '',
  payload_json: '{}',
})

const policyForm = reactive({
  transfer_fee_percent: 5,
  allow_internal_transfers: true,
  allow_joint_defense: true,
  allow_trade_bonus: false,
  allow_pvp_protection: false,
})

const transferForm = reactive({
  from_nation_slug: '',
  to_nation_slug: '',
  amount: 1000,
})

async function loadAlliances() {
  loading.value = true
  error.value = ''
  try {
    const payload = await getAlliances(auth.accessToken || null)
    alliances.value = payload?.items || []
    if (!selectedAlliance.value && alliances.value.length) {
      await openAlliance(alliances.value[0].slug)
    }
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить альянсы.'
  } finally {
    loading.value = false
  }
}

async function openAlliance(slug) {
  error.value = ''
  try {
    selectedAlliance.value = await getAllianceBySlug(slug, auth.accessToken || null)
    await loadProposals(slug)
  } catch (err) {
    error.value = err.message || 'Не удалось открыть альянс.'
  }
}

async function loadProposals(slug) {
  proposalsLoading.value = true
  try {
    const payload = await getAllianceProposals(slug, auth.accessToken || null)
    proposals.value = payload?.items || []
  } catch {
    proposals.value = []
  } finally {
    proposalsLoading.value = false
  }
}

async function submitCreateAlliance() {
  error.value = ''
  success.value = ''
  try {
    const payload = await createAlliance(auth.accessToken, createForm)
    success.value = 'Альянс создан.'
    await loadAlliances()
    await openAlliance(payload.slug)
  } catch (err) {
    error.value = err.message || 'Не удалось создать альянс.'
  }
}

async function submitJoinAlliance(slug) {
  error.value = ''
  success.value = ''
  try {
    await joinAlliance(auth.accessToken, slug)
    success.value = 'Государство вступило в альянс.'
    await loadAlliances()
    await openAlliance(slug)
  } catch (err) {
    error.value = err.message || 'Не удалось вступить в альянс.'
  }
}

async function submitPolicies() {
  if (!selectedAlliance.value) return
  error.value = ''
  success.value = ''
  try {
    selectedAlliance.value = await updateAlliancePolicies(auth.accessToken, selectedAlliance.value.slug, policyForm)
    success.value = 'Политики альянса обновлены.'
  } catch (err) {
    error.value = err.message || 'Не удалось обновить политики.'
  }
}

async function submitProposal() {
  if (!selectedAlliance.value) return
  error.value = ''
  success.value = ''
  try {
    await createAllianceProposal(auth.accessToken, selectedAlliance.value.slug, {
      proposal_type: proposalForm.proposal_type,
      title: proposalForm.title,
      description: proposalForm.description || null,
      payload_json: JSON.parse(proposalForm.payload_json || '{}'),
    })
    success.value = 'Предложение создано.'
    await loadProposals(selectedAlliance.value.slug)
  } catch (err) {
    error.value = err.message || 'Не удалось создать предложение.'
  }
}

async function handleVote({ proposalId, vote }) {
  error.value = ''
  success.value = ''
  try {
    await voteAllianceProposal(auth.accessToken, proposalId, { vote })
    success.value = 'Голос отправлен.'
    if (selectedAlliance.value) {
      await loadProposals(selectedAlliance.value.slug)
    }
  } catch (err) {
    error.value = err.message || 'Не удалось отправить голос.'
  }
}

async function submitTransfer() {
  if (!selectedAlliance.value) return
  error.value = ''
  success.value = ''
  try {
    await transferAllianceFunds(auth.accessToken, selectedAlliance.value.slug, transferForm)
    success.value = 'Перевод внутри альянса выполнен.'
    selectedAlliance.value = await getAllianceBySlug(selectedAlliance.value.slug, auth.accessToken || null)
  } catch (err) {
    error.value = err.message || 'Не удалось выполнить перевод.'
  }
}

onMounted(loadAlliances)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="section-kicker !mb-2">Альянсы</div>
        <h1 class="text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
          Надгосударственные блоки
        </h1>
        <p class="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-[15px]">
          Альянсы по духу ближе к ООН, НАТО и экономическим союзам: общие политики,
          голосования, вето и внутренние переводы между странами-участниками.
        </p>
      </section>

      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>

      <div class="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside class="space-y-5">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Создание</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Новый альянс</h2>

            <div class="mt-5 grid gap-3">
              <input v-model="createForm.slug" class="input" placeholder="slug" />
              <input v-model="createForm.title" class="input" placeholder="Название" />
              <input v-model="createForm.tag" class="input" placeholder="Тег" />
              <select v-model="createForm.alliance_type" class="select">
                <option value="un">UN</option>
                <option value="nato">NATO</option>
                <option value="economic">Economic</option>
              </select>
              <textarea v-model="createForm.description" class="textarea" rows="4" placeholder="Описание"></textarea>
              <button type="button" class="btn btn-primary" @click="submitCreateAlliance">Создать альянс</button>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Список</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Доступные альянсы</h2>

            <div v-if="loading" class="mt-5 space-y-3">
              <div class="skeleton h-20 rounded-[22px]"></div>
              <div class="skeleton h-20 rounded-[22px]"></div>
            </div>

            <div v-else class="mt-5 space-y-3">
              <div v-for="item in alliances" :key="item.id" class="action-card">
                <p class="font-semibold text-slate-100">{{ item.title }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-400">[{{ item.tag }}] · {{ item.alliance_type }}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button type="button" class="btn btn-outline btn-sm" @click="openAlliance(item.slug)">Открыть</button>
                  <button type="button" class="btn btn-primary btn-sm" @click="submitJoinAlliance(item.slug)">Вступить</button>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <div class="space-y-5">
          <AllianceRelationsPanel :alliance="selectedAlliance" :loading="loading" />

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Политики</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Настройка альянса</h2>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <label class="form-control">
                <span class="mb-2 text-sm font-semibold text-slate-300">Комиссия перевода (%)</span>
                <input v-model="policyForm.transfer_fee_percent" type="number" class="input" />
              </label>

              <label class="panel-card flex items-center justify-between gap-4 p-4">
                <span class="text-sm font-semibold text-slate-100">Внутренние переводы</span>
                <input v-model="policyForm.allow_internal_transfers" type="checkbox" class="toggle" />
              </label>

              <label class="panel-card flex items-center justify-between gap-4 p-4">
                <span class="text-sm font-semibold text-slate-100">Совместная защита</span>
                <input v-model="policyForm.allow_joint_defense" type="checkbox" class="toggle" />
              </label>

              <label class="panel-card flex items-center justify-between gap-4 p-4">
                <span class="text-sm font-semibold text-slate-100">Торговый бонус</span>
                <input v-model="policyForm.allow_trade_bonus" type="checkbox" class="toggle" />
              </label>

              <label class="panel-card flex items-center justify-between gap-4 p-4">
                <span class="text-sm font-semibold text-slate-100">PvP защита</span>
                <input v-model="policyForm.allow_pvp_protection" type="checkbox" class="toggle" />
              </label>
            </div>

            <button type="button" class="btn btn-primary mt-5" @click="submitPolicies">
              Сохранить политики
            </button>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Предложение</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Создать голосование</h2>

            <div class="mt-5 grid gap-3">
              <select v-model="proposalForm.proposal_type" class="select">
                <option value="set_policy">Политика</option>
                <option value="add_member">Добавить участника</option>
                <option value="remove_member">Убрать участника</option>
                <option value="treasury_transfer">Перевод казны</option>
              </select>
              <input v-model="proposalForm.title" class="input" placeholder="Название предложения" />
              <textarea v-model="proposalForm.description" class="textarea" rows="3" placeholder="Описание"></textarea>
              <textarea v-model="proposalForm.payload_json" class="textarea" rows="5" placeholder='{"key":"value"}'></textarea>
              <button type="button" class="btn btn-primary" @click="submitProposal">Создать предложение</button>
            </div>
          </section>

          <AllianceProposalFeed :items="proposals" :loading="proposalsLoading" @vote="handleVote" />

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Переводы</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Межгосударственные переводы</h2>

            <div class="mt-5 grid gap-3 sm:grid-cols-3">
              <input v-model="transferForm.from_nation_slug" class="input" placeholder="from nation slug" />
              <input v-model="transferForm.to_nation_slug" class="input" placeholder="to nation slug" />
              <input v-model="transferForm.amount" type="number" class="input" placeholder="amount" />
            </div>

            <button type="button" class="btn btn-primary mt-4" @click="submitTransfer">Выполнить перевод</button>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>
