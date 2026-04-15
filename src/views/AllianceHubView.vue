<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AllianceProposalFeed from '../features/alliances/components/AllianceProposalFeed.vue'
import AllianceRelationsPanel from '../features/alliances/components/AllianceRelationsPanel.vue'
import {
  createAlliance,
  createAllianceProposal,
  getAllianceBySlug,
  getAllianceProposals,
  getAllianceTransactions,
  getAlliances,
  joinAlliance,
  leaveAlliance,
  transferAllianceFunds,
  updateAlliancePolicies,
  voteAllianceProposal,
} from '../services/alliancesApi'
import { getMyNation } from '../services/nationsApi'
import { depositNationTreasury, getNationTreasuryTransactions, withdrawNationTreasury } from '../services/nationStatsApi'
import { useAuthStore } from '../stores/authStore'
import { formatNumber } from '../utils/formatters'

const auth = useAuthStore()

const loading = ref(true)
const actionLoading = ref(false)
const proposalsLoading = ref(false)
const treasuryLoading = ref(false)
const error = ref('')
const success = ref('')
const alliances = ref([])
const selectedAlliance = ref(null)
const proposals = ref([])
const allianceTransactions = ref([])
const nationTransactions = ref([])
const myNation = ref(null)

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
  comment: '',
})

const nationTreasuryForm = reactive({
  deposit_amount: 1000,
  deposit_comment: '',
  withdraw_amount: 1000,
  withdraw_comment: '',
})

const hasNation = computed(() => Boolean(myNation.value?.slug))
const currentAllianceSummary = computed(() => myNation.value?.alliance_summary || null)
const isInAlliance = computed(() => Boolean(currentAllianceSummary.value?.slug))
const currentAllianceSlug = computed(() => currentAllianceSummary.value?.slug || '')
const myNationBalance = computed(() => Number(myNation.value?.stats?.treasury_balance || 0))
const allianceMembers = computed(() => selectedAlliance.value?.members || [])
const selectedAllianceIsMine = computed(() => Boolean(selectedAlliance.value?.slug) && selectedAlliance.value?.slug === currentAllianceSlug.value)
const canCreateAlliance = computed(() => hasNation.value && !isInAlliance.value)
const canJoinSelectedAlliance = computed(() => hasNation.value && !isInAlliance.value && Boolean(selectedAlliance.value?.slug))
const canManagePolicies = computed(() => {
  if (!selectedAlliance.value || !myNation.value) return false
  return selectedAlliance.value.founder_nation_id === myNation.value.id
})
const canCreateProposal = computed(() => hasNation.value && selectedAllianceIsMine.value)
const canVote = computed(() => hasNation.value && selectedAllianceIsMine.value)
const canManageNationTreasury = computed(() => hasNation.value)

function setMessage(type, message) {
  if (type === 'error') {
    error.value = message
    success.value = ''
  } else {
    success.value = message
    error.value = ''
  }
}

function txLabel(item) {
  const type = String(item?.transaction_type || '').toLowerCase()
  if (type === 'player_donation') return `Донат игрока ${item?.metadata_json?.minecraft_nickname || ''}`.trim()
  if (type === 'deposit') return 'Пополнение казны'
  if (type === 'withdraw') return 'Списание из казны'
  if (type === 'alliance_transfer_out') return 'Перевод союзнику'
  if (type === 'alliance_transfer_in') return 'Перевод от союзника'
  if (type === 'alliance_fee_income') return 'Комиссия альянса'
  return item?.transaction_type || 'Операция'
}

async function loadMyNation() {
  try {
    myNation.value = await getMyNation(auth.accessToken)
  } catch {
    myNation.value = null
  }
}

async function loadAlliances() {
  alliances.value = (await getAlliances(auth.accessToken || null)) || []
  alliances.value = alliances.value?.items || alliances.value || []
}

