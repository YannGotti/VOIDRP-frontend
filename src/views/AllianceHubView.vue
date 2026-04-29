<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
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
import { toastError, toastSuccess } from '../services/toast'
import { useAuthStore } from '../stores/authStore'
import { formatNumber, formatRoleLabel } from '../utils/formatters'

const auth = useAuthStore()

const activeTab = ref('overview')

const loading = ref(true)
const detailLoading = ref(false)
const actionLoading = ref(false)
const proposalsLoading = ref(false)
const error = ref('')
const alliances = ref([])
const selectedSlug = ref('')
const selectedAlliance = ref(null)
const proposals = ref([])
const allianceTransactions = ref([])
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

const isAuthenticated = computed(() => auth.isAuthenticated.value)
const hasNation = computed(() => Boolean(myNation.value?.slug))
const canManageNation = computed(() => Boolean(myNation.value?.viewer_can_manage))
const selectedViewer = computed(() => selectedAlliance.value?.viewer || {})
const canJoinSelected = computed(() => Boolean(selectedViewer.value?.can_join))
const canLeaveSelected = computed(() => Boolean(selectedViewer.value?.can_leave))
const canManageAlliance = computed(() => Boolean(selectedViewer.value?.can_manage_alliance))
const canManagePolicies = computed(() => Boolean(selectedViewer.value?.can_manage_policies))
const canCreateProposals = computed(() => Boolean(selectedViewer.value?.can_create_proposals))
const canVote = computed(() => Boolean(selectedViewer.value?.can_vote))
const canTransfer = computed(() => Boolean(selectedViewer.value?.can_transfer))

const selectableAlliances = computed(() => Array.isArray(alliances.value) ? alliances.value : [])
const memberTargets = computed(() => {
  const members = Array.isArray(selectedAlliance.value?.members) ? selectedAlliance.value.members : []
  const sourceNationId = selectedViewer.value?.nation_id
  return members.map((m) => m?.nation).filter((n) => n?.slug && n?.id !== sourceNationId)
})

const myAllianceSlug = computed(() => myNation.value?.alliance_summary?.slug || '')

function allianceTypeLabel(value) {
  switch (String(value || '').toLowerCase()) {
    case 'nato': return 'Военный союз'
    case 'economic': return 'Экономический союз'
    case 'un': return 'Политический союз'
    default: return 'Союз государств'
  }
}

function txLabel(item) {
  const type = String(item?.transaction_type || '').toLowerCase()
  if (type === 'alliance_transfer_out') return 'Перевод союзнику'
  if (type === 'alliance_transfer_in') return 'От союзника'
  if (type === 'alliance_fee_income') return 'Комиссия союза'
  return 'Операция'
}

function money(value) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '0'
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n)
}

function hydratePolicyForm(alliance) {
  policyForm.transfer_fee_percent = Number(alliance?.transfer_fee_percent ?? 5)
  policyForm.allow_internal_transfers = Boolean(alliance?.allow_internal_transfers)
  policyForm.allow_joint_defense = Boolean(alliance?.allow_joint_defense)
  policyForm.allow_trade_bonus = Boolean(alliance?.allow_trade_bonus)
  policyForm.allow_pvp_protection = Boolean(alliance?.allow_pvp_protection)
}

async function loadMyNation() {
  if (!auth.accessToken) { myNation.value = null; return }
  try { myNation.value = await getMyNation(auth.accessToken) }
  catch { myNation.value = null }
}

async function loadAlliances() {
  const payload = await getAlliances(auth.accessToken || null)
  alliances.value = payload?.items || []
}

async function loadSelectedAlliance(slug) {
  if (!slug) { selectedAlliance.value = null; proposals.value = []; allianceTransactions.value = []; return }
  detailLoading.value = true
  try {
    const [alliance, proposalPayload, txPayload] = await Promise.all([
      getAllianceBySlug(slug, auth.accessToken || null),
      getAllianceProposals(slug, auth.accessToken || null),
      getAllianceTransactions(slug, auth.accessToken || null),
    ])
    selectedAlliance.value = alliance
    selectedSlug.value = alliance?.slug || slug
    proposals.value = proposalPayload?.items || []
    allianceTransactions.value = txPayload?.items || []
    hydratePolicyForm(alliance)
    if (!transferForm.to_nation_slug && memberTargets.value.length) {
      transferForm.to_nation_slug = memberTargets.value[0].slug
    }
  } catch (err) {
    selectedAlliance.value = null
    proposals.value = []
    allianceTransactions.value = []
    toastError(err?.message || 'Не удалось загрузить альянс.')
  } finally {
    detailLoading.value = false
  }
}

