<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  approveNationRequest,
  createNation,
  deleteNationBackground,
  deleteNationBanner,
  deleteNationIcon,
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
import { useAuthStore } from '../stores/authStore'
import { formatRoleLabel, formatRecruitmentLabel } from '../utils/formatters'

const auth = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const actionLoading = ref(false)
const error = ref('')
const success = ref('')
const nation = ref(null)
const memberSearch = ref('')

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

const selectedFiles = reactive({ icon: null, banner: null, background: null })
const uploadState = reactive({ icon: false, banner: false, background: false })

const isEditMode = computed(() => Boolean(nation.value))
const viewerRole = computed(() => nation.value?.viewer_role || null)
const canManage = computed(() => Boolean(nation.value?.viewer_can_manage))
const canTransferLeadership = computed(() => viewerRole.value === 'leader')

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

const publicUrl = computed(() => {
  if (!nation.value?.slug || typeof window === 'undefined') return ''
  return `${window.location.origin}/nation/${nation.value.slug}`
})

const colorPresets = ['#6d5df6', '#7c3aed', '#2563eb', '#0f766e', '#dc2626', '#ea580c', '#db2777']

function hydrateEditForm(payload) {
  nation.value = payload
  editForm.slug = payload?.slug || ''
  editForm.title = payload?.title || ''
  editForm.tag = payload?.tag || ''
  editForm.short_description = payload?.short_description || ''
  editForm.description = payload?.description || ''
  editForm.accent_color = payload?.accent_color || '#6d5df6'
  editForm.recruitment_policy = payload?.recruitment_policy || 'request'
  editForm.is_public = Boolean(payload?.is_public)
}

function resetMessages() {
  error.value = ''
  success.value = ''
}

async function loadMyNation() {
  loading.value = true
  resetMessages()
  try {
    const payload = await getMyNation(auth.accessToken)
    if (payload) hydrateEditForm(payload)
    else nation.value = null
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить управление государством.'
  } finally {
    loading.value = false
  }
}

async function submitCreate() {
  saving.value = true
  resetMessages()
  try {
    const payload = await createNation(auth.accessToken, {
      slug: createForm.slug?.trim() || null,
      title: createForm.title?.trim() || null,
      tag: createForm.tag?.trim() || null,
      short_description: createForm.short_description?.trim() || null,
      description: createForm.description?.trim() || null,
      accent_color: createForm.accent_color?.trim() || null,
      recruitment_policy: createForm.recruitment_policy,
      is_public: createForm.is_public,
    })
    hydrateEditForm(payload)
    success.value = 'Государство создано.'
  } catch (err) {
    error.value = err.message || 'Не удалось создать государство.'
  } finally {
    saving.value = false
  }
}

async function submitUpdate() {
  if (!nation.value) return
  saving.value = true
  resetMessages()
  try {
    const payload = await updateMyNation(auth.accessToken, {
      slug: editForm.slug?.trim() || null,
      title: editForm.title?.trim() || null,
      tag: editForm.tag?.trim() || null,
      short_description: editForm.short_description?.trim() || null,
      description: editForm.description?.trim() || null,
      accent_color: editForm.accent_color?.trim() || null,
      recruitment_policy: editForm.recruitment_policy,
      is_public: editForm.is_public,
    })
    hydrateEditForm(payload)
    success.value = 'Изменения сохранены.'
  } catch (err) {
    error.value = err.message || 'Не удалось сохранить государство.'
  } finally {
    saving.value = false
  }
}

async function handleLeave() {
  if (!nation.value) return
  if (!window.confirm('Точно выйти из государства?')) return
  actionLoading.value = true
  resetMessages()
  try {
    await leaveMyNation(auth.accessToken)
    nation.value = null
    success.value = 'Ты вышел из государства.'
  } catch (err) {
    error.value = err.message || 'Не удалось выйти из государства.'
  } finally {
    actionLoading.value = false
  }
}