function applyAllianceToForms(alliance) {
  if (!alliance) return
  policyForm.transfer_fee_percent = Number(alliance.transfer_fee_percent ?? 5)
  policyForm.allow_internal_transfers = Boolean(alliance.allow_internal_transfers)
  policyForm.allow_joint_defense = Boolean(alliance.allow_joint_defense)
  policyForm.allow_trade_bonus = Boolean(alliance.allow_trade_bonus)
  policyForm.allow_pvp_protection = Boolean(alliance.allow_pvp_protection)
  if (!transferForm.to_nation_slug && Array.isArray(alliance.members)) {
    const firstOther = alliance.members.find((item) => item.slug !== myNation.value?.slug)
    transferForm.to_nation_slug = firstOther?.slug || ''
  }
}

async function openAlliance(slug) {
  if (!slug) return
  selectedAlliance.value = await getAllianceBySlug(slug, auth.accessToken || null)
  applyAllianceToForms(selectedAlliance.value)
  await Promise.all([loadProposals(), loadTreasury()])
}

async function loadProposals() {
  if (!selectedAlliance.value?.slug) {
    proposals.value = []
    return
  }
  proposalsLoading.value = true
  try {
    const payload = await getAllianceProposals(selectedAlliance.value.slug, auth.accessToken || null)
    proposals.value = payload?.items || []
  } catch {
    proposals.value = []
  } finally {
    proposalsLoading.value = false
  }
}

async function loadTreasury() {
  treasuryLoading.value = true
  try {
    if (selectedAlliance.value?.slug) {
      const alliancePayload = await getAllianceTransactions(selectedAlliance.value.slug, auth.accessToken || null)
      allianceTransactions.value = alliancePayload?.items || []
    } else {
      allianceTransactions.value = []
    }

    if (myNation.value?.slug) {
      const nationPayload = await getNationTreasuryTransactions(myNation.value.slug, auth.accessToken || null)
      nationTransactions.value = nationPayload?.items || []
    } else {
      nationTransactions.value = []
    }
  } catch {
    allianceTransactions.value = []
    nationTransactions.value = []
  } finally {
    treasuryLoading.value = false
  }
}

async function loadPage() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await Promise.all([loadMyNation(), loadAlliances()])
    transferForm.from_nation_slug = myNation.value?.slug || ''
    if (currentAllianceSlug.value) {
      await openAlliance(currentAllianceSlug.value)
    } else if (alliances.value.length) {
      await openAlliance(alliances.value[0].slug)
    } else {
      selectedAlliance.value = null
      proposals.value = []
      allianceTransactions.value = []
      nationTransactions.value = []
    }
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось загрузить центр альянсов.')
  } finally {
    loading.value = false
  }
}

async function submitCreateAlliance() {
  if (!canCreateAlliance.value) {
    setMessage('error', 'Создание альянса недоступно: государство уже состоит в альянсе.')
    return
  }
  actionLoading.value = true
  try {
    await createAlliance(auth.accessToken, createForm)
    setMessage('success', 'Альянс создан.')
    await loadPage()
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось создать альянс.')
  } finally {
    actionLoading.value = false
  }
}

async function submitJoinAlliance(slug) {
  if (!canJoinSelectedAlliance.value || !slug) {
    setMessage('error', 'Вступление недоступно: государство уже состоит в альянсе.')
    return
  }
  actionLoading.value = true
  try {
    await joinAlliance(auth.accessToken, slug)
    setMessage('success', 'Государство вступило в альянс.')
    await loadPage()
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось вступить в альянс.')
  } finally {
    actionLoading.value = false
  }
}

async function submitLeaveAlliance() {
  if (!isInAlliance.value) {
    setMessage('error', 'Государство не состоит в альянсе.')
    return
  }
  actionLoading.value = true
  try {
    const payload = await leaveAlliance(auth.accessToken)
    setMessage('success', payload?.message || 'Государство вышло из альянса.')
    await loadPage()
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось выйти из альянса.')
  } finally {
    actionLoading.value = false
  }
}

