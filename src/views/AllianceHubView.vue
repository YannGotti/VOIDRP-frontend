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
  return members
    .map((member) => member?.nation)
    .filter((nation) => nation?.slug && nation?.id !== sourceNationId)
})

const currentMembershipCard = computed(() => {
  if (!hasNation.value) return null
  return {
    title: myNation.value?.title || 'Твоё государство',
    role: formatRoleLabel(myNation.value?.viewer_role),
    allianceTitle: myNation.value?.alliance_summary?.title || '',
    allianceTag: myNation.value?.alliance_summary?.tag || '',
  }
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

function txLabel(item) {
  const type = String(item?.transaction_type || '').toLowerCase()
  if (type === 'alliance_transfer_out') return 'Перевод союзнику'
  if (type === 'alliance_transfer_in') return 'Перевод от союзника'
  if (type === 'alliance_fee_income') return 'Комиссия союза'
  return 'Операция'
}

function hydratePolicyForm(alliance) {
  policyForm.transfer_fee_percent = Number(alliance?.transfer_fee_percent ?? 5)
  policyForm.allow_internal_transfers = Boolean(alliance?.allow_internal_transfers)
  policyForm.allow_joint_defense = Boolean(alliance?.allow_joint_defense)
  policyForm.allow_trade_bonus = Boolean(alliance?.allow_trade_bonus)
  policyForm.allow_pvp_protection = Boolean(alliance?.allow_pvp_protection)
}

async function loadMyNation() {
  if (!auth.accessToken) {
    myNation.value = null
    return
  }

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

async function loadSelectedAlliance(slug) {
  if (!slug) {
    selectedAlliance.value = null
    proposals.value = []
    allianceTransactions.value = []
    return
  }

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
    try {
      payloadJson = proposalForm.payload_json?.trim() ? JSON.parse(proposalForm.payload_json) : {}
    } catch {
      throw new Error('Поле JSON заполнено неверно.')
    }

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
    if (selectedAlliance.value?.slug) {
      await loadSelectedAlliance(selectedAlliance.value.slug)
    }
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
  if (value && value !== oldValue) {
    loadSelectedAlliance(value)
  }
})

onMounted(loadPage)
</script>

<template>
  <section class="py-5 md:py-6">
    <div class="container-shell max-w-[1380px] space-y-4">
      <section class="surface-card p-4 md:p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="section-kicker !mb-2">Альянсы</div>
            <h1 class="text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
              Союзы государств
            </h1>
            <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-400 md:text-[14px]">
              Для обычного игрока это обзор союзов и их состава. Для лидеров и офицеров — ещё и рабочая панель управления.
            </p>
          </div>

          <div class="grid gap-2.5 sm:grid-cols-2">
            <RouterLink to="/nations" class="btn btn-outline">К государствам</RouterLink>
            <RouterLink v-if="hasNation" :to="canManageNation ? '/nation/studio' : `/nation/${myNation.slug}`" class="btn btn-primary">
              {{ canManageNation ? 'Открыть своё государство' : 'Открыть страницу государства' }}
            </RouterLink>
            <RouterLink v-else to="/nation/studio" class="btn btn-primary">Создать государство</RouterLink>
          </div>
        </div>
      </section>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <div v-if="loading" class="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div class="skeleton h-[520px] rounded-[24px]"></div>
        <div class="skeleton h-[520px] rounded-[24px]"></div>
      </div>

      <div v-else class="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside class="space-y-4">
          <section class="surface-card p-4 md:p-5">
            <div class="section-kicker !mb-2">Каталог</div>
            <h2 class="text-xl font-black text-slate-50">Доступные союзы</h2>

            <div class="mt-4 space-y-3">
              <button
                v-for="item in selectableAlliances"
                :key="item.id"
                type="button"
                class="action-card w-full text-left transition"
                :class="selectedSlug === item.slug ? 'ring-1 ring-violet-400/40' : ''"
                @click="selectedSlug = item.slug"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate font-semibold text-slate-100">{{ item.title }}</p>
                    <p class="mt-1 text-sm text-slate-400">[{{ item.tag }}] · {{ allianceTypeLabel(item.alliance_type) }}</p>
                  </div>
                  <span class="footer-chip">{{ item.members_count ?? item.members?.length ?? 0 }}</span>
                </div>
              </button>

              <div v-if="!selectableAlliances.length" class="action-card text-sm text-slate-400">
                Пока нет ни одного альянса.
              </div>
            </div>
          </section>

          <section class="surface-card p-4 md:p-5">
            <div class="section-kicker !mb-2">Твоё положение</div>
            <h2 class="text-xl font-black text-slate-50">Статус</h2>

            <div v-if="currentMembershipCard" class="mt-4 action-card">
              <p class="font-semibold text-slate-100">{{ currentMembershipCard.title }}</p>
              <p class="mt-2 text-sm text-slate-400">{{ currentMembershipCard.role }}</p>
              <p v-if="currentMembershipCard.allianceTitle" class="mt-3 text-sm leading-6 text-slate-300">
                Сейчас государство состоит в альянсе «{{ currentMembershipCard.allianceTitle }}» [{{ currentMembershipCard.allianceTag }}].
              </p>
            </div>

            <div v-else class="mt-4 action-card text-sm text-slate-400">
              У тебя пока нет государства, поэтому ты можешь только смотреть союзы как игрок.
            </div>

            <div v-if="selectedAlliance" class="mt-4 grid gap-2.5">
              <button
                v-if="canJoinSelected"
                type="button"
                class="btn btn-primary"
                :disabled="actionLoading"
                @click="joinSelectedAlliance"
              >
                Вступить в альянс
              </button>
              <button
                v-if="canLeaveSelected"
                type="button"
                class="btn btn-outline"
                :disabled="actionLoading"
                @click="leaveSelectedAlliance"
              >
                Покинуть альянс
              </button>
            </div>
          </section>

          <section v-if="isAuthenticated && hasNation && !selectedAlliance && canManageNation" class="surface-card p-4 md:p-5">
            <div class="section-kicker !mb-2">Новый союз</div>
            <h2 class="text-xl font-black text-slate-50">Создать альянс</h2>

            <div class="mt-4 grid gap-3">
              <input v-model="createForm.title" class="input" placeholder="Название" />
              <input v-model="createForm.tag" class="input" placeholder="Тег" />
              <input v-model="createForm.slug" class="input" placeholder="Slug" />
              <select v-model="createForm.alliance_type" class="select">
                <option value="un">Политический союз</option>
                <option value="nato">Военный союз</option>
                <option value="economic">Экономический союз</option>
              </select>
              <textarea v-model="createForm.description" class="textarea" rows="4" placeholder="Короткое описание"></textarea>
              <button type="button" class="btn btn-primary" :disabled="actionLoading" @click="createAllianceAction">
                Создать альянс
              </button>
            </div>
          </section>
        </aside>

        <div class="space-y-4">
          <AllianceRelationsPanel
            :alliance="selectedAlliance"
            :loading="detailLoading"
            :editable="canManageAlliance"
          />

          <section v-if="selectedAlliance" class="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_360px]">
            <div class="space-y-4">
              <AllianceProposalFeed
                :items="proposals"
                :loading="proposalsLoading || detailLoading"
                :can-vote="canVote"
                :voting-disabled="actionLoading"
                @vote="castVote"
              />

              <section class="surface-card p-4 md:p-5">
                <div class="section-kicker !mb-2">Финансы</div>
                <h2 class="text-xl font-black text-slate-50">Последние операции</h2>

                <div v-if="detailLoading" class="mt-4 space-y-3">
                  <div class="skeleton h-16 rounded-[20px]"></div>
                  <div class="skeleton h-16 rounded-[20px]"></div>
                </div>

                <div v-else-if="!allianceTransactions.length" class="mt-4 action-card text-sm text-slate-400">
                  Операций пока нет.
                </div>

                <div v-else class="mt-4 space-y-3">
                  <article v-for="item in allianceTransactions.slice(0, 8)" :key="item.id" class="action-card">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="font-semibold text-slate-100">{{ txLabel(item) }}</p>
                        <p class="mt-2 text-sm leading-6 text-slate-400">{{ item.comment || 'Без комментария' }}</p>
                      </div>
                      <div class="shrink-0 text-right">
                        <p class="font-semibold text-slate-100">{{ formatNumber(item.net_amount ?? item.amount ?? 0) }}</p>
                      </div>
                    </div>
                  </article>
                </div>
              </section>
            </div>

            <aside class="space-y-4">
              <section v-if="canManagePolicies" class="surface-card p-4 md:p-5">
                <div class="section-kicker !mb-2">Правила союза</div>
                <h2 class="text-xl font-black text-slate-50">Изменить параметры</h2>

                <div class="mt-4 grid gap-3">
                  <label class="label cursor-pointer justify-start gap-3">
                    <input v-model="policyForm.allow_internal_transfers" type="checkbox" class="checkbox checkbox-sm" />
                    <span>Разрешить внутренние переводы</span>
                  </label>
                  <label class="label cursor-pointer justify-start gap-3">
                    <input v-model="policyForm.allow_joint_defense" type="checkbox" class="checkbox checkbox-sm" />
                    <span>Включить совместную оборону</span>
                  </label>
                  <label class="label cursor-pointer justify-start gap-3">
                    <input v-model="policyForm.allow_trade_bonus" type="checkbox" class="checkbox checkbox-sm" />
                    <span>Включить торговый бонус</span>
                  </label>
                  <label class="label cursor-pointer justify-start gap-3">
                    <input v-model="policyForm.allow_pvp_protection" type="checkbox" class="checkbox checkbox-sm" />
                    <span>Включить PvP-защиту</span>
                  </label>
                  <input v-model="policyForm.transfer_fee_percent" type="number" min="0" step="0.1" class="input" placeholder="Комиссия %" />
                  <button type="button" class="btn btn-primary" :disabled="actionLoading" @click="savePolicies">
                    Сохранить правила
                  </button>
                </div>
              </section>

              <section v-if="canCreateProposals" class="surface-card p-4 md:p-5">
                <div class="section-kicker !mb-2">Решения</div>
                <h2 class="text-xl font-black text-slate-50">Новое предложение</h2>

                <div class="mt-4 grid gap-3">
                  <select v-model="proposalForm.proposal_type" class="select">
                    <option value="set_policy">Изменение правил</option>
                    <option value="transfer">Перевод средств</option>
                    <option value="accept_member">Принятие участника</option>
                    <option value="remove_member">Исключение участника</option>
                  </select>
                  <input v-model="proposalForm.title" class="input" placeholder="Заголовок предложения" />
                  <textarea v-model="proposalForm.description" class="textarea" rows="3" placeholder="Короткое объяснение"></textarea>
                  <textarea v-model="proposalForm.payload_json" class="textarea font-mono text-xs" rows="6" placeholder='{"field":"allow_trade_bonus","value":true}'></textarea>
                  <button type="button" class="btn btn-primary" :disabled="actionLoading" @click="createProposalAction">
                    Создать предложение
                  </button>
                </div>
              </section>

              <section v-if="canTransfer" class="surface-card p-4 md:p-5">
                <div class="section-kicker !mb-2">Перевод</div>
                <h2 class="text-xl font-black text-slate-50">Отправить средства союзнику</h2>

                <div class="mt-4 grid gap-3">
                  <select v-model="transferForm.to_nation_slug" class="select">
                    <option disabled value="">Выбери государство</option>
                    <option v-for="nation in memberTargets" :key="nation.id" :value="nation.slug">
                      {{ nation.title }} [{{ nation.tag }}]
                    </option>
                  </select>
                  <input v-model="transferForm.amount" type="number" min="1" step="1" class="input" placeholder="Сумма" />
                  <textarea v-model="transferForm.comment" class="textarea" rows="3" placeholder="Комментарий"></textarea>
                  <button type="button" class="btn btn-primary" :disabled="actionLoading || !transferForm.to_nation_slug" @click="sendTransfer">
                    Отправить перевод
                  </button>
                </div>
              </section>

              <section v-if="!canManageAlliance && selectedAlliance" class="surface-card p-4 md:p-5">
                <div class="section-kicker !mb-2">Режим просмотра</div>
                <h2 class="text-xl font-black text-slate-50">Что доступно тебе</h2>
                <div class="mt-4 action-card text-sm text-slate-400">
                  Обычные игроки и гости видят обзор союза, состав и последние решения. Управляющие действия появляются только у лидеров и офицеров нужного государства.
                </div>
              </section>
            </aside>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>