async function loadPage() {
  loading.value = true
  error.value = ''
  try {
    await Promise.all([loadMyNation(), loadAlliances()])
    const preferredSlug = myNation.value?.alliance_summary?.slug || selectableAlliances.value[0]?.slug || ''
    selectedSlug.value = preferredSlug
    await loadSelectedAlliance(preferredSlug)
  } catch (err) {
    error.value = err?.message || 'Не удалось загрузить раздел альянсов.'
  } finally {
    loading.value = false
  }
}

async function createAllianceAction() {
  actionLoading.value = true
  try {
    const created = await createAlliance(auth.accessToken, { ...createForm })
    toastSuccess('Альянс создан.')
    await loadAlliances()
    await loadMyNation()
    await loadSelectedAlliance(created?.slug || createForm.slug)
  } catch (err) {
    toastError(err?.message || 'Не удалось создать альянс.')
  } finally {
    actionLoading.value = false
  }
}

async function joinSelectedAlliance() {
  if (!selectedAlliance.value) return
  actionLoading.value = true
  try {
    await joinAlliance(auth.accessToken, selectedAlliance.value.slug)
    toastSuccess('Государство вступило в альянс.')
    await loadPage()
  } catch (err) {
    toastError(err?.message || 'Не удалось вступить в альянс.')
  } finally {
    actionLoading.value = false
  }
}

async function leaveSelectedAlliance() {
  actionLoading.value = true
  try {
    await leaveAlliance(auth.accessToken)
    toastSuccess('Государство вышло из альянса.')
    await loadPage()
  } catch (err) {
    toastError(err?.message || 'Не удалось выйти из альянса.')
  } finally {
    actionLoading.value = false
  }
}

async function savePolicies() {
  if (!selectedAlliance.value) return
  actionLoading.value = true
  try {
    const payload = await updateAlliancePolicies(auth.accessToken, selectedAlliance.value.slug, { ...policyForm })
    selectedAlliance.value = payload
    hydratePolicyForm(payload)
    toastSuccess('Правила союза обновлены.')
  } catch (err) {
    toastError(err?.message || 'Не удалось сохранить правила.')
  } finally {
    actionLoading.value = false
  }
}

async function createProposalAction() {
  if (!selectedAlliance.value) return
  actionLoading.value = true
  try {
    let payloadJson = {}
    try { payloadJson = proposalForm.payload_json?.trim() ? JSON.parse(proposalForm.payload_json) : {} }
    catch { throw new Error('Поле JSON заполнено неверно.') }
    await createAllianceProposal(auth.accessToken, selectedAlliance.value.slug, {
      proposal_type: proposalForm.proposal_type,
      title: proposalForm.title,
      description: proposalForm.description || null,
      payload_json: payloadJson,
    })
    toastSuccess('Предложение создано.')
    await loadSelectedAlliance(selectedAlliance.value.slug)
  } catch (err) {
    toastError(err?.message || 'Не удалось создать предложение.')
  } finally {
    actionLoading.value = false
  }
}

async function castVote({ id, vote }) {
  actionLoading.value = true
  try {
    await voteAllianceProposal(auth.accessToken, id, { vote })
    toastSuccess('Голос учтён.')
    if (selectedAlliance.value?.slug) await loadSelectedAlliance(selectedAlliance.value.slug)
  } catch (err) {
    toastError(err?.message || 'Не удалось сохранить голос.')
  } finally {
    actionLoading.value = false
  }
}