async function submitPolicies() {
  if (!canManagePolicies.value || !selectedAlliance.value?.slug) {
    setMessage('error', 'Изменение политик доступно только основателю альянса.')
    return
  }
  actionLoading.value = true
  try {
    await updateAlliancePolicies(auth.accessToken, selectedAlliance.value.slug, { ...policyForm })
    setMessage('success', 'Политики обновлены.')
    await openAlliance(selectedAlliance.value.slug)
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось обновить политики.')
  } finally {
    actionLoading.value = false
  }
}

async function submitProposal() {
  if (!canCreateProposal.value || !selectedAlliance.value?.slug) {
    setMessage('error', 'Создание предложений доступно только члену выбранного альянса.')
    return
  }
  actionLoading.value = true
  try {
    let payloadJson = {}
    try {
      payloadJson = proposalForm.payload_json?.trim() ? JSON.parse(proposalForm.payload_json) : {}
    } catch {
      setMessage('error', 'payload_json должен быть валидным JSON.')
      return
    }

    await createAllianceProposal(auth.accessToken, selectedAlliance.value.slug, {
      proposal_type: proposalForm.proposal_type,
      title: proposalForm.title,
      description: proposalForm.description || null,
      payload_json: payloadJson,
    })
    setMessage('success', 'Предложение создано.')
    await loadProposals()
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось создать предложение.')
  } finally {
    actionLoading.value = false
  }
}

async function handleVote({ id, vote }) {
  if (!canVote.value) {
    setMessage('error', 'Голосование доступно только государству-участнику выбранного альянса.')
    return
  }
  actionLoading.value = true
  try {
    await voteAllianceProposal(auth.accessToken, id, { vote })
    setMessage('success', 'Голос учтён.')
    await Promise.all([loadProposals(), openAlliance(selectedAlliance.value.slug)])
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось отправить голос.')
  } finally {
    actionLoading.value = false
  }
}

async function submitTransfer() {
  if (!selectedAllianceIsMine.value || !selectedAlliance.value?.slug) {
    setMessage('error', 'Переводы доступны только для альянса, в котором состоит твоё государство.')
    return
  }
  actionLoading.value = true
  try {
    await transferAllianceFunds(auth.accessToken, selectedAlliance.value.slug, {
      from_nation_slug: myNation.value.slug,
      to_nation_slug: transferForm.to_nation_slug,
      amount: Number(transferForm.amount),
      comment: transferForm.comment || null,
    })
    setMessage('success', 'Перевод выполнен.')
    await Promise.all([loadTreasury(), loadMyNation(), openAlliance(selectedAlliance.value.slug)])
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось выполнить перевод.')
  } finally {
    actionLoading.value = false
  }
}

async function submitNationDeposit() {
  if (!canManageNationTreasury.value || !myNation.value?.slug) return
  actionLoading.value = true
  try {
    await depositNationTreasury(auth.accessToken, myNation.value.slug, {
      amount: Number(nationTreasuryForm.deposit_amount),
      comment: nationTreasuryForm.deposit_comment || null,
    })
    setMessage('success', 'Казна пополнена.')
    await Promise.all([loadMyNation(), loadTreasury()])
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось пополнить казну.')
  } finally {
    actionLoading.value = false
  }
}

async function submitNationWithdraw() {
  if (!canManageNationTreasury.value || !myNation.value?.slug) return
  actionLoading.value = true
  try {
    await withdrawNationTreasury(auth.accessToken, myNation.value.slug, {
      amount: Number(nationTreasuryForm.withdraw_amount),
      comment: nationTreasuryForm.withdraw_comment || null,
    })
    setMessage('success', 'Средства списаны из казны.')
    await Promise.all([loadMyNation(), loadTreasury()])
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось списать средства.')
  } finally {
    actionLoading.value = false
  }
}