function selectFile(slot, event) {
  selectedFiles[slot] = event?.target?.files?.[0] || null
}

async function uploadAsset(slot) {
  const file = selectedFiles[slot]
  if (!file) return
  uploadState[slot] = true
  resetMessages()
  try {
    let payload = null
    if (slot === 'icon') payload = await uploadNationIcon(auth.accessToken, file)
    if (slot === 'banner') payload = await uploadNationBanner(auth.accessToken, file)
    if (slot === 'background') payload = await uploadNationBackground(auth.accessToken, file)
    if (payload) hydrateEditForm(payload)
    selectedFiles[slot] = null
    success.value = 'Изображение обновлено.'
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить изображение.'
  } finally {
    uploadState[slot] = false
  }
}

async function deleteAsset(slot) {
  uploadState[slot] = true
  resetMessages()
  try {
    let payload = null
    if (slot === 'icon') payload = await deleteNationIcon(auth.accessToken)
    if (slot === 'banner') payload = await deleteNationBanner(auth.accessToken)
    if (slot === 'background') payload = await deleteNationBackground(auth.accessToken)
    if (payload) hydrateEditForm(payload)
    selectedFiles[slot] = null
    success.value = 'Изображение удалено.'
  } catch (err) {
    error.value = err.message || 'Не удалось удалить изображение.'
  } finally {
    uploadState[slot] = false
  }
}

async function approveRequest(requestId) {
  if (!nation.value) return
  actionLoading.value = true
  resetMessages()
  try {
    const payload = await approveNationRequest(auth.accessToken, nation.value.slug, requestId)
    hydrateEditForm(payload)
    success.value = 'Заявка одобрена.'
  } catch (err) {
    error.value = err.message || 'Не удалось одобрить заявку.'
  } finally {
    actionLoading.value = false
  }
}

async function rejectRequest(requestId) {
  if (!nation.value) return
  actionLoading.value = true
  resetMessages()
  try {
    const payload = await rejectNationRequest(auth.accessToken, nation.value.slug, requestId)
    hydrateEditForm(payload)
    success.value = 'Заявка отклонена.'
  } catch (err) {
    error.value = err.message || 'Не удалось отклонить заявку.'
  } finally {
    actionLoading.value = false
  }
}

async function setRole(member, role) {
  if (!nation.value) return
  actionLoading.value = true
  resetMessages()
  try {
    const payload = await updateNationMemberRole(auth.accessToken, nation.value.slug, member.user_id, role)
    hydrateEditForm(payload.nation || payload)
    success.value = 'Роль обновлена.'
  } catch (err) {
    error.value = err.message || 'Не удалось обновить роль.'
  } finally {
    actionLoading.value = false
  }
}

async function kickMember(member) {
  if (!nation.value) return
  if (!window.confirm(`Исключить ${member.minecraft_nickname || member.site_login} из государства?`)) return
  actionLoading.value = true
  resetMessages()
  try {
    const payload = await removeNationMember(auth.accessToken, nation.value.slug, member.user_id)
    hydrateEditForm(payload.nation || payload)
    success.value = 'Участник исключён.'
  } catch (err) {
    error.value = err.message || 'Не удалось исключить участника.'
  } finally {
    actionLoading.value = false
  }
}

async function makeLeader(member) {
  if (!nation.value) return
  if (!window.confirm(`Передать лидерство игроку ${member.minecraft_nickname || member.site_login}?`)) return
  actionLoading.value = true
  resetMessages()
  try {
    const payload = await transferNationLeadership(auth.accessToken, nation.value.slug, member.user_id)
    hydrateEditForm(payload.nation || payload)
    success.value = 'Лидерство передано.'
  } catch (err) {
    error.value = err.message || 'Не удалось передать лидерство.'
  } finally {
    actionLoading.value = false
  }
}

