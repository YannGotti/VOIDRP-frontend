<script setup>
import {computed, onMounted, reactive, ref, watch} from 'vue'
import { RouterLink } from 'vue-router'
import NationActivityFeed from '../features/nations/components/NationActivityFeed.vue'
import NationMediaSlotCard from '../features/nations/components/NationMediaSlotCard.vue'
import NationStudioPreview from '../features/nations/components/NationStudioPreview.vue'
import {
  approveNationRequest,
  createNation,
  deleteNationBackground,
  deleteNationBanner,
  deleteNationIcon,
  disbandMyNation,
  getMyNation,
  leaveMyNation,
  rejectNationRequest,
  removeNationMember,
  transferNationLeadership,
  updateMyNation,
  updateNationMemberRole,
  uploadNationBackground,
  uploadNationBanner,
  uploadNationIcon,
} from '../services/nationsApi'
import { toastError, toastSuccess } from '../services/toast'
import { getMyNationActivity } from '../services/nationActivityApi'
import { depositNationTreasury, getNationTopDonors, getNationTreasuryTransactions, withdrawNationTreasury } from '../services/nationStatsApi'
import { useAuthStore } from '../stores/authStore'
import { formatNumber, formatRoleLabel, formatRecruitmentLabel } from '../utils/formatters'

const auth = useAuthStore()
const MIN_CREATE_NATION_BALANCE = 300_000

const loading = ref(true)
const saving = ref(false)
const actionLoading = ref(false)
const activityLoading = ref(true)
const error = ref('')
const success = ref('')
const nation = ref(null)
const activity = ref([])
const treasuryLoading = ref(true)
const donorsLoading = ref(true)
const transactions = ref([])
const donors = ref([])
const memberSearch = ref('')

const treasuryForm = reactive({
  deposit_amount: 1000,
  deposit_comment: '',
  withdraw_amount: 1000,
  withdraw_comment: '',
})

const createForm = reactive({
  slug: '',
  title: '',
  tag: '',
  short_description: '',
  description: '',
  accent_color: '#6d5df6',
  recruitment_policy: 'request',
  is_public: true,
})

const editForm = reactive({
  slug: '',
  title: '',
  tag: '',
  short_description: '',
  description: '',
  accent_color: '#6d5df6',
  recruitment_policy: 'request',
  is_public: true,
})

const selectedFiles = reactive({
  icon: null,
  banner: null,
  background: null,
})

const uploadState = reactive({
  icon: false,
  banner: false,
  background: false,
})

const isEditMode = computed(() => Boolean(nation.value))
const viewerRole = computed(() => nation.value?.viewer_role || null)
const canManage = computed(() => Boolean(nation.value?.viewer_can_manage))
const canTransferLeadership = computed(() => viewerRole.value === 'leader')
const isReadOnlyMember = computed(() => isEditMode.value && !canManage.value)

const filteredMembers = computed(() => {
  const items = Array.isArray(nation.value?.members) ? nation.value.members : []
  const q = memberSearch.value.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => {
    const siteLogin = String(item.site_login || '').toLowerCase()
    const nickname = String(item.minecraft_nickname || '').toLowerCase()
    return siteLogin.includes(q) || nickname.includes(q)
  })
})

const assetUrls = computed(() => ({
  icon: nation.value?.assets?.icon_url || nation.value?.assets?.icon_preview_url || '',
  banner: nation.value?.assets?.banner_url || nation.value?.assets?.banner_preview_url || '',
  background: nation.value?.assets?.background_url || nation.value?.assets?.background_preview_url || '',
}))

const publicNationUrl = computed(() => (nation.value?.slug ? `/nation/${nation.value.slug}` : ''))
const allianceSummary = computed(() => nation.value?.alliance_summary || null)

function formatAllianceType(value) {
  switch (String(value || '').toLowerCase()) {
    case 'nato':
      return 'Военный блок'
    case 'economic':
      return 'Экономический союз'
    case 'un':
      return 'Политический союз'
    default:
      return 'Альянс'
  }
}