async function sendTransfer() {
  if (!selectedAlliance.value) return
  actionLoading.value = true
  try {
    await transferAllianceFunds(auth.accessToken, selectedAlliance.value.slug, {
      from_nation_slug: selectedViewer.value?.nation_slug,
      to_nation_slug: transferForm.to_nation_slug,
      amount: Number(transferForm.amount),
      comment: transferForm.comment || null,
    })
    toastSuccess('Перевод отправлен.')
    await loadSelectedAlliance(selectedAlliance.value.slug)
  } catch (err) {
    toastError(err?.message || 'Не удалось выполнить перевод.')
  } finally {
    actionLoading.value = false
  }
}

watch(selectedSlug, (value, oldValue) => {
  if (value && value !== oldValue) loadSelectedAlliance(value)
})

onMounted(loadPage)
</script>

<template>
  <section class="ah py-3 md:py-4">
    <div class="container-shell max-w-[1380px] space-y-3">

      <!-- header -->
      <header class="ah-header">
        <div>
          <p class="ah-eyebrow">Политика · VoidRP</p>
          <h1 class="ah-h1">Союзы государств</h1>
        </div>
        <div class="ah-header__actions">
          <RouterLink to="/nations" class="ah-link-btn">Государства</RouterLink>
          <RouterLink
            v-if="hasNation"
            :to="canManageNation ? '/nation/studio' : `/nation/${myNation.slug}`"
            class="ah-link-btn"
          >
            {{ canManageNation ? 'Управлять' : 'Моё государство' }}
          </RouterLink>
          <RouterLink v-else to="/nation/studio" class="ah-link-btn ah-link-btn--accent">Создать государство</RouterLink>
        </div>
      </header>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <!-- tabs -->
      <div class="ah-tabs">
        <button class="ah-tab" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">Обзор</button>
        <button class="ah-tab" :class="{ active: activeTab === 'proposals' }" @click="activeTab = 'proposals'">
          Предложения
          <span v-if="proposals.length" class="ah-tab__badge">{{ proposals.length }}</span>
        </button>
        <button class="ah-tab" :class="{ active: activeTab === 'manage' }" @click="activeTab = 'manage'">Управление</button>
      </div>

      <!-- loading -->
      <div v-if="loading" class="ah-grid">
        <div class="skeleton" style="height:400px;border-radius:18px"></div>
        <div class="skeleton" style="height:400px;border-radius:18px"></div>
      </div>

      <template v-else>

        <!-- ─── OVERVIEW ─── -->
        <div v-show="activeTab === 'overview'" class="ah-grid">

          <!-- sidebar: alliance list -->
          <aside class="ah-sidebar">
            <div class="surface-card ah-card">
              <h2 class="ah-card__title">Альянсы</h2>

              <div v-if="!selectableAlliances.length" class="ah-empty">Пока нет альянсов</div>

              <div v-else class="ah-alliance-list">
                <button
                  v-for="item in selectableAlliances"
                  :key="item.id"
                  type="button"
                  class="ah-alliance-item"
                  :class="{
                    active: selectedSlug === item.slug,
                    mine: myAllianceSlug === item.slug
                  }"
                  @click="selectedSlug = item.slug"
                >
                  <div class="ah-alliance-item__info">
                    <strong>{{ item.title }}</strong>
                    <small>[{{ item.tag }}] · {{ allianceTypeLabel(item.alliance_type) }}</small>
                  </div>
                  <span class="ah-alliance-item__count">{{ item.members_count ?? item.members?.length ?? 0 }}</span>
                </button>
              </div>

              <!-- my status -->
              <div v-if="hasNation" class="ah-status-block">
                <p class="ah-status-label">Твоё государство</p>
                <p class="ah-status-value">{{ myNation.title }}</p>
                <p v-if="myNation.alliance_summary" class="ah-status-meta">
                  В альянсе: {{ myNation.alliance_summary.title }} [{{ myNation.alliance_summary.tag }}]
                </p>
                <p v-else class="ah-status-meta">Не состоит в альянсе</p>

                <div v-if="selectedAlliance" class="ah-status-actions">
                  <button v-if="canJoinSelected" type="button" class="btn btn-primary btn-sm w-full" :disabled="actionLoading" @click="joinSelectedAlliance">
                    Вступить в альянс
                  </button>
                  <button v-if="canLeaveSelected" type="button" class="btn btn-outline btn-sm w-full" :disabled="actionLoading" @click="leaveSelectedAlliance">
                    Покинуть альянс
                  </button>
                </div>
              </div>
              <div v-else class="ah-empty">Создай государство, чтобы вступить в альянс.</div>
            </div>

            <!-- create alliance form (for nation leaders without alliance) -->
            <div v-if="isAuthenticated && hasNation && !myAllianceSlug && canManageNation" class="surface-card ah-card">
              <h2 class="ah-card__title">Создать альянс</h2>
              <div class="ah-form">
                <input v-model="createForm.title" class="input" placeholder="Название" />
                <div class="ah-form__row">
                  <input v-model="createForm.tag" class="input" placeholder="Тег" />
                  <input v-model="createForm.slug" class="input" placeholder="Slug" />
                </div>
                <select v-model="createForm.alliance_type" class="select">
                  <option value="un">Политический союз</option>
                  <option value="nato">Военный союз</option>
                  <option value="economic">Экономический союз</option>
                </select>
                <textarea v-model="createForm.description" class="textarea" rows="3" placeholder="Описание"></textarea>
                <button type="button" class="btn btn-primary w-full" :disabled="actionLoading" @click="createAllianceAction">
                  Создать
                </button>
              </div>
            </div>
          </aside>

          <!-- main: alliance detail -->
          <div>
            <AllianceRelationsPanel
              :alliance="selectedAlliance"
              :loading="detailLoading"
              :editable="canManageAlliance"
            />
          </div>
        </div>

        <!-- ─── PROPOSALS ─── -->
        <div v-show="activeTab === 'proposals'" class="ah-proposals-layout">
          <AllianceProposalFeed
            :items="proposals"
            :loading="proposalsLoading || detailLoading"
            :can-vote="canVote"
            :voting-disabled="actionLoading"
            @vote="castVote"
          />

          <div v-if="canCreateProposals" class="surface-card ah-card">
            <h2 class="ah-card__title">Новое предложение</h2>
            <div class="ah-form">
              <select v-model="proposalForm.proposal_type" class="select">
                <option value="set_policy">Изменение правил</option>
                <option value="transfer">Перевод средств</option>
                <option value="accept_member">Принятие участника</option>
                <option value="remove_member">Исключение участника</option>
              </select>
              <input v-model="proposalForm.title" class="input" placeholder="Заголовок" />
              <textarea v-model="proposalForm.description" class="textarea" rows="2" placeholder="Описание (необязательно)"></textarea>
              <textarea v-model="proposalForm.payload_json" class="textarea font-mono text-xs" rows="5" placeholder='{"field":"allow_trade_bonus","value":true}'></textarea>
              <button type="button" class="btn btn-primary w-full" :disabled="actionLoading" @click="createProposalAction">
                Создать предложение
              </button>
            </div>
          </div>
        </div>

        <!-- ─── MANAGE ─── -->
        <div v-show="activeTab === 'manage'" class="ah-manage-layout">
          <!-- transactions -->
          <div class="surface-card ah-card">
            <h2 class="ah-card__title">Операции казны</h2>
            <div v-if="detailLoading" class="ah-skeletons">
              <div v-for="i in 4" :key="i" class="skeleton" style="height:32px;border-radius:8px"></div>
            </div>
            <div v-else-if="!allianceTransactions.length" class="ah-empty">Операций пока нет</div>
            <ul v-else class="ah-tx-list">
              <li v-for="item in allianceTransactions.slice(0, 10)" :key="item.id">
                <div class="ah-tx-left">
                  <span>{{ txLabel(item) }}</span>
                  <small>{{ item.comment || '' }}</small>
                </div>
                <strong>{{ money(item.net_amount ?? item.amount ?? 0) }}</strong>
              </li>
            </ul>
          </div>

          <!-- sidebar: policies + transfer -->
          <aside class="ah-manage-sidebar">
            <div v-if="canManagePolicies" class="surface-card ah-card">
              <h2 class="ah-card__title">Правила союза</h2>
              <div class="ah-form">
                <label class="ah-toggle-row">
                  <input v-model="policyForm.allow_internal_transfers" type="checkbox" />
                  <span>Внутренние переводы</span>
                </label>
                <label class="ah-toggle-row">
                  <input v-model="policyForm.allow_joint_defense" type="checkbox" />
                  <span>Совместная оборона</span>
                </label>
                <label class="ah-toggle-row">
                  <input v-model="policyForm.allow_trade_bonus" type="checkbox" />
                  <span>Торговый бонус</span>
                </label>
                <label class="ah-toggle-row">
                  <input v-model="policyForm.allow_pvp_protection" type="checkbox" />
                  <span>PvP-защита</span>
                </label>
                <div class="ah-form__field">
                  <label class="ah-field-label">Комиссия %</label>
                  <input v-model="policyForm.transfer_fee_percent" type="number" min="0" step="0.1" class="input" />
                </div>
                <button type="button" class="btn btn-primary w-full" :disabled="actionLoading" @click="savePolicies">
                  Сохранить
                </button>
              </div>
            </div>

            <div v-if="canTransfer" class="surface-card ah-card">
              <h2 class="ah-card__title">Перевод союзнику</h2>
              <div class="ah-form">
                <select v-model="transferForm.to_nation_slug" class="select">
                  <option disabled value="">Выбрать государство</option>
                  <option v-for="nation in memberTargets" :key="nation.id" :value="nation.slug">
                    {{ nation.title }} [{{ nation.tag }}]
                  </option>
                </select>
                <input v-model="transferForm.amount" type="number" min="1" step="1" class="input" placeholder="Сумма" />
                <textarea v-model="transferForm.comment" class="textarea" rows="2" placeholder="Комментарий"></textarea>
                <button type="button" class="btn btn-primary w-full" :disabled="actionLoading || !transferForm.to_nation_slug" @click="sendTransfer">
                  Отправить
                </button>
              </div>
            </div>

            <div v-if="!canManageAlliance && selectedAlliance" class="surface-card ah-card ah-readonly">
              <p>Управляющие действия доступны лидерам и офицерам государства-участника.</p>
            </div>
          </aside>
        </div>

      </template>
    </div>
  </section>