async function copyPublicLink() {
  if (!publicUrl.value) return
  try {
    await navigator.clipboard.writeText(publicUrl.value)
    success.value = 'Ссылка скопирована.'
    error.value = ''
  } catch {
    error.value = 'Не удалось скопировать ссылку.'
  }
}

onMounted(loadMyNation)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl">
            <div class="section-kicker !mb-2">Студия государства</div>
            <h1 class="text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
              {{ isEditMode ? 'Управление государством' : 'Создать государство' }}
            </h1>
            <p class="mt-3 text-sm leading-7 text-slate-400 md:text-[15px]">
              Здесь можно управлять оформлением, набором участников, ролями, заявками и публичной страницей государства.
            </p>
          </div>
          <div class="flex flex-wrap gap-3">
            <RouterLink v-if="isEditMode && nation?.slug" :to="`/nation/${nation.slug}`" class="btn btn-outline">Публичная страница</RouterLink>
            <button v-if="isEditMode" type="button" class="btn btn-outline" @click="copyPublicLink">Копировать ссылку</button>
            <button type="button" class="btn btn-primary" :disabled="saving" @click="isEditMode ? submitUpdate() : submitCreate()">
              <span v-if="saving" class="spinner"></span>
              <span>{{ saving ? 'Сохраняем...' : isEditMode ? 'Сохранить' : 'Создать государство' }}</span>
            </button>
          </div>
        </div>

        <p v-if="error" class="alert alert-error mt-5">{{ error }}</p>
        <p v-if="success" class="alert alert-success mt-5">{{ success }}</p>
      </section>

      <div v-if="loading" class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div class="space-y-5">
          <div class="skeleton h-[300px] rounded-[28px]"></div>
          <div class="skeleton h-[320px] rounded-[28px]"></div>
        </div>
        <div class="space-y-5">
          <div class="skeleton h-[260px] rounded-[28px]"></div>
          <div class="skeleton h-[340px] rounded-[28px]"></div>
        </div>
      </div>

      <div v-else-if="!isEditMode" class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section class="surface-card p-5 md:p-6">
          <div class="section-kicker !mb-2">Создание</div>
          <h2 class="text-2xl font-black text-slate-50">Новое государство</h2>
          <div class="mt-5 grid gap-4">
            <label class="form-control">
              <span class="mb-2 text-sm font-semibold text-slate-300">Slug</span>
              <input v-model="createForm.slug" class="input rounded-2xl" maxlength="64" placeholder="kingdom-citadel" />
            </label>
            <div class="grid gap-4 md:grid-cols-[1fr_180px]">
              <label class="form-control">
                <span class="mb-2 text-sm font-semibold text-slate-300">Название</span>
                <input v-model="createForm.title" class="input rounded-2xl" maxlength="64" placeholder="Kingdom Citadel" />
              </label>
              <label class="form-control">
                <span class="mb-2 text-sm font-semibold text-slate-300">Тег</span>
                <input v-model="createForm.tag" class="input rounded-2xl" maxlength="8" placeholder="KCT" />
              </label>
            </div>
            <label class="form-control">
              <span class="mb-2 text-sm font-semibold text-slate-300">Короткое описание</span>
              <input v-model="createForm.short_description" class="input rounded-2xl" maxlength="140" placeholder="Короткая строка для списка и hero-блока" />
            </label>
            <label class="form-control">
              <span class="mb-2 text-sm font-semibold text-slate-300">Полное описание</span>
              <textarea v-model="createForm.description" rows="6" class="textarea rounded-2xl" placeholder="Расскажи, чем живёт государство." />
            </label>
            <div class="grid gap-4 md:grid-cols-[1fr_220px]">
              <label class="form-control">
                <span class="mb-2 text-sm font-semibold text-slate-300">Акцентный цвет</span>
                <div class="flex items-center gap-3">
                  <input v-model="createForm.accent_color" type="color" class="h-12 w-14 cursor-pointer rounded-2xl border border-white/10 bg-transparent p-1" />
                  <input v-model="createForm.accent_color" class="input rounded-2xl" placeholder="#6d5df6" />
                </div>
              </label>
              <label class="form-control">
                <span class="mb-2 text-sm font-semibold text-slate-300">Вступление</span>
                <select v-model="createForm.recruitment_policy" class="select rounded-2xl">
                  <option value="open">Свободное вступление</option>
                  <option value="request">По заявке</option>
                  <option value="invite_only">Только по приглашению</option>
                </select>
              </label>
            </div>
            <label class="panel-card flex items-center justify-between gap-4 p-4">
              <div>
                <p class="font-semibold text-slate-100">Публичная страница</p>
                <p class="mt-1 text-sm leading-6 text-slate-400">Разрешить отображение государства в списке и на публичной странице.</p>
              </div>
              <input v-model="createForm.is_public" type="checkbox" class="toggle" />
            </label>
          </div>
        </section>
        <aside class="surface-card p-5 md:p-6">
          <div class="section-kicker !mb-2">Подсказка</div>
          <h2 class="text-xl font-black text-slate-50">Что будет доступно после создания</h2>
          <div class="mt-5 grid gap-3">
            <div class="action-card"><p class="font-semibold text-slate-100">Оформление</p><p class="mt-2 text-sm leading-6 text-slate-400">Сразу можно загрузить иконку, баннер и фон страницы государства.</p></div>
            <div class="action-card"><p class="font-semibold text-slate-100">Участники</p><p class="mt-2 text-sm leading-6 text-slate-400">Появится управление ролями, заявками, киком и передачей лидерства.</p></div>
            <div class="action-card"><p class="font-semibold text-slate-100">Статистика</p><p class="mt-2 text-sm leading-6 text-slate-400">После sync с игрового сервера начнут подтягиваться баланс, территория, онлайн и престиж.</p></div>
          </div>
        </aside>
      </div>

      <div v-else class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div class="space-y-5">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Основное</div>
            <h2 class="text-2xl font-black text-slate-50">Параметры государства</h2>
            <div class="mt-5 grid gap-4">
              <label class="form-control"><span class="mb-2 text-sm font-semibold text-slate-300">Slug</span><input v-model="editForm.slug" class="input rounded-2xl" maxlength="64" /></label>
              <div class="grid gap-4 md:grid-cols-[1fr_180px]">
                <label class="form-control"><span class="mb-2 text-sm font-semibold text-slate-300">Название</span><input v-model="editForm.title" class="input rounded-2xl" maxlength="64" /></label>
                <label class="form-control"><span class="mb-2 text-sm font-semibold text-slate-300">Тег</span><input v-model="editForm.tag" class="input rounded-2xl" maxlength="8" /></label>
              </div>
              <label class="form-control"><span class="mb-2 text-sm font-semibold text-slate-300">Короткое описание</span><input v-model="editForm.short_description" class="input rounded-2xl" maxlength="140" /></label>
              <label class="form-control"><span class="mb-2 text-sm font-semibold text-slate-300">Полное описание</span><textarea v-model="editForm.description" rows="6" class="textarea rounded-2xl" /></label>
              <div class="grid gap-4 md:grid-cols-[1fr_220px]">
                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-300">Акцентный цвет</span>
                  <div class="flex items-center gap-3">
                    <input v-model="editForm.accent_color" type="color" class="h-12 w-14 cursor-pointer rounded-2xl border border-white/10 bg-transparent p-1" />
                    <input v-model="editForm.accent_color" class="input rounded-2xl" />
                  </div>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button v-for="color in colorPresets" :key="color" type="button" class="h-9 w-9 rounded-full border border-white/10" :style="{ backgroundColor: color }" @click="editForm.accent_color = color"></button>
                  </div>
                </label>
                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-300">Вступление</span>
                  <select v-model="editForm.recruitment_policy" class="select rounded-2xl">
                    <option value="open">Свободное вступление</option>
                    <option value="request">По заявке</option>
                    <option value="invite_only">Только по приглашению</option>
                  </select>
                  <p class="mt-2 text-xs text-slate-500">{{ formatRecruitmentLabel(editForm.recruitment_policy) }}</p>
                </label>
              </div>
              <label class="panel-card flex items-center justify-between gap-4 p-4">
                <div><p class="font-semibold text-slate-100">Публичная страница</p><p class="mt-1 text-sm leading-6 text-slate-400">Показывать государство в каталоге и рейтинге.</p></div>
                <input v-model="editForm.is_public" type="checkbox" class="toggle" />
              </label>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="flex items-end justify-between gap-3">
              <div><div class="section-kicker !mb-2">Состав</div><h2 class="text-2xl font-black text-slate-50">Участники</h2></div>
              <div class="w-full max-w-[260px]"><input v-model="memberSearch" class="input rounded-2xl" placeholder="Найти по нику или логину" /></div>
            </div>
            <div class="mt-5 grid gap-3">
              <div v-for="member in filteredMembers" :key="member.user_id" class="action-card">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div class="min-w-0">
                    <p class="truncate font-semibold text-slate-100">{{ member.minecraft_nickname || member.site_login }}</p>
                    <p class="mt-1 text-sm text-slate-400">@{{ member.site_login }}</p>
                    <p class="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{{ formatRoleLabel(member.role) }}</p>
                  </div>
                  <div v-if="canManage" class="flex flex-wrap gap-2">
                    <button v-if="member.role === 'member'" type="button" class="btn btn-outline btn-sm" :disabled="actionLoading" @click="setRole(member, 'officer')">Сделать офицером</button>
                    <button v-if="member.role === 'officer'" type="button" class="btn btn-outline btn-sm" :disabled="actionLoading" @click="setRole(member, 'member')">Понизить до участника</button>
                    <button v-if="canTransferLeadership && member.role !== 'leader'" type="button" class="btn btn-outline btn-sm" :disabled="actionLoading" @click="makeLeader(member)">Передать лидерство</button>
                    <button v-if="member.role !== 'leader'" type="button" class="btn btn-ghost btn-sm" :disabled="actionLoading" @click="kickMember(member)">Исключить</button>
                  </div>
                </div>
              </div>
              <div v-if="!filteredMembers.length" class="action-card text-sm text-slate-400">По текущему фильтру никого не найдено.</div>
            </div>
          </section>

          <section v-if="canManage" class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Заявки</div>
            <h2 class="text-2xl font-black text-slate-50">Вступление в государство</h2>
            <div class="mt-5 space-y-3">
              <div v-for="item in nation.join_requests" :key="item.id" class="action-card">
                <p class="font-semibold text-slate-100">{{ item.minecraft_nickname || item.site_login }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-400">{{ item.message || 'Сообщение не указано.' }}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button type="button" class="btn btn-primary btn-sm" :disabled="actionLoading" @click="approveRequest(item.id)">Одобрить</button>
                  <button type="button" class="btn btn-outline btn-sm" :disabled="actionLoading" @click="rejectRequest(item.id)">Отклонить</button>
                </div>
              </div>
              <div v-if="!nation.join_requests?.length" class="action-card text-sm text-slate-400">Активных заявок сейчас нет.</div>
            </div>
          </section>
        </div>

        <aside class="space-y-5">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Оформление</div>
            <h2 class="text-2xl font-black text-slate-50">Медиа</h2>
            <div class="mt-5 space-y-4">
              <div class="action-card">
                <div class="flex items-center justify-between gap-3">
                  <div><p class="font-semibold text-slate-100">Иконка</p><p class="mt-1 text-sm text-slate-400">Квадратное изображение государства.</p></div>
                  <div class="preview-avatar h-16 w-16 text-sm"><img v-if="assetUrls.icon" :src="assetUrls.icon" alt="icon" class="h-full w-full object-cover" /><span v-else>{{ editForm.tag?.slice(0, 2)?.toUpperCase() || 'N' }}</span></div>
                </div>
                <input class="input mt-4 rounded-2xl file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-200" type="file" accept="image/png,image/jpeg,image/webp" @change="selectFile('icon', $event)" />
                <div class="mt-3 flex flex-wrap gap-2">
                  <button type="button" class="btn btn-primary btn-sm" :disabled="uploadState.icon || !selectedFiles.icon" @click="uploadAsset('icon')"><span v-if="uploadState.icon" class="spinner"></span><span v-else>Загрузить</span></button>
                  <button type="button" class="btn btn-outline btn-sm" :disabled="uploadState.icon || !assetUrls.icon" @click="deleteAsset('icon')">Удалить</button>
                </div>
              </div>

              <div class="action-card">
                <p class="font-semibold text-slate-100">Баннер</p>
                <p class="mt-1 text-sm text-slate-400">Hero-обложка страницы государства.</p>
                <img v-if="assetUrls.banner" :src="assetUrls.banner" alt="banner" class="mt-4 h-28 w-full rounded-2xl object-cover" />
                <input class="input mt-4 rounded-2xl file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-200" type="file" accept="image/png,image/jpeg,image/webp" @change="selectFile('banner', $event)" />
                <div class="mt-3 flex flex-wrap gap-2">
                  <button type="button" class="btn btn-primary btn-sm" :disabled="uploadState.banner || !selectedFiles.banner" @click="uploadAsset('banner')"><span v-if="uploadState.banner" class="spinner"></span><span v-else>Загрузить</span></button>
                  <button type="button" class="btn btn-outline btn-sm" :disabled="uploadState.banner || !assetUrls.banner" @click="deleteAsset('banner')">Удалить</button>
                </div>
              </div>

              <div class="action-card">
                <p class="font-semibold text-slate-100">Фон страницы</p>
                <p class="mt-1 text-sm text-slate-400">Отдельный фон всей публичной страницы государства.</p>
                <img v-if="assetUrls.background" :src="assetUrls.background" alt="background" class="mt-4 h-28 w-full rounded-2xl object-cover" />
                <input class="input mt-4 rounded-2xl file:mr-4 file:rounded-xl file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-200" type="file" accept="image/png,image/jpeg,image/webp" @change="selectFile('background', $event)" />
                <div class="mt-3 flex flex-wrap gap-2">
                  <button type="button" class="btn btn-primary btn-sm" :disabled="uploadState.background || !selectedFiles.background" @click="uploadAsset('background')"><span v-if="uploadState.background" class="spinner"></span><span v-else>Загрузить</span></button>
                  <button type="button" class="btn btn-outline btn-sm" :disabled="uploadState.background || !assetUrls.background" @click="deleteAsset('background')">Удалить</button>
                </div>
              </div>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Статус</div>
            <h2 class="text-2xl font-black text-slate-50">Текущее состояние</h2>
            <div class="mt-5 grid gap-3">
              <div class="metric-card"><p class="metric-label">Твоя роль</p><p class="mt-2 text-sm font-semibold text-slate-100">{{ formatRoleLabel(viewerRole) }}</p></div>
              <div class="metric-card"><p class="metric-label">Политика вступления</p><p class="mt-2 text-sm font-semibold text-slate-100">{{ formatRecruitmentLabel(editForm.recruitment_policy) }}</p></div>
              <div class="metric-card"><p class="metric-label">Ссылка</p><p class="mt-2 break-all text-sm font-semibold text-slate-100">{{ publicUrl || '—' }}</p></div>
            </div>
            <div class="mt-5"><button type="button" class="btn btn-ghost w-full" :disabled="actionLoading" @click="handleLeave">Выйти из государства</button></div>
          </section>
        </aside>
      </div>
    </div>
  </section>
</template>