function txLabel(item) {
  const type = String(item?.transaction_type || '').toLowerCase()
  if (type === 'player_donation') return `Донат игрока ${item?.metadata_json?.minecraft_nickname || ''}`.trim()
  if (type === 'deposit') return 'Пополнение'
  if (type === 'withdraw') return 'Списание'
  if (type === 'alliance_transfer_out') return 'Перевод союзнику'
  if (type === 'alliance_transfer_in') return 'Перевод от союзника'
  if (type === 'alliance_fee_income') return 'Комиссия альянса'
  return item?.transaction_type || 'Операция'
}

function hydrateForms(payload) {
  nation.value = payload

  if (!payload) return

  editForm.slug = payload.slug || ''
  editForm.title = payload.title || ''
  editForm.tag = payload.tag || ''
  editForm.short_description = payload.short_description || ''
  editForm.description = payload.description || ''
  editForm.accent_color = payload.accent_color || '#6d5df6'
  editForm.recruitment_policy = payload.recruitment_policy || 'request'
  editForm.is_public = Boolean(payload.is_public)
}

async function loadNation() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = await getMyNation(auth.accessToken)
    hydrateForms(payload)
  } catch (err) {
    nation.value = null
    if (String(err?.message || '').toLowerCase().includes('not found')) {
      error.value = ''
    } else {
      error.value = err.message || 'Не удалось загрузить государство.'
    }
  } finally {
    loading.value = false
  }
}

async function loadActivity() {
  activityLoading.value = true
  try {
    const payload = await getMyNationActivity(auth.accessToken)
    activity.value = Array.isArray(payload?.items) ? payload.items : []
  } catch {
    activity.value = []
    transactions.value = []
    donors.value = []
  } finally {
    activityLoading.value = false
  }
}


async function loadTreasury() {
  if (!nation.value?.slug) {
    transactions.value = []
    treasuryLoading.value = false
    return
  }
  treasuryLoading.value = true
  try {
    const payload = await getNationTreasuryTransactions(nation.value.slug, auth.accessToken)
    transactions.value = payload?.items || []
  } catch {
    transactions.value = []
  } finally {
    treasuryLoading.value = false
  }
}

async function loadDonors() {
  if (!nation.value?.slug) {
    donors.value = []
    donorsLoading.value = false
    return
  }
  donorsLoading.value = true
  try {
    const payload = await getNationTopDonors(nation.value.slug, auth.accessToken)
    donors.value = payload?.items || []
  } catch {
    donors.value = []
  } finally {
    donorsLoading.value = false
  }
}

async function refreshTreasuryBlocks() {
  await Promise.all([loadTreasury(), loadDonors(), loadActivity(), loadNation()])
}

async function submitDeposit() {
  if (!nation.value?.slug) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    await depositNationTreasury(auth.accessToken, nation.value.slug, {
      amount: treasuryForm.deposit_amount,
      comment: treasuryForm.deposit_comment || null,
    })
    success.value = 'Казна государства пополнена.'
    await refreshTreasuryBlocks()
  } catch (err) {
    error.value = err.message || 'Не удалось пополнить казну.'
  } finally {
    saving.value = false
  }
}

async function submitWithdraw() {
  if (!nation.value?.slug) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    await withdrawNationTreasury(auth.accessToken, nation.value.slug, {
      amount: treasuryForm.withdraw_amount,
      comment: treasuryForm.withdraw_comment || null,
    })
    success.value = 'Списание из казны выполнено.'
    await refreshTreasuryBlocks()
  } catch (err) {
    error.value = err.message || 'Не удалось списать из казны.'
  } finally {
    saving.value = false
  }
}

async function submitCreate() {
  saving.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = await createNation(auth.accessToken, {
      slug: createForm.slug,
      title: createForm.title,
      tag: createForm.tag,
      short_description: createForm.short_description || null,
      description: createForm.description || null,
      accent_color: createForm.accent_color || null,
      recruitment_policy: createForm.recruitment_policy,
      is_public: createForm.is_public,
    })

    hydrateForms(payload)
    success.value = 'Государство создано.'
    await Promise.all([loadActivity(), loadTreasury(), loadDonors()])
  } catch (err) {
    error.value = err.message || 'Не удалось создать государство.'
  } finally {
    saving.value = false
  }
}