</template>

<style scoped>
/* ─── Header ─── */
.ah-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.ah-eyebrow {
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin: 0 0 .15rem;
}

.ah-h1 {
  font-size: 1.5rem;
  font-weight: 900;
  color: #f8fbff;
  margin: 0;
  letter-spacing: -.03em;
}

.ah-header__actions {
  display: flex;
  gap: .4rem;
  flex-wrap: wrap;
}

.ah-link-btn {
  display: inline-flex;
  align-items: center;
  min-height: 2.35rem;
  padding: 0 .85rem;
  border-radius: 10px;
  border: 1px solid rgba(148,163,184,.14);
  background: rgba(6,10,19,.7);
  color: rgb(148 163 184);
  font-size: .875rem;
  font-weight: 700;
  transition: border-color .15s, color .15s;
}

.ah-link-btn:hover { border-color: rgba(148,163,184,.28); color: #fff; }
.ah-link-btn--accent { background: linear-gradient(135deg,#8b5cf6,#6366f1); color: #fff; border-color: transparent; }
.ah-link-btn--accent:hover { filter: brightness(1.06); color: #fff; }

/* ─── Tabs ─── */
.ah-tabs {
  display: flex;
  gap: .4rem;
  flex-wrap: wrap;
}

.ah-tab {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  border: 1px solid rgba(148,163,184,.12);
  border-radius: 999px;
  background: rgba(255,255,255,.04);
  color: rgb(148 163 184);
  padding: .42rem .9rem;
  font: inherit;
  font-size: .83rem;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s;
}

.ah-tab:hover { background: rgba(255,255,255,.07); color: #fff; }

.ah-tab.active {
  border-color: rgba(139,92,246,.3);
  background: rgba(139,92,246,.12);
  color: #fff;
}

.ah-tab__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: rgba(139,92,246,.3);
  color: rgb(196 181 253);
  font-size: .65rem;
  font-weight: 900;
  padding: 0 .3rem;
}

/* ─── Layouts ─── */
.ah-grid {
  display: grid;
  gap: .75rem;
}

@media (min-width: 1000px) {
  .ah-grid { grid-template-columns: 280px minmax(0, 1fr); }
}

.ah-proposals-layout {
  display: grid;
  gap: .75rem;
}

@media (min-width: 900px) {
  .ah-proposals-layout { grid-template-columns: minmax(0, 1fr) 320px; }
}

.ah-manage-layout {
  display: grid;
  gap: .75rem;
}

@media (min-width: 900px) {
  .ah-manage-layout { grid-template-columns: minmax(0, 1fr) 280px; }
}

.ah-sidebar { display: flex; flex-direction: column; gap: .75rem; }
.ah-manage-sidebar { display: flex; flex-direction: column; gap: .75rem; }

/* ─── Cards ─── */
.ah-card { padding: 1rem; }
.ah-card__title {
  font-size: .92rem;
  font-weight: 800;
  color: rgb(203 213 225);
  margin: 0 0 .75rem;
}

/* ─── Alliance list ─── */
.ah-alliance-list { display: flex; flex-direction: column; gap: .35rem; margin-bottom: .75rem; }

.ah-alliance-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 12px;
  background: rgba(255,255,255,.025);
  padding: .55rem .7rem;
  text-align: left;
  cursor: pointer;
  transition: background .12s, border-color .12s;
  width: 100%;
  font: inherit;
  color: inherit;
}

.ah-alliance-item:hover { background: rgba(255,255,255,.045); border-color: rgba(255,255,255,.1); }
.ah-alliance-item.active { border-color: rgba(139,92,246,.3); background: rgba(139,92,246,.08); }
.ah-alliance-item.mine { border-color: rgba(52,211,153,.2); }

.ah-alliance-item__info { min-width: 0; }

.ah-alliance-item__info strong {
  display: block;
  font-size: .85rem;
  font-weight: 700;
  color: rgb(226 232 240);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ah-alliance-item__info small {
  display: block;
  font-size: .72rem;
  color: rgb(100 116 139);
  margin-top: .05rem;
}

.ah-alliance-item__count {
  font-size: .72rem;
  font-weight: 700;
  color: rgb(100 116 139);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 999px;
  padding: .15rem .45rem;
  flex-shrink: 0;
}

/* ─── Status block ─── */
.ah-status-block {
  border-top: 1px solid rgba(255,255,255,.07);
  padding-top: .75rem;
}

.ah-status-label {
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgb(100 116 139);
  margin: 0 0 .25rem;
}

.ah-status-value {
  font-size: .92rem;
  font-weight: 700;
  color: rgb(226 232 240);
  margin: 0 0 .2rem;
}

.ah-status-meta {
  font-size: .78rem;
  color: rgb(100 116 139);
  margin: 0 0 .6rem;
}

.ah-status-actions { display: flex; flex-direction: column; gap: .4rem; }

/* ─── Forms ─── */
.ah-form { display: flex; flex-direction: column; gap: .5rem; }

.ah-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .5rem;
}

.ah-form__field { display: flex; flex-direction: column; gap: .35rem; }

.ah-field-label {
  font-size: .72rem;
  font-weight: 700;
  color: rgb(148 163 184);
}

.ah-toggle-row {
  display: flex;
  align-items: center;
  gap: .55rem;
  padding: .45rem .6rem;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 10px;
  background: rgba(255,255,255,.025);
  cursor: pointer;
  font-size: .83rem;
  color: rgb(203 213 225);
}

.ah-toggle-row input { accent-color: #8b5cf6; }

/* ─── Transactions ─── */
.ah-tx-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.ah-tx-list li {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .75rem;
  padding: .45rem 0;
  border-bottom: 1px solid rgba(255,255,255,.05);
}

.ah-tx-list li:last-child { border-bottom: none; }

.ah-tx-left { min-width: 0; }
.ah-tx-left span { display: block; font-size: .83rem; font-weight: 600; color: rgb(203 213 225); }
.ah-tx-left small { display: block; font-size: .72rem; color: rgb(100 116 139); margin-top: .05rem; }

.ah-tx-list li > strong {
  font-size: .83rem;
  font-weight: 700;
  color: rgb(226 232 240);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ─── Misc ─── */
.ah-empty {
  font-size: .83rem;
  color: rgb(100 116 139);
  padding: .25rem 0;
}

.ah-skeletons { display: grid; gap: .35rem; }

.ah-readonly {
  font-size: .83rem;
  color: rgb(100 116 139);
}
</style>