onMounted(loadPage)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="section-kicker !mb-2">Альянсы</div>
            <h1 class="text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
              Центр альянсов
            </h1>
            <p class="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-[15px]">
              Управление надгосударственными блоками, голосованиями и межгосударственными переводами.
            </p>
          </div>

          <div v-if="myNation" class="grid gap-3 sm:grid-cols-2">
            <div class="metric-card text-center">
              <p class="metric-value !text-[1.15rem]">{{ myNation.title }}</p>
              <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Твоё государство</p>
            </div>
            <div class="metric-card text-center">
              <p class="metric-value !text-[1.15rem]">{{ formatNumber(myNationBalance) }}</p>
              <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Казна</p>
            </div>
          </div>
        </div>
      </section>

      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>

      <div v-if="loading" class="space-y-4">
        <div class="skeleton h-28 rounded-[28px]"></div>
        <div class="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div class="skeleton h-[520px] rounded-[28px]"></div>
          <div class="space-y-4">
            <div class="skeleton h-[260px] rounded-[28px]"></div>
            <div class="skeleton h-[320px] rounded-[28px]"></div>
          </div>
        </div>
      </div>

      <div v-else class="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div class="space-y-4">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Статус</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Текущее состояние</h2>

            <div v-if="!myNation" class="action-card mt-5 text-sm text-slate-400">
              Чтобы управлять альянсами, сначала нужно состоять в государстве.
            </div>

            <div v-else class="mt-5 space-y-3">
              <div class="action-card">
                <p class="metric-label">Государство</p>
                <p class="mt-2 text-sm font-semibold text-slate-100">{{ myNation.title }}</p>
              </div>

              <div class="action-card">
                <p class="metric-label">Альянс</p>
                <p class="mt-2 text-sm font-semibold text-slate-100">
                  {{ currentAllianceSummary?.title || 'Сейчас нет альянса' }}
                </p>
                <p v-if="currentAllianceSummary?.tag" class="mt-1 text-sm leading-6 text-slate-400">
                  [{{ currentAllianceSummary.tag }}]
                </p>
              </div>

              <button
                v-if="isInAlliance"
                type="button"
                class="btn btn-outline"
                :disabled="actionLoading"
                @click="submitLeaveAlliance"
              >
                Покинуть альянс
              </button>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Создание</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Новый альянс</h2>

            <div v-if="!hasNation" class="action-card mt-5 text-sm text-slate-400">
              Сначала нужно создать или вступить в государство.
            </div>

            <div v-else-if="!canCreateAlliance" class="action-card mt-5 text-sm text-slate-400">
              Создание нового альянса скрыто, потому что твоё государство уже состоит в альянсе.
            </div>

            <div v-else class="mt-5 grid gap-3">
              <label>
                <span class="field-label">Slug</span>
                <input v-model="createForm.slug" class="input" />
              </label>
              <label>
                <span class="field-label">Название</span>
                <input v-model="createForm.title" class="input" />
              </label>
              <label>
                <span class="field-label">Тег</span>
                <input v-model="createForm.tag" class="input" />
              </label>
              <label>
                <span class="field-label">Тип</span>
                <select v-model="createForm.alliance_type" class="input">
                  <option value="un">UN</option>
                  <option value="nato">NATO</option>
                  <option value="economic">Economic</option>
                </select>
              </label>
              <label>
                <span class="field-label">Описание</span>
                <textarea v-model="createForm.description" class="textarea textarea-bordered min-h-[110px] w-full"></textarea>
              </label>
              <button type="button" class="btn btn-primary" :disabled="actionLoading" @click="submitCreateAlliance">
                Создать альянс
              </button>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Список</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Доступные альянсы</h2>

            <div v-if="!alliances.length" class="action-card mt-5 text-sm text-slate-400">
              Альянсов пока нет.
            </div>

            <div v-else class="mt-5 space-y-3">
              <article v-for="item in alliances" :key="item.id" class="action-card">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-100">{{ item.title }}</p>
                    <p class="mt-2 text-sm leading-6 text-slate-400">[{{ item.tag }}] · {{ item.alliance_type }}</p>
                  </div>

                  <div class="mt-3 flex flex-wrap gap-2">
                    <button type="button" class="btn btn-outline btn-sm" :disabled="actionLoading" @click="openAlliance(item.slug)">
                      Открыть
                    </button>

                    <span v-if="currentAllianceSlug && item.slug === currentAllianceSlug" class="footer-chip">
                      Ваш альянс
                    </span>

                    <button
                      v-else-if="canJoinSelectedAlliance"
                      type="button"
                      class="btn btn-primary btn-sm"
                      :disabled="actionLoading || isInAlliance"
                      @click="submitJoinAlliance(item.slug)"
                    >
                      Вступить
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>

        <div class="space-y-4">
          <AllianceRelationsPanel :alliance="selectedAlliance" :loading="loading && !selectedAlliance" />

          <section v-if="selectedAlliance" class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Политики</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Настройка альянса</h2>

            <div v-if="!canManagePolicies" class="action-card mt-5 text-sm text-slate-400">
              Редактирование политик доступно только государству-основателю выбранного альянса.
            </div>

            <div v-else class="mt-5 grid gap-3">
              <label>
                <span class="field-label">Комиссия перевода (%)</span>
                <input v-model="policyForm.transfer_fee_percent" type="number" class="input" />
              </label>

              <label class="action-card flex items-center justify-between">
                <span class="text-sm font-semibold text-slate-100">Внутренние переводы</span>
                <input v-model="policyForm.allow_internal_transfers" type="checkbox" class="toggle" />
              </label>

              <label class="action-card flex items-center justify-between">
                <span class="text-sm font-semibold text-slate-100">Совместная защита</span>
                <input v-model="policyForm.allow_joint_defense" type="checkbox" class="toggle" />
              </label>

              <label class="action-card flex items-center justify-between">
                <span class="text-sm font-semibold text-slate-100">Торговый бонус</span>
                <input v-model="policyForm.allow_trade_bonus" type="checkbox" class="toggle" />
              </label>

              <label class="action-card flex items-center justify-between">
                <span class="text-sm font-semibold text-slate-100">PvP защита</span>
                <input v-model="policyForm.allow_pvp_protection" type="checkbox" class="toggle" />
              </label>

              <button type="button" class="btn btn-primary" :disabled="actionLoading" @click="submitPolicies">
                Сохранить политики
              </button>
            </div>
          </section>

          <section v-if="selectedAlliance" class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Казна</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Переводы и treasury</h2>

            <div class="mt-5 grid gap-4 xl:grid-cols-2">
              <div class="space-y-3">
                <div class="action-card">
                  <p class="metric-label">Перевод внутри альянса</p>
                  <div class="mt-3 grid gap-3">
                    <label>
                      <span class="field-label">Откуда</span>
                      <input :value="myNation?.slug || ''" class="input" disabled />
                    </label>
                    <label>
                      <span class="field-label">Куда</span>
                      <select v-model="transferForm.to_nation_slug" class="input">
                        <option value="">Выбери государство</option>
                        <option v-for="member in allianceMembers" :key="member.nation_id" :value="member.slug" :disabled="member.slug === myNation?.slug">
                          {{ member.title }}
                        </option>
                      </select>
                    </label>
                    <label>
                      <span class="field-label">Сумма</span>
                      <input v-model="transferForm.amount" type="number" class="input" />
                    </label>
                    <label>
                      <span class="field-label">Комментарий</span>
                      <input v-model="transferForm.comment" class="input" />
                    </label>
                    <button type="button" class="btn btn-primary" :disabled="actionLoading || !selectedAllianceIsMine" @click="submitTransfer">
                      Выполнить перевод
                    </button>
                  </div>
                </div>

                <div class="action-card">
                  <p class="metric-label">Казна государства</p>
                  <div class="mt-3 grid gap-3">
                    <label>
                      <span class="field-label">Пополнение</span>
                      <input v-model="nationTreasuryForm.deposit_amount" type="number" class="input" />
                    </label>
                    <input v-model="nationTreasuryForm.deposit_comment" class="input" placeholder="Комментарий к пополнению" />
                    <button type="button" class="btn btn-outline" :disabled="actionLoading || !canManageNationTreasury" @click="submitNationDeposit">
                      Пополнить
                    </button>

                    <label>
                      <span class="field-label">Списание</span>
                      <input v-model="nationTreasuryForm.withdraw_amount" type="number" class="input" />
                    </label>
                    <input v-model="nationTreasuryForm.withdraw_comment" class="input" placeholder="Комментарий к списанию" />
                    <button type="button" class="btn btn-outline" :disabled="actionLoading || !canManageNationTreasury" @click="submitNationWithdraw">
                      Списать
                    </button>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <div class="action-card">
                  <p class="metric-label">Операции альянса</p>
                  <div v-if="treasuryLoading" class="mt-3 space-y-2">
                    <div class="skeleton h-16 rounded-2xl"></div>
                    <div class="skeleton h-16 rounded-2xl"></div>
                  </div>
                  <div v-else-if="!allianceTransactions.length" class="mt-3 text-sm text-slate-400">
                    Операций альянса пока нет.
                  </div>
                  <div v-else class="mt-3 space-y-2">
                    <div v-for="item in allianceTransactions.slice(0, 6)" :key="item.id" class="rounded-[18px] border border-white/10 bg-slate-950/30 px-4 py-3">
                      <div class="flex items-center justify-between gap-3">
                        <p class="text-sm font-semibold text-slate-100">{{ txLabel(item) }}</p>
                        <span class="footer-chip">{{ formatNumber(item.net_amount) }}</span>
                      </div>
                      <p class="mt-2 text-sm leading-6 text-slate-400">{{ item.comment || 'Без комментария.' }}</p>
                    </div>
                  </div>
                </div>

                <div class="action-card">
                  <p class="metric-label">Операции государства</p>
                  <div v-if="treasuryLoading" class="mt-3 space-y-2">
                    <div class="skeleton h-16 rounded-2xl"></div>
                    <div class="skeleton h-16 rounded-2xl"></div>
                  </div>
                  <div v-else-if="!nationTransactions.length" class="mt-3 text-sm text-slate-400">
                    Операций государства пока нет.
                  </div>
                  <div v-else class="mt-3 space-y-2">
                    <div v-for="item in nationTransactions.slice(0, 6)" :key="item.id" class="rounded-[18px] border border-white/10 bg-slate-950/30 px-4 py-3">
                      <div class="flex items-center justify-between gap-3">
                        <p class="text-sm font-semibold text-slate-100">{{ txLabel(item) }}</p>
                        <span class="footer-chip">{{ formatNumber(item.net_amount) }}</span>
                      </div>
                      <p class="mt-2 text-sm leading-6 text-slate-400">{{ item.comment || 'Без комментария.' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section v-if="selectedAlliance" class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Новое предложение</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Создать proposal</h2>

            <div v-if="!canCreateProposal" class="action-card mt-5 text-sm text-slate-400">
              Создание proposal доступно только участнику выбранного альянса.
            </div>

            <div v-else class="mt-5 grid gap-3">
              <label>
                <span class="field-label">Тип</span>
                <select v-model="proposalForm.proposal_type" class="input">
                  <option value="set_policy">set_policy</option>
                  <option value="treasury_transfer">treasury_transfer</option>
                  <option value="add_member">add_member</option>
                  <option value="remove_member">remove_member</option>
                </select>
              </label>
              <label>
                <span class="field-label">Заголовок</span>
                <input v-model="proposalForm.title" class="input" />
              </label>
              <label>
                <span class="field-label">Описание</span>
                <textarea v-model="proposalForm.description" class="textarea textarea-bordered min-h-[90px] w-full"></textarea>
              </label>
              <label>
                <span class="field-label">payload_json</span>
                <textarea v-model="proposalForm.payload_json" class="textarea textarea-bordered min-h-[130px] w-full font-mono text-sm"></textarea>
              </label>
              <button type="button" class="btn btn-primary" :disabled="actionLoading" @click="submitProposal">
                Создать proposal
              </button>
            </div>
          </section>

          <AllianceProposalFeed
            :items="proposals"
            :loading="proposalsLoading"
            :can-vote="canVote"
            :voting-disabled="actionLoading"
            @vote="handleVote"
          />
        </div>
      </div>
    </div>
  </section>
</template>