async function submitUpdate() {
  saving.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = await updateMyNation(auth.accessToken, {
      slug: editForm.slug,
      title: editForm.title,
      tag: editForm.tag,
      short_description: editForm.short_description || null,
      description: editForm.description || null,
      accent_color: editForm.accent_color || null,
      recruitment_policy: editForm.recruitment_policy,
      is_public: editForm.is_public,
    })

    hydrateForms(payload)
    success.value = 'Изменения сохранены.'
    await Promise.all([loadActivity(), loadTreasury(), loadDonors()])
  } catch (err) {
    error.value = err.message || 'Не удалось сохранить изменения.'
  } finally {
    saving.value = false
  }
}

function onFileSelected(slot, file) {
  selectedFiles[slot] = file || null
}

async function uploadSelected(slot) {
  const file = selectedFiles[slot]
  if (!file) return

  uploadState[slot] = true
  error.value = ''
  success.value = ''

  try {
    let payload = null

    if (slot === 'icon') payload = await uploadNationIcon(auth.accessToken, file)
    if (slot === 'banner') payload = await uploadNationBanner(auth.accessToken, file)
    if (slot === 'background') payload = await uploadNationBackground(auth.accessToken, file)

    selectedFiles[slot] = null
    if (payload) hydrateForms(payload)
    success.value = 'Изображение обновлено.'
    await loadActivity()
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить изображение.'
  } finally {
    uploadState[slot] = false
  }
}

async function removeAsset(slot) {
  uploadState[slot] = true
  error.value = ''
  success.value = ''

  try {
    let payload = null

    if (slot === 'icon') payload = await deleteNationIcon(auth.accessToken)
    if (slot === 'banner') payload = await deleteNationBanner(auth.accessToken)
    if (slot === 'background') payload = await deleteNationBackground(auth.accessToken)

    selectedFiles[slot] = null
    if (payload) hydrateForms(payload)
    success.value = 'Изображение удалено.'
    await loadActivity()
  } catch (err) {
    error.value = err.message || 'Не удалось удалить изображение.'
  } finally {
    uploadState[slot] = false
  }
}

async function promoteToOfficer(userId) {
  actionLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = await updateNationMemberRole(auth.accessToken, nation.value.slug, userId, 'officer')
    hydrateForms(payload)
    success.value = 'Роль обновлена.'
    await loadActivity()
  } catch (err) {
    error.value = err.message || 'Не удалось обновить роль.'
  } finally {
    actionLoading.value = false
  }
}

async function demoteToMember(userId) {
  actionLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = await updateNationMemberRole(auth.accessToken, nation.value.slug, userId, 'member')
    hydrateForms(payload)
    success.value = 'Роль обновлена.'
    await loadActivity()
  } catch (err) {
    error.value = err.message || 'Не удалось обновить роль.'
  } finally {
    actionLoading.value = false
  }
}

async function kickMember(userId) {
  const confirmed = window.confirm('Исключить участника из государства?')
  if (!confirmed) return

  actionLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = await removeNationMember(auth.accessToken, nation.value.slug, userId)
    hydrateForms(payload)
    success.value = 'Участник исключён.'
    await loadActivity()
  } catch (err) {
    error.value = err.message || 'Не удалось исключить участника.'
  } finally {
    actionLoading.value = false
  }
}

async function approveRequest(requestId) {
  actionLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = await approveNationRequest(auth.accessToken, nation.value.slug, requestId)
    hydrateForms(payload)
    success.value = 'Заявка одобрена.'
    await loadActivity()
  } catch (err) {
    error.value = err.message || 'Не удалось одобрить заявку.'
  } finally {
    actionLoading.value = false
  }
}

async function rejectRequest(requestId) {
  actionLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = await rejectNationRequest(auth.accessToken, nation.value.slug, requestId)
    hydrateForms(payload)
    success.value = 'Заявка отклонена.'
    await loadActivity()
  } catch (err) {
    error.value = err.message || 'Не удалось отклонить заявку.'
  } finally {
    actionLoading.value = false
  }
}

