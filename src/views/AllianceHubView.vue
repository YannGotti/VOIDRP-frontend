<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
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
import { toastError, toastSuccess } from '../services/toast'
import { useAuthStore } from '../stores/authStore'
import { formatNumber, formatRoleLabel } from '../utils/formatters'

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
  payload_json: '{\n  "field": "allow_trade_bonus",\n  "value": true\n}',
})

const policyForm = reactive({
  transfer_fee_percent: 5,
  allow_internal_transfers: true,
  allow_joint_defense: true,
  allow_trade_bonus: false,
  allow_pvp_protection: false,
})

const transferForm = reactive({
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

function proposalTypeLabel(value) {
  switch (String(value || '').toLowerCase()) {
    case 'set_policy':
      return 'Изменение правил'
    case 'treasury_transfer':
      return 'Перевод средств'
    case 'add_member':
      return 'Принятие государства'
    case 'remove_member':
      return 'Исключение государства'
    default:
      return 'Решение союза'
  }
}

const hasNation = computed(() => Boolean(myNation.value?.slug))
const canManageNation = computed(() => Boolean(myNation.value?.viewer_can_manage))
const currentAllianceSummary = computed(() => myNation.value?.alliance_summary || null)
const currentAllianceSlug = computed(() => currentAllianceSummary.value?.slug || '')
const myNationBalance = computed(() => Number(myNation.value?.stats?.treasury_balance || 0))
const myNationPower = computed(() => {
  const prestige = Number(myNation.value?.stats?.prestige_score || 0)
  const territory = Number(myNation.value?.stats?.territory_points || 0)
  return prestige + territory
})
const selectedViewer = computed(() => selectedAlliance.value?.viewer || {})
const selectedAllianceMembers = computed(() => selectedAlliance.value?.members || [])
const selectedAllianceBenefits = computed(() => {
  const alliance = selectedAlliance.value || {}
  return [
    alliance.allow_internal_transfers ? 'Есть переводы между союзниками' : null,
    alliance.allow_joint_defense ? 'Действует совместная оборона' : null,
    alliance.allow_trade_bonus ? 'Работают торговые бонусы' : null,
    alliance.allow_pvp_protection ? 'Есть защита между союзниками' : null,
  ].filter(Boolean)
})
const roleText = computed(() => formatRoleLabel(myNation.value?.viewer_role))

const canCreateAlliance = computed(() => hasNation.value && canManageNation.value && !currentAllianceSummary.value)
const canJoinSelectedAlliance = computed(() => Boolean(selectedViewer.value?.can_join))
const canLeaveSelectedAlliance = computed(() => Boolean(selectedViewer.value?.can_leave))
const canManagePolicies = computed(() => Boolean(selectedViewer.value?.can_manage_policies))
const canCreateProposal = computed(() => Boolean(selectedViewer.value?.can_create_proposals))
const canVote = computed(() => Boolean(selectedViewer.value?.can_vote))
const canTransferWithinAlliance = computed(() => Boolean(selectedViewer.value?.can_transfer))
const canManageNationTreasury = computed(() => hasNation.value && canManageNation.value)
const isReadOnlyNationMember = computed(() => hasNation.value && !canManageNation.value)
const showLeaderPanel = computed(() => (
  canManagePolicies.value
  || canCreateProposal.value
  || canVote.value
  || canTransferWithinAlliance.value
  || canManageNationTreasury.value
  || canLeaveSelectedAlliance.value
))

const allianceCards = computed(() => {
  return alliances.value.map((item) => {
    const viewer = item?.viewer || {}
    return {
      ...item,
      statusText:
        viewer.is_member
          ? 'Текущее государство уже состоит здесь'
          : viewer.can_join
            ? 'Можно вступить от имени государства'
            : !hasNation.value
              ? 'Сначала нужно государство'
              : canManageNation.value
                ? 'Вступление сейчас недоступно'
                : 'Управление альянсами скрыто для обычных участников',
      isMine: Boolean(viewer.is_member),
      canJoin: Boolean(viewer.can_join),
      isSelected: item.slug === selectedAlliance.value?.slug,
    }
  })
})

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
  const payload = await getAlliances(auth.accessToken || null)
  alliances.value = payload?.items || []
}

function applyAllianceToForms(alliance) {
  if (!alliance) return
  policyForm.transfer_fee_percent = Number(alliance.transfer_fee_percent ?? 5)
  policyForm.allow_internal_transfers = Boolean(alliance.allow_internal_transfers)
  policyForm.allow_joint_defense = Boolean(alliance.allow_joint_defense)
  policyForm.allow_trade_bonus = Boolean(alliance.allow_trade_bonus)
  policyForm.allow_pvp_protection = Boolean(alliance.allow_pvp_protection)

  if (!transferForm.to_nation_slug && Array.isArray(alliance.members)) {
    const firstOther = alliance.members.find((item) => item.nation?.slug !== myNation.value?.slug)
    transferForm.to_nation_slug = firstOther?.nation?.slug || ''
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
    if (selectedAlliance.value?.slug && showLeaderPanel.value) {
      const alliancePayload = await getAllianceTransactions(selectedAlliance.value.slug, auth.accessToken || null)
      allianceTransactions.value = alliancePayload?.items || []
    } else {
      allianceTransactions.value = []
    }

    if (myNation.value?.slug && showLeaderPanel.value) {
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
    setMessage('error', 'Создание альянса сейчас недоступно.')
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
    setMessage('error', 'Вступление в альянс недоступно.')
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
  if (!canLeaveSelectedAlliance.value) {
    setMessage('error', 'Выход из альянса недоступен.')
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
    setMessage('error', 'Изменение правил доступно только основателю альянса.')
    return
  }
  actionLoading.value = true
  try {
    await updateAlliancePolicies(auth.accessToken, selectedAlliance.value.slug, { ...policyForm })
    setMessage('success', 'Правила союза обновлены.')
    await openAlliance(selectedAlliance.value.slug)
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось обновить правила.')
  } finally {
    actionLoading.value = false
  }
}

async function submitProposal() {
  if (!canCreateProposal.value || !selectedAlliance.value?.slug) {
    setMessage('error', 'Создание решений недоступно.')
    return
  }
  actionLoading.value = true
  try {
    let payloadJson = {}
    try {
      payloadJson = proposalForm.payload_json?.trim() ? JSON.parse(proposalForm.payload_json) : {}
    } catch {
      setMessage('error', 'Поле с параметрами должно быть валидным JSON.')
      return
    }

    await createAllianceProposal(auth.accessToken, selectedAlliance.value.slug, {
      proposal_type: proposalForm.proposal_type,
      title: proposalForm.title,
      description: proposalForm.description || null,
      payload_json: payloadJson,
    })
    setMessage('success', 'Решение отправлено на голосование.')
    await loadProposals()
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось создать решение.')
  } finally {
    actionLoading.value = false
  }
}

async function handleVote({ id, vote }) {
  if (!canVote.value) {
    setMessage('error', 'Голосование недоступно.')
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
  if (!canTransferWithinAlliance.value || !selectedAlliance.value?.slug || !myNation.value?.slug) {
    setMessage('error', 'Перевод внутри альянса недоступен.')
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
    setMessage('success', 'Казна государства пополнена.')
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
    setMessage('success', 'Средства списаны из казны государства.')
    await Promise.all([loadMyNation(), loadTreasury()])
  } catch (err) {
    setMessage('error', err?.message || 'Не удалось списать средства.')
  } finally {
    actionLoading.value = false
  }
}

onMounted(loadPage)
watch(error, (value) => { if (value) toastError(value) })
watch(success, (value) => { if (value) toastSuccess(value) })
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="section-kicker !mb-2">Альянсы</div>
            <h1 class="text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
              Союзы государств
            </h1>
            <p class="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-[15px]">
              Здесь показываются сами союзы, состав участников и последние решения. Служебные настройки и финансовые действия открываются только тем, кто реально управляет государством.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3" v-if="myNation">
            <div class="metric-card text-center">
              <p class="metric-value !text-[1.05rem]">{{ myNation.title }}</p>
              <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Твоё государство</p>
            </div>
            <div class="metric-card text-center">
              <p class="metric-value !text-[1.05rem]">{{ formatNumber(myNationBalance) }}</p>
              <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Казна</p>
            </div>
            <div class="metric-card text-center">
              <p class="metric-value !text-[1.05rem]">{{ roleText }}</p>
              <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Роль</p>
            </div>
          </div>
        </div>
      </section>

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
            <div class="section-kicker !mb-2">Твой статус</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Что тебе доступно</h2>

            <div v-if="!hasNation" class="action-card mt-5 text-sm text-slate-400">
              Ты пока не состоишь в государстве. Сейчас тебе доступен только просмотр союзов и их состава.
            </div>

            <div v-else class="mt-5 space-y-3">
              <div class="action-card">
                <p class="metric-label">Государство</p>
                <p class="mt-2 text-sm font-semibold text-slate-100">{{ myNation.title }}</p>
              </div>

              <div class="action-card">
                <p class="metric-label">Текущий союз</p>
                <p class="mt-2 text-sm font-semibold text-slate-100">
                  {{ currentAllianceSummary?.title || 'Сейчас без альянса' }}
                </p>
                <p v-if="currentAllianceSummary?.tag" class="mt-1 text-sm leading-6 text-slate-400">
                  [{{ currentAllianceSummary.tag }}] · {{ allianceTypeLabel(currentAllianceSummary.alliance_type) }}
                </p>
              </div>

              <div class="action-card text-sm text-slate-300">
                <template v-if="canManageNation">
                  У тебя есть права управления от имени государства. Поэтому при выборе нужного альянса откроется панель лидера.
                </template>
                <template v-else>
                  Ты обычный участник государства. Для тебя здесь остаётся только понятный обзор без лишних настроек и форм.
                </template>
              </div>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Создание</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Новый союз</h2>

            <div v-if="!hasNation" class="action-card mt-5 text-sm text-slate-400">
              Сначала нужно создать государство или вступить в существующее.
            </div>

            <div v-else-if="isReadOnlyNationMember" class="action-card mt-5 text-sm text-slate-400">
              Создавать союзы могут только лидер или офицер государства.
            </div>

            <div v-else-if="!canCreateAlliance" class="mt-5 space-y-3">
              <div class="action-card text-sm text-slate-400">
                Новый союз сейчас создать нельзя: либо государство уже состоит в альянсе, либо пока не хватает силы.
              </div>
              <div class="metric-grid metric-grid-2">
                <div class="metric-card text-center">
                  <p class="metric-value !text-[1.1rem]">{{ formatNumber(myNationPower) }}</p>
                  <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Текущая сила</p>
                </div>
                <div class="metric-card text-center">
                  <p class="metric-value !text-[1.1rem]">50 000</p>
                  <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Порог создания</p>
                </div>
              </div>
            </div>

            <div v-else class="mt-5 grid gap-3">
              <label>
                <span class="field-label">Адрес союза</span>
                <input v-model="createForm.slug" class="input" />
              </label>
              <label>
                <span class="field-label">Название союза</span>
                <input v-model="createForm.title" class="input" />
              </label>
              <label>
                <span class="field-label">Тег</span>
                <input v-model="createForm.tag" class="input" />
              </label>
              <label>
                <span class="field-label">Тип союза</span>
                <select v-model="createForm.alliance_type" class="input">
                  <option value="un">Политический союз</option>
                  <option value="nato">Военный союз</option>
                  <option value="economic">Экономический союз</option>
                </select>
              </label>
              <label>
                <span class="field-label">Короткое описание</span>
                <textarea v-model="createForm.description" class="textarea textarea-bordered min-h-[110px] w-full"></textarea>
              </label>
              <button type="button" class="btn btn-primary" :disabled="actionLoading" @click="submitCreateAlliance">
                Создать союз
              </button>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Список</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Доступные союзы</h2>

            <div v-if="!allianceCards.length" class="action-card mt-5 text-sm text-slate-400">
              Альянсов пока нет.
            </div>

            <div v-else class="mt-5 space-y-3">
              <article v-for="item in allianceCards" :key="item.id" class="action-card">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-100">{{ item.title }}</p>
                    <p class="mt-2 text-sm leading-6 text-slate-400">[{{ item.tag }}] · {{ allianceTypeLabel(item.alliance_type) }}</p>
                    <p class="mt-2 text-sm leading-6 text-slate-500">{{ item.statusText }}</p>
                  </div>

                  <div class="mt-3 flex flex-wrap gap-2">
                    <button type="button" class="btn btn-outline btn-sm" :disabled="actionLoading" @click="openAlliance(item.slug)">
                      Открыть
                    </button>

                    <span v-if="item.isMine" class="footer-chip">
                      Ваш союз
                    </span>

                    <button
                      v-else-if="item.canJoin && item.isSelected"
                      type="button"
                      class="btn btn-primary btn-sm"
                      :disabled="actionLoading"
                      @click="submitJoinAlliance(item.slug)"
                    >
                      Вступить от имени государства
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>

        <div class="space-y-4">
          <AllianceRelationsPanel
            :alliance="selectedAlliance"
            :loading="loading && !selectedAlliance"
            :editable="canManagePolicies"
          />

          <section v-if="selectedAlliance && !showLeaderPanel" class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Режим просмотра</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Без служебных блоков</h2>
            <div class="action-card mt-5 text-sm text-slate-300">
              Здесь оставлен только обзор союза и последние решения. Настройки, переводы и формы управления скрыты, потому что они нужны только тем, кто управляет государством или самим альянсом.
            </div>
          </section>

          <AllianceProposalFeed
            :items="proposals"
            :loading="proposalsLoading"
            :can-vote="canVote"
            :voting-disabled="actionLoading"
            @vote="handleVote"
          />

          <section v-if="showLeaderPanel && selectedAlliance" class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Панель лидера</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Управление альянсом</h2>
            <p class="mt-3 text-sm leading-6 text-slate-400">
              Этот блок видят только те, у кого есть реальные права от имени государства или самого альянса.
            </p>

            <div class="mt-5 space-y-5">
              <div v-if="canLeaveSelectedAlliance" class="action-card">
                <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p class="font-semibold text-slate-100">Выход из союза</p>
                    <p class="mt-2 text-sm leading-6 text-slate-400">
                      Действие выполняется от имени государства и сразу меняет состав альянса.
                    </p>
                  </div>
                  <button type="button" class="btn btn-outline" :disabled="actionLoading" @click="submitLeaveAlliance">
                    Покинуть альянс
                  </button>
                </div>
              </div>

              <div v-if="canManagePolicies" class="action-card">
                <p class="font-semibold text-slate-100">Правила союза</p>
                <div class="mt-4 grid gap-3">
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
                    Сохранить правила
                  </button>
                </div>
              </div>

              <div v-if="canTransferWithinAlliance || canManageNationTreasury" class="grid gap-4 xl:grid-cols-2">
                <div class="space-y-4">
                  <div v-if="canTransferWithinAlliance" class="action-card">
                    <p class="font-semibold text-slate-100">Перевод внутри союза</p>
                    <div class="mt-4 grid gap-3">
                      <label>
                        <span class="field-label">Отправитель</span>
                        <input :value="myNation?.slug || ''" class="input" disabled />
                      </label>
                      <label>
                        <span class="field-label">Получатель</span>
                        <select v-model="transferForm.to_nation_slug" class="input">
                          <option value="">Выбери государство</option>
                          <option
                            v-for="member in selectedAllianceMembers"
                            :key="member.nation.id"
                            :value="member.nation.slug"
                            :disabled="member.nation.slug === myNation?.slug"
                          >
                            {{ member.nation.title }}
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
                      <button type="button" class="btn btn-primary" :disabled="actionLoading" @click="submitTransfer">
                        Выполнить перевод
                      </button>
                    </div>
                  </div>

                  <div v-if="canManageNationTreasury" class="action-card">
                    <p class="font-semibold text-slate-100">Казна государства</p>
                    <div class="mt-4 grid gap-3">
                      <label>
                        <span class="field-label">Пополнение</span>
                        <input v-model="nationTreasuryForm.deposit_amount" type="number" class="input" />
                      </label>
                      <input v-model="nationTreasuryForm.deposit_comment" class="input" placeholder="Комментарий к пополнению" />
                      <button type="button" class="btn btn-outline" :disabled="actionLoading" @click="submitNationDeposit">
                        Пополнить казну
                      </button>

                      <label>
                        <span class="field-label">Списание</span>
                        <input v-model="nationTreasuryForm.withdraw_amount" type="number" class="input" />
                      </label>
                      <input v-model="nationTreasuryForm.withdraw_comment" class="input" placeholder="Комментарий к списанию" />
                      <button type="button" class="btn btn-outline" :disabled="actionLoading" @click="submitNationWithdraw">
                        Списать средства
                      </button>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="action-card">
                    <p class="font-semibold text-slate-100">Операции альянса</p>
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
                    <p class="font-semibold text-slate-100">Операции государства</p>
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

              <div v-if="canCreateProposal" class="action-card">
                <p class="font-semibold text-slate-100">Новое решение союза</p>
                <div class="mt-4 grid gap-3">
                  <label>
                    <span class="field-label">Тип решения</span>
                    <select v-model="proposalForm.proposal_type" class="input">
                      <option value="set_policy">{{ proposalTypeLabel('set_policy') }}</option>
                      <option value="treasury_transfer">{{ proposalTypeLabel('treasury_transfer') }}</option>
                      <option value="add_member">{{ proposalTypeLabel('add_member') }}</option>
                      <option value="remove_member">{{ proposalTypeLabel('remove_member') }}</option>
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
                    <span class="field-label">Параметры решения (JSON)</span>
                    <textarea v-model="proposalForm.payload_json" class="textarea textarea-bordered min-h-[130px] w-full font-mono text-sm"></textarea>
                  </label>
                  <button type="button" class="btn btn-primary" :disabled="actionLoading" @click="submitProposal">
                    Отправить на голосование
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section v-if="selectedAlliance && selectedAllianceBenefits.length" class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Коротко</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Что сейчас активно</h2>
            <div class="mt-4 flex flex-wrap gap-2">
              <span v-for="benefit in selectedAllianceBenefits" :key="benefit" class="footer-chip">{{ benefit }}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>