async function passLeadership(userId) {
  const confirmed = window.confirm('Передать лидерство этому участнику?')
  if (!confirmed) return

  actionLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = await transferNationLeadership(auth.accessToken, nation.value.slug, userId)
    hydrateForms(payload)
    success.value = 'Лидерство передано.'
    await loadActivity()
  } catch (err) {
    error.value = err.message || 'Не удалось передать лидерство.'
  } finally {
    actionLoading.value = false
  }
}

async function handleLeaveNation() {
  const confirmed = window.confirm('Покинуть государство?')
  if (!confirmed) return

  actionLoading.value = true
  error.value = ''
  success.value = ''

  try {
    await leaveMyNation(auth.accessToken)
    nation.value = null
    success.value = 'Ты покинул государство.'
    activity.value = []
    transactions.value = []
    donors.value = []
  } catch (err) {
    error.value = err.message || 'Не удалось покинуть государство.'
  } finally {
    actionLoading.value = false
  }
}

async function handleDisbandNation() {
  const name = nation.value?.title || 'государство'
  const confirmed = window.confirm(`Расформировать государство «${name}»? Это действие необратимо — все участники будут исключены, история и казна удалены.`)
  if (!confirmed) return

  actionLoading.value = true
  error.value = ''
  success.value = ''

  try {
    await disbandMyNation(auth.accessToken)
    nation.value = null
    success.value = 'Государство расформировано.'
    activity.value = []
    transactions.value = []
    donors.value = []
  } catch (err) {
    error.value = err.message || 'Не удалось расформировать государство.'
  } finally {
    actionLoading.value = false
  }
}

onMounted(async () => {
  await loadNation()
  await Promise.all([loadActivity(), loadTreasury(), loadDonors()])
})
watch(error, (value) => { if (value) toastError(value) })
watch(success, (value) => { if (value) toastSuccess(value) })
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="max-w-3xl">
          <div class="section-kicker !mb-2">Студия государства</div>
          <h1 class="text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
            {{ isEditMode ? 'Управление государством' : 'Создание государства' }}
          </h1>
          <p class="mt-4 text-sm leading-7 text-slate-400 md:text-[15px]">
            Здесь собраны оформление, участники, заявки и теперь ещё привязка к альянсу.
          </p>
        </div>
      </section>


      <div v-if="loading" class="grid gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        <div class="skeleton h-[540px] rounded-[28px]"></div>
        <div class="space-y-5">
          <div class="skeleton h-[260px] rounded-[28px]"></div>
          <div class="skeleton h-[560px] rounded-[28px]"></div>
        </div>
      </div>

      <div v-else-if="!isEditMode" class="grid gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        <aside class="space-y-5">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Что будет дальше</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Новое государство</h2>
            <p class="mt-3 text-sm leading-7 text-slate-400">
              После создания ты сможешь оформить страницу, принимать участников, смотреть журнал событий и позже подключать альянс.
            </p>
          </section>
        </aside>

        <section class="surface-card p-5 md:p-6">
          <div class="section-kicker !mb-2">Создание</div>
          <h2 class="text-xl font-black text-slate-50 md:text-2xl">Основные данные</h2>

          <div class="mt-5 rounded-[20px] border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm leading-6 text-amber-100">
            Для создания государства нужен баланс игрока минимум {{ formatNumber(MIN_CREATE_NATION_BALANCE) }}.
            Если баланс ещё не синхронизирован с игрового сервера, backend отклонит создание.
          </div>

          <div class="mt-5 grid gap-4">
            <input v-model="createForm.title" class="input rounded-2xl" placeholder="Название" />
            <input v-model="createForm.slug" class="input rounded-2xl" placeholder="Адрес страницы" />
            <input v-model="createForm.tag" class="input rounded-2xl" placeholder="Тег" />
            <input v-model="createForm.short_description" class="input rounded-2xl" placeholder="Короткое описание" />
            <textarea v-model="createForm.description" class="textarea rounded-2xl" rows="6" placeholder="Подробное описание"></textarea>
            <input v-model="createForm.accent_color" type="color" class="h-14 w-24 cursor-pointer rounded-2xl border border-white/10 bg-transparent p-1" />

            <select v-model="createForm.recruitment_policy" class="select rounded-2xl">
              <option value="open">Свободное вступление</option>
              <option value="request">По заявке</option>
              <option value="invite_only">Только по приглашению</option>
            </select>

            <label class="panel-card flex items-center justify-between gap-4 p-4">
              <div>
                <p class="font-semibold text-slate-100">Публичная страница</p>
                <p class="mt-1 text-sm leading-6 text-slate-400">Разрешить видеть государство другим игрокам.</p>
              </div>
              <input v-model="createForm.is_public" type="checkbox" class="toggle" />
            </label>

            <button type="button" class="btn btn-primary" :disabled="saving" @click="submitCreate">
              <span v-if="saving" class="spinner"></span>
              <span v-else>Создать государство</span>
            </button>
          </div>
        </section>
      </div>

      <div v-else-if="isReadOnlyMember" class="grid gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        <aside class="space-y-5">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Твоя роль</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Режим участника</h2>
            <p class="mt-3 text-sm leading-7 text-slate-400">
              Ты состоишь в государстве, но управляющие действия скрыты. Здесь остаётся только полезный обзор и быстрый переход на публичную страницу.
            </p>

            <div class="mt-5 grid gap-3">
              <div class="action-card">
                <p class="metric-label">Государство</p>
                <p class="mt-2 text-sm font-semibold text-slate-100">{{ nation.title }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-400">[{{ nation.tag }}] · {{ nation.short_description || 'Описание пока не добавлено.' }}</p>
              </div>
              <div class="action-card">
                <p class="metric-label">Роль</p>
                <p class="mt-2 text-sm font-semibold text-slate-100">{{ formatRoleLabel(viewerRole) }}</p>
              </div>
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <RouterLink :to="publicNationUrl" class="btn btn-primary">Открыть страницу</RouterLink>
              <button type="button" class="btn btn-outline" :disabled="actionLoading" @click="handleLeaveNation">
                Покинуть государство
              </button>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Альянс</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">
              {{ allianceSummary ? allianceSummary.title : 'Надгосударственный блок' }}
            </h2>

            <div v-if="!allianceSummary" class="action-card mt-5 text-sm text-slate-400">
              Государство пока не состоит в альянсе.
            </div>

            <div v-else class="mt-5 space-y-3">
              <div class="action-card">
                <p class="font-semibold text-slate-100">[{{ allianceSummary.tag }}] · {{ formatAllianceType(allianceSummary.alliance_type) }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-400">
                  {{ allianceSummary.description || 'Описание альянса пока не добавлено.' }}
                </p>
              </div>
              <RouterLink to="/alliances" class="btn btn-outline">Открыть центр альянсов</RouterLink>
            </div>
          </section>
        </aside>

        <div class="space-y-5">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Состав</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Участники государства</h2>

            <div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div v-for="member in nation.members" :key="member.user_id" class="action-card">
                <p class="font-semibold text-slate-100">{{ member.minecraft_nickname || member.site_login }}</p>
                <p class="mt-1 text-sm text-slate-400">@{{ member.site_login }}</p>
                <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  {{ formatRoleLabel(member.role) }}
                </p>
              </div>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">История</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Последние события</h2>
            <div class="mt-5">
              <NationActivityFeed :items="activity" :loading="activityLoading" />
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Казна</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Последние операции</h2>

            <div v-if="treasuryLoading" class="mt-5 space-y-3">
              <div class="skeleton h-16 rounded-[22px]"></div>
              <div class="skeleton h-16 rounded-[22px]"></div>
            </div>

            <div v-else-if="!transactions.length" class="action-card mt-5 text-sm text-slate-400">
              Операций пока нет.
            </div>

            <div v-else class="mt-5 space-y-3">
              <div v-for="item in transactions.slice(0, 6)" :key="item.id" class="action-card">
                <div class="flex items-center justify-between gap-3">
                  <p class="font-semibold text-slate-100">{{ txLabel(item) }}</p>
                  <span class="footer-chip">{{ formatNumber(item.net_amount || item.amount) }}</span>
                </div>
                <p class="mt-2 text-sm leading-6 text-slate-400">{{ item.comment || 'Без комментария.' }}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div v-else class="grid gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
        <aside class="space-y-5">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Превью</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Публичная страница</h2>

            <div class="mt-5">
              <NationStudioPreview :nation="nation" />
            </div>

            <div class="mt-5 flex flex-wrap gap-3">
              <RouterLink :to="publicNationUrl" class="btn btn-primary">Открыть страницу</RouterLink>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Альянс</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">
              {{ allianceSummary ? allianceSummary.title : 'Надгосударственный блок' }}
            </h2>

            <div v-if="!allianceSummary" class="action-card mt-5 text-sm text-slate-400">
              Государство пока не состоит в альянсе. Создание, вступление, голосования и внутренние переводы доступны в отдельном центре.
            </div>

            <div v-else class="mt-5 space-y-4">
              <div class="action-card">
                <p class="font-semibold text-slate-100">[{{ allianceSummary.tag }}] · {{ formatAllianceType(allianceSummary.alliance_type) }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-400">
                  {{ allianceSummary.description || 'Описание альянса пока не добавлено.' }}
                </p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="metric-card text-center">
                  <p class="metric-value !text-[1.12rem]">{{ allianceSummary.members_count }}</p>
                  <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Государств</p>
                </div>
                <div class="metric-card text-center">
                  <p class="metric-value !text-[1.12rem]">{{ allianceSummary.transfer_fee_percent }}%</p>
                  <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Комиссия</p>
                </div>
              </div>

              <div class="grid gap-3">
                <div v-for="member in allianceSummary.members" :key="member.nation_id" class="action-card">
                  <p class="font-semibold text-slate-100">{{ member.title }}</p>
                  <p class="mt-2 text-sm leading-6 text-slate-400">[{{ member.tag }}]</p>
                </div>
              </div>
            </div>

            <RouterLink to="/alliances" class="btn btn-primary mt-5">
              Открыть центр альянсов
            </RouterLink>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Оформление</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Изображения</h2>

            <div class="mt-5 space-y-4">
              <NationMediaSlotCard
                title="Иконка"
                subtitle="Главное изображение государства."
                slot-name="icon"
                variant="icon"
                :preview-url="assetUrls.icon"
                :selected-file-name="selectedFiles.icon?.name || ''"
                :uploading="uploadState.icon"
                :has-asset="Boolean(assetUrls.icon)"
                recommendation="PNG/JPEG/WEBP, квадрат."
                @select-file="onFileSelected('icon', $event)"
                @upload="uploadSelected('icon')"
                @remove="removeAsset('icon')"
              />

              <NationMediaSlotCard
                title="Баннер"
                subtitle="Верхняя обложка страницы."
                slot-name="banner"
                variant="banner"
                :preview-url="assetUrls.banner"
                :selected-file-name="selectedFiles.banner?.name || ''"
                :uploading="uploadState.banner"
                :has-asset="Boolean(assetUrls.banner)"
                recommendation="PNG/JPEG/WEBP, широкий формат."
                @select-file="onFileSelected('banner', $event)"
                @upload="uploadSelected('banner')"
                @remove="removeAsset('banner')"
              />

              <NationMediaSlotCard
                title="Фон"
                subtitle="Фон всей страницы."
                slot-name="background"
                variant="background"
                :preview-url="assetUrls.background"
                :selected-file-name="selectedFiles.background?.name || ''"
                :uploading="uploadState.background"
                :has-asset="Boolean(assetUrls.background)"
                recommendation="PNG/JPEG/WEBP, 1600x900+."
                @select-file="onFileSelected('background', $event)"
                @upload="uploadSelected('background')"
                @remove="removeAsset('background')"
              />
            </div>
          </section>
        </aside>

        <div class="space-y-5">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Параметры</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Настройки государства</h2>

            <div class="mt-5 grid gap-4">
              <input v-model="editForm.title" class="input rounded-2xl" placeholder="Название" />
              <input v-model="editForm.slug" class="input rounded-2xl" placeholder="Адрес страницы" />
              <input v-model="editForm.tag" class="input rounded-2xl" placeholder="Тег" />
              <input v-model="editForm.short_description" class="input rounded-2xl" placeholder="Короткое описание" />
              <textarea v-model="editForm.description" class="textarea rounded-2xl" rows="6" placeholder="Подробное описание"></textarea>
              <input v-model="editForm.accent_color" type="color" class="h-14 w-24 cursor-pointer rounded-2xl border border-white/10 bg-transparent p-1" />

              <select v-model="editForm.recruitment_policy" class="select rounded-2xl">
                <option value="open">{{ formatRecruitmentLabel('open') }}</option>
                <option value="request">{{ formatRecruitmentLabel('request') }}</option>
                <option value="invite_only">{{ formatRecruitmentLabel('invite_only') }}</option>
              </select>

              <label class="panel-card flex items-center justify-between gap-4 p-4">
                <div>
                  <p class="font-semibold text-slate-100">Публичная страница</p>
                  <p class="mt-1 text-sm leading-6 text-slate-400">Показывать государство в каталоге.</p>
                </div>
                <input v-model="editForm.is_public" type="checkbox" class="toggle" />
              </label>

              <div class="mt-2 flex flex-wrap gap-3">
                <button type="button" class="btn btn-primary" :disabled="saving" @click="submitUpdate">
                  <span v-if="saving" class="spinner"></span>
                  <span v-else>Сохранить изменения</span>
                </button>

                <button
                  v-if="viewerRole !== 'leader'"
                  type="button"
                  class="btn btn-outline"
                  :disabled="actionLoading"
                  @click="handleLeaveNation"
                >
                  Покинуть государство
                </button>
              </div>

              <div v-if="viewerRole === 'leader'" class="mt-6 rounded-[18px] border border-red-500/20 bg-red-500/5 p-4">
                <p class="text-sm font-semibold text-red-300">Опасная зона</p>
                <p class="mt-1 text-sm leading-6 text-slate-400">
                  Расформирование государства необратимо. Все участники будут исключены, история и казна удалены.
                </p>
                <button
                  type="button"
                  class="btn btn-outline mt-3 border-red-500/40 text-red-400 hover:border-red-500 hover:bg-red-500/10"
                  :disabled="actionLoading"
                  @click="handleDisbandNation"
                >
                  Расформировать государство
                </button>
              </div>
            </div>
          </section>


          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Казна</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Управление treasury</h2>

            <div class="mt-5 grid gap-4 md:grid-cols-2">
              <div class="action-card">
                <p class="font-semibold text-slate-100">Пополнение</p>
                <input v-model="treasuryForm.deposit_amount" type="number" class="input rounded-2xl mt-3" placeholder="Сумма" />
                <textarea v-model="treasuryForm.deposit_comment" class="textarea rounded-2xl mt-3" rows="3" placeholder="Комментарий"></textarea>
                <button type="button" class="btn btn-primary mt-3" :disabled="saving" @click="submitDeposit">
                  Пополнить казну
                </button>
              </div>

              <div class="action-card">
                <p class="font-semibold text-slate-100">Списание</p>
                <input v-model="treasuryForm.withdraw_amount" type="number" class="input rounded-2xl mt-3" placeholder="Сумма" />
                <textarea v-model="treasuryForm.withdraw_comment" class="textarea rounded-2xl mt-3" rows="3" placeholder="Комментарий"></textarea>
                <button type="button" class="btn btn-outline mt-3" :disabled="saving" @click="submitWithdraw">
                  Списать из казны
                </button>
              </div>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Меценаты</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Кто пополняет казну</h2>

            <div v-if="donorsLoading" class="mt-5 space-y-3">
              <div class="skeleton h-16 rounded-[22px]"></div>
              <div class="skeleton h-16 rounded-[22px]"></div>
            </div>

            <div v-else-if="!donors.length" class="action-card mt-5 text-sm text-slate-400">
              Донатов игроков пока не было.
            </div>

            <div v-else class="mt-5 grid gap-3 md:grid-cols-2">
              <div v-for="item in donors" :key="item.minecraft_nickname" class="action-card">
                <div class="flex items-center justify-between gap-3">
                  <p class="font-semibold text-slate-100">{{ item.minecraft_nickname }}</p>
                  <span class="footer-chip">{{ formatNumber(item.total_amount) }}</span>
                </div>
                <p class="mt-2 text-sm leading-6 text-slate-400">Донатов: {{ formatNumber(item.donations_count) }}</p>
              </div>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Журнал казны</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Последние операции</h2>

            <div v-if="treasuryLoading" class="mt-5 space-y-3">
              <div class="skeleton h-20 rounded-[22px]"></div>
              <div class="skeleton h-20 rounded-[22px]"></div>
            </div>

            <div v-else-if="!transactions.length" class="action-card mt-5 text-sm text-slate-400">
              Операций пока нет.
            </div>

            <div v-else class="mt-5 space-y-3">
              <div v-for="item in transactions" :key="item.id" class="action-card">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <p class="font-semibold text-slate-100">{{ txLabel(item) }}</p>
                  <span class="footer-chip">{{ formatNumber(item.net_amount) }}</span>
                </div>
                <p class="mt-2 text-sm leading-6 text-slate-400">{{ item.comment || 'Без комментария.' }}</p>
              </div>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Участники</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Команда государства</h2>

            <div class="mt-5">
              <input v-model="memberSearch" class="input rounded-2xl" placeholder="Поиск по логину или нику" />
            </div>

            <div class="mt-5 grid gap-3">
              <article
                v-for="member in filteredMembers"
                :key="member.user_id"
                class="action-card"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate font-semibold text-slate-100">{{ member.minecraft_nickname || member.site_login }}</p>
                    <p class="mt-1 text-sm text-slate-400">@{{ member.site_login }}</p>
                    <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      {{ formatRoleLabel(member.role) }}
                    </p>
                  </div>

                  <div
                    v-if="canManage && member.user_id !== auth.state.user?.id"
                    class="flex flex-wrap gap-2"
                  >
                    <button
                      v-if="member.role === 'member'"
                      type="button"
                      class="btn btn-outline btn-sm"
                      :disabled="actionLoading"
                      @click="promoteToOfficer(member.user_id)"
                    >
                      Сделать офицером
                    </button>

                    <button
                      v-if="member.role === 'officer'"
                      type="button"
                      class="btn btn-outline btn-sm"
                      :disabled="actionLoading"
                      @click="demoteToMember(member.user_id)"
                    >
                      Снять офицера
                    </button>

                    <button
                      v-if="canTransferLeadership"
                      type="button"
                      class="btn btn-outline btn-sm"
                      :disabled="actionLoading"
                      @click="passLeadership(member.user_id)"
                    >
                      Передать лидерство
                    </button>

                    <button
                      v-if="member.role !== 'leader'"
                      type="button"
                      class="btn btn-primary btn-sm"
                      :disabled="actionLoading"
                      @click="kickMember(member.user_id)"
                    >
                      Исключить
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Заявки</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Ожидают решения</h2>

            <div v-if="!nation?.join_requests?.length" class="action-card mt-5 text-sm text-slate-400">
              Сейчас нет активных заявок.
            </div>

            <div v-else class="mt-5 space-y-3">
              <article
                v-for="item in nation.join_requests"
                :key="item.id"
                class="action-card"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold text-slate-100">{{ item.minecraft_nickname || item.site_login }}</p>
                    <p class="mt-2 text-sm leading-6 text-slate-400">{{ item.message || 'Сообщение не указано.' }}</p>
                  </div>

                  <div class="mt-3 flex flex-wrap gap-2">
                    <button type="button" class="btn btn-primary btn-sm" :disabled="actionLoading" @click="approveRequest(item.id)">
                      Одобрить
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" :disabled="actionLoading" @click="rejectRequest(item.id)">
                      Отклонить
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <NationActivityFeed
            :items="activity"
            :loading="activityLoading"
            title="Журнал государства"
            subtitle="Создание, вступления, смена ролей, оформление и альянсовые действия сохраняются в истории."
          />
        </div>
      </div>
    </div>
  </section>
</template>



