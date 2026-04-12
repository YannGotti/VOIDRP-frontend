<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  createNation,
  deleteNationBackground,
  deleteNationBanner,
  deleteNationIcon,
  getMyNation,
  leaveMyNation,
  removeNationMember,
  transferNationLeadership,
  updateMyNation,
  updateNationMemberRole,
  uploadNationBackground,
  uploadNationBanner,
  uploadNationIcon,
} from '../services/nationsApi'
import { useAuthStore } from '../stores/authStore'
import { formatRecruitmentLabel, formatRoleLabel } from '../utils/formatters'
import { toastError, toastSuccess } from '../services/toast'

const auth = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const leaving = ref(false)
const nation = ref(null)

const selectedFiles = reactive({
  icon: null,
  banner: null,
  background: null,
})

const uploading = reactive({
  icon: false,
  banner: false,
  background: false,
})

const memberBusy = reactive({})
const roleDrafts = reactive({})

const form = reactive({
  title: '',
  slug: '',
  tag: '',
  short_description: '',
  description: '',
  accent_color: '#6d5df6',
  recruitment_policy: 'request',
  is_public: true,
})

const colorPresets = ['#6d5df6', '#4f46e5', '#2563eb', '#0f766e', '#0f172a', '#b91c1c', '#f59e0b']

const selectedFileNames = computed(() => ({
  icon: selectedFiles.icon?.name || '',
  banner: selectedFiles.banner?.name || '',
  background: selectedFiles.background?.name || '',
}))

const isEditMode = computed(() => Boolean(nation.value))
const viewerRole = computed(() => nation.value?.viewer_role || null)
const isLeader = computed(() => viewerRole.value === 'leader')
const isOfficer = computed(() => viewerRole.value === 'officer')
const canManageMembers = computed(() => isLeader.value || isOfficer.value)

const currentAssets = computed(() => ({
  icon: nation.value?.assets?.icon_url || nation.value?.assets?.icon_preview_url || '',
  banner: nation.value?.assets?.banner_url || nation.value?.assets?.banner_preview_url || '',
  background: nation.value?.assets?.background_url || nation.value?.assets?.background_preview_url || '',
}))

const members = computed(() => {
  const items = Array.isArray(nation.value?.members) ? [...nation.value.members] : []
  const order = { leader: 0, officer: 1, member: 2 }

  items.sort((a, b) => {
    const roleDiff = (order[a?.role] ?? 9) - (order[b?.role] ?? 9)
    if (roleDiff !== 0) return roleDiff
    return getMemberName(a).localeCompare(getMemberName(b), 'ru')
  })

  return items
})

const leaderCount = computed(() => members.value.filter((item) => normalizeRole(item.role) === 'leader').length)
const officerCount = computed(() => members.value.filter((item) => normalizeRole(item.role) === 'officer').length)
const memberCount = computed(() => members.value.filter((item) => normalizeRole(item.role) === 'member').length)

const publicNationUrl = computed(() => {
  const slug = form.slug?.trim() || nation.value?.slug || ''
  if (!slug || typeof window === 'undefined') return ''
  return `${window.location.origin}/nation/${slug}`
})

function normalizeHexColor(value) {
  const text = String(value || '').trim()
  if (!text) return '#6d5df6'
  return text.startsWith('#') ? text.slice(0, 7) : `#${text.slice(0, 6)}`
}

function normalizeRole(role) {
  return String(role || '').toLowerCase()
}

function getMemberId(member) {
  return member?.user_id || member?.id || member?.site_login || member?.minecraft_nickname
}

function getMemberName(member) {
  return member?.minecraft_nickname || member?.display_name || member?.site_login || 'Игрок'
}

function getMemberHandle(member) {
  return member?.site_login || ''
}

function canManageTarget(member) {
  const targetRole = normalizeRole(member?.role)
  if (targetRole === 'leader') return false
  if (isLeader.value) return true
  return isOfficer.value && targetRole === 'member'
}

function canTransferLeadershipTo(member) {
  return isLeader.value && normalizeRole(member?.role) !== 'leader'
}

function applyNation(data) {
  nation.value = data

  form.title = data?.title || ''
  form.slug = data?.slug || ''
  form.tag = data?.tag || ''
  form.short_description = data?.short_description || ''
  form.description = data?.description || ''
  form.accent_color = normalizeHexColor(data?.accent_color || '#6d5df6')
  form.recruitment_policy = data?.recruitment_policy || 'request'
  form.is_public = Boolean(data?.is_public ?? true)

  for (const member of Array.isArray(data?.members) ? data.members : []) {
    roleDrafts[getMemberId(member)] = normalizeRole(member.role || 'member')
  }
}

async function loadNation() {
  if (!auth.accessToken) {
    loading.value = false
    return
  }

  loading.value = true

  try {
    const data = await getMyNation(auth.accessToken)
    applyNation(data)
  } catch {
    nation.value = null
  } finally {
    loading.value = false
  }
}

function onFileChange(slot, event) {
  selectedFiles[slot] = event?.target?.files?.[0] || null
}

async function uploadAsset(slot) {
  if (!auth.accessToken || !selectedFiles[slot]) return

  uploading[slot] = true

  try {
    let data = null

    if (slot === 'icon') data = await uploadNationIcon(auth.accessToken, selectedFiles[slot])
    if (slot === 'banner') data = await uploadNationBanner(auth.accessToken, selectedFiles[slot])
    if (slot === 'background') data = await uploadNationBackground(auth.accessToken, selectedFiles[slot])

    if (data) {
      applyNation(data)
    } else {
      await loadNation()
    }

    selectedFiles[slot] = null
    toastSuccess('Изображение обновлено.')
  } catch (error) {
    toastError(error?.message || 'Не удалось загрузить изображение.')
  } finally {
    uploading[slot] = false
  }
}

async function removeAsset(slot) {
  if (!auth.accessToken) return

  uploading[slot] = true

  try {
    let data = null

    if (slot === 'icon') data = await deleteNationIcon(auth.accessToken)
    if (slot === 'banner') data = await deleteNationBanner(auth.accessToken)
    if (slot === 'background') data = await deleteNationBackground(auth.accessToken)

    if (data) {
      applyNation(data)
    } else {
      await loadNation()
    }

    toastSuccess('Изображение удалено.')
  } catch (error) {
    toastError(error?.message || 'Не удалось удалить изображение.')
  } finally {
    uploading[slot] = false
  }
}

async function saveProfile() {
  if (!auth.accessToken) return

  saving.value = true

  try {
    const payload = {
      title: form.title?.trim() || null,
      slug: form.slug?.trim() || null,
      tag: form.tag?.trim().toUpperCase() || null,
      short_description: form.short_description?.trim() || null,
      description: form.description?.trim() || null,
      accent_color: normalizeHexColor(form.accent_color),
      recruitment_policy: form.recruitment_policy || 'request',
      is_public: Boolean(form.is_public),
    }

    const data = isEditMode.value
      ? await updateMyNation(auth.accessToken, payload)
      : await createNation(auth.accessToken, payload)

    applyNation(data)
    toastSuccess(isEditMode.value ? 'Государство сохранено.' : 'Государство создано.')
  } catch (error) {
    toastError(error?.message || 'Не удалось сохранить государство.')
  } finally {
    saving.value = false
  }
}

async function leaveMyNationAction() {
  if (!auth.accessToken || !isEditMode.value) return

  const confirmed = window.confirm('Точно выйти из государства?')
  if (!confirmed) return

  leaving.value = true

  try {
    await leaveMyNation(auth.accessToken)
    nation.value = null
    form.title = ''
    form.slug = ''
    form.tag = ''
    form.short_description = ''
    form.description = ''
    form.accent_color = '#6d5df6'
    form.recruitment_policy = 'request'
    form.is_public = true
    toastSuccess('Ты вышел из государства.')
  } catch (error) {
    toastError(error?.message || 'Не удалось выйти из государства.')
  } finally {
    leaving.value = false
  }
}

async function changeMemberRole(member) {
  if (!auth.accessToken || !nation.value) return

  const memberId = getMemberId(member)
  const targetRole = roleDrafts[memberId]
  if (!targetRole || normalizeRole(member.role) === targetRole) return

  memberBusy[memberId] = true

  try {
    const data = await updateNationMemberRole(auth.accessToken, nation.value.slug, memberId, targetRole)
    applyNation(data)
    toastSuccess('Роль участника обновлена.')
  } catch (error) {
    toastError(error?.message || 'Не удалось изменить роль.')
  } finally {
    memberBusy[memberId] = false
  }
}

async function makeLeader(member) {
  if (!auth.accessToken || !nation.value) return

  const memberId = getMemberId(member)
  const confirmed = window.confirm(`Передать лидерство игроку ${getMemberName(member)}?`)
  if (!confirmed) return

  memberBusy[memberId] = true

  try {
    const data = await transferNationLeadership(auth.accessToken, nation.value.slug, memberId)
    applyNation(data)
    toastSuccess('Лидерство передано.')
  } catch (error) {
    toastError(error?.message || 'Не удалось передать лидерство.')
  } finally {
    memberBusy[memberId] = false
  }
}

async function kickMember(member) {
  if (!auth.accessToken || !nation.value) return

  const memberId = getMemberId(member)
  const confirmed = window.confirm(`Удалить игрока ${getMemberName(member)} из государства?`)
  if (!confirmed) return

  memberBusy[memberId] = true

  try {
    const data = await removeNationMember(auth.accessToken, nation.value.slug, memberId)
    applyNation(data)
    toastSuccess('Участник удалён.')
  } catch (error) {
    toastError(error?.message || 'Не удалось удалить участника.')
  } finally {
    memberBusy[memberId] = false
  }
}

onMounted(loadNation)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card overflow-hidden p-0">
        <div class="relative h-44 overflow-hidden border-b border-white/10 bg-slate-950 md:h-52">
          <img
            v-if="currentAssets.banner"
            :src="currentAssets.banner"
            alt="banner"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="h-full w-full"
            :style="{
              background: `radial-gradient(circle at top left, ${form.accent_color}55, transparent 34%), linear-gradient(135deg, rgba(15,23,42,.92), rgba(9,14,27,1))`,
            }"
          ></div>
        </div>

        <div class="p-5 md:p-6">
          <header class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div class="min-w-0">
              <div class="flex min-w-0 items-center gap-4">
                <div
                  class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/5"
                >
                  <img
                    v-if="currentAssets.icon"
                    :src="currentAssets.icon"
                    alt="icon"
                    class="h-full w-full object-cover"
                  />
                  <span v-else class="text-xl font-black text-white">
                    {{ (form.tag || 'VR').slice(0, 2) }}
                  </span>
                </div>

                <div class="min-w-0">
                  <div class="section-kicker">Студия государства</div>
                  <h1 class="truncate text-2xl font-black text-white md:text-4xl">
                    {{ form.title || 'Новое государство' }}
                  </h1>
                  <p class="mt-2 break-all text-sm leading-6 text-slate-400">
                    {{ publicNationUrl || 'Сначала укажи slug, чтобы получить публичную ссылку.' }}
                  </p>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap gap-2.5">
                <span class="inline-chip">{{ formatRecruitmentLabel(form.recruitment_policy) }}</span>
                <span class="inline-chip inline-chip--subtle">
                  {{ form.is_public ? 'Публичное' : 'Скрытое' }}
                </span>
              </div>
            </div>

            <div class="grid w-full max-w-[360px] grid-cols-3 gap-3">
              <div class="stat-badge">
                <span class="stat-badge__value">{{ leaderCount }}</span>
                <span class="stat-badge__label">лидеры</span>
              </div>
              <div class="stat-badge">
                <span class="stat-badge__value">{{ officerCount }}</span>
                <span class="stat-badge__label">офицеры</span>
              </div>
              <div class="stat-badge">
                <span class="stat-badge__value">{{ memberCount }}</span>
                <span class="stat-badge__label">участники</span>
              </div>
            </div>
          </header>
        </div>
      </section>

      <div v-if="loading" class="surface-card p-8 text-center">
        <span class="spinner spinner-lg"></span>
      </div>

      <div v-else class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="space-y-6">
          <section class="surface-card p-5 md:p-6">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="section-kicker">Основное</div>
                <h2 class="section-title !text-[1.7rem]">Настройки государства</h2>
                <p class="section-subtitle">
                  Только важные поля и удобное управление без лишнего шума.
                </p>
              </div>

              <button class="btn btn-primary" :disabled="saving" @click="saveProfile">
                <span v-if="saving" class="spinner"></span>
                <span>{{ saving ? 'Сохраняем...' : isEditMode ? 'Сохранить' : 'Создать' }}</span>
              </button>
            </div>

            <div class="mt-5 grid gap-4 md:grid-cols-2">
              <label class="form-control">
                <span class="field-label">Название</span>
                <input v-model="form.title" class="input" maxlength="48" />
              </label>

              <label class="form-control">
                <span class="field-label">Тег</span>
                <input v-model="form.tag" class="input uppercase" maxlength="12" />
              </label>

              <label class="form-control">
                <span class="field-label">Slug</span>
                <input v-model="form.slug" class="input" maxlength="48" />
              </label>

              <label class="form-control">
                <span class="field-label">Основной цвет</span>
                <div class="compact-color-field">
                  <input
                    v-model="form.accent_color"
                    type="color"
                    class="compact-color-field__picker"
                  />
                  <input
                    v-model="form.accent_color"
                    class="compact-color-field__code"
                    maxlength="7"
                  />
                </div>
              </label>

              <label class="form-control md:col-span-2">
                <span class="field-label">Короткое описание</span>
                <input v-model="form.short_description" class="input" maxlength="140" />
              </label>

              <label class="form-control md:col-span-2">
                <span class="field-label">Полное описание</span>
                <textarea
                  v-model="form.description"
                  class="textarea min-h-[140px]"
                  maxlength="2000"
                ></textarea>
              </label>
            </div>

            <div class="mt-4 flex flex-wrap gap-2.5">
              <button
                v-for="color in colorPresets"
                :key="color"
                type="button"
                class="compact-color-swatch"
                :style="{ backgroundColor: color }"
                @click="form.accent_color = color"
              ></button>
            </div>

            <div class="nation-form-lower mt-6">
              <label class="form-control">
                <span class="field-label">Режим вступления</span>
                <select v-model="form.recruitment_policy" class="select">
                  <option value="open">Свободное вступление</option>
                  <option value="request">По заявке</option>
                  <option value="invite_only">Только по приглашению</option>
                </select>
              </label>

              <label class="visibility-option visibility-option--compact">
                <div class="min-w-0">
                  <p class="visibility-option__title">Публичная страница</p>
                  <p class="visibility-option__text">
                    Если выключить, государство не будет видно другим игрокам по ссылке.
                  </p>
                </div>
                <input v-model="form.is_public" type="checkbox" class="compact-toggle" />
              </label>
            </div>

            <div class="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-6">
              <button class="btn btn-primary" :disabled="saving" @click="saveProfile">
                <span v-if="saving" class="spinner"></span>
                <span>
                  {{ saving ? 'Сохраняем...' : isEditMode ? 'Сохранить изменения' : 'Создать государство' }}
                </span>
              </button>

              <button
                v-if="isEditMode"
                class="btn btn-ghost"
                :disabled="leaving"
                @click="leaveMyNationAction"
              >
                <span v-if="leaving" class="spinner"></span>
                <span>{{ leaving ? 'Выходим...' : 'Выйти из государства' }}</span>
              </button>

              <RouterLink v-if="publicNationUrl" :to="`/nation/${form.slug}`" class="btn btn-outline">
                Открыть страницу
              </RouterLink>
            </div>
          </section>

          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker">Участники</div>
            <h2 class="section-title !text-[1.7rem]">Состав и роли</h2>
            <p class="section-subtitle">
              Компактные строки без лишней ширины и с понятными действиями.
            </p>

            <div class="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-slate-300">
              <span class="font-semibold text-white">Твоя роль:</span>
              {{ formatRoleLabel(viewerRole) || '—' }}.
              Лидер может менять роли, удалять участников и передавать лидерство.
              Офицер управляет обычными участниками.
            </div>

            <div class="mt-5 grid gap-3">
              <article
                v-for="member in members"
                :key="getMemberId(member)"
                class="member-row"
              >
                <div class="member-row__main">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="truncate text-base font-bold text-white">
                        {{ getMemberName(member) }}
                      </h3>
                      <span class="inline-chip inline-chip--subtle">
                        {{ formatRoleLabel(member.role) }}
                      </span>
                    </div>

                    <p v-if="getMemberHandle(member)" class="member-row__meta">
                      @{{ getMemberHandle(member) }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="canManageMembers && canManageTarget(member)"
                  class="member-row__actions"
                >
                  <select
                    v-model="roleDrafts[getMemberId(member)]"
                    class="select member-row__select"
                    :disabled="memberBusy[getMemberId(member)]"
                  >
                    <option value="member">Участник</option>
                    <option value="officer">Офицер</option>
                    <option value="leader" disabled>Лидер</option>
                  </select>

                  <button
                    class="btn btn-light btn-sm"
                    :disabled="memberBusy[getMemberId(member)]"
                    @click="changeMemberRole(member)"
                  >
                    Применить
                  </button>

                  <button
                    v-if="canTransferLeadershipTo(member)"
                    class="btn btn-ghost btn-sm"
                    :disabled="memberBusy[getMemberId(member)]"
                    @click="makeLeader(member)"
                  >
                    Лидерство
                  </button>

                  <button
                    class="btn btn-ghost btn-sm member-row__danger"
                    :disabled="memberBusy[getMemberId(member)]"
                    @click="kickMember(member)"
                  >
                    Удалить
                  </button>
                </div>
              </article>

              <div v-if="!members.length" class="action-card text-sm text-slate-400">
                Участников пока нет.
              </div>
            </div>
          </section>
        </div>

        <aside class="space-y-6">
          <section class="surface-card p-5 md:p-6">
            <div class="section-kicker">Медиа</div>
            <h2 class="text-xl font-black text-slate-50 md:text-2xl">Оформление</h2>

            <div class="mt-5 grid gap-4">
              <div class="media-upload-card">
                <div class="media-upload-card__head">
                  <div class="min-w-0">
                    <p class="media-upload-card__title">Иконка</p>
                    <p class="media-upload-card__status">
                      {{ currentAssets.icon ? 'Файл уже загружен' : 'Файл не выбран' }}
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  class="input media-upload-card__file"
                  @change="onFileChange('icon', $event)"
                />

                <p v-if="selectedFileNames.icon" class="media-upload-card__filename">
                  {{ selectedFileNames.icon }}
                </p>

                <div class="media-upload-card__actions">
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    :disabled="uploading.icon || !selectedFiles.icon"
                    @click="uploadAsset('icon')"
                  >
                    {{ uploading.icon ? 'Загрузка...' : 'Загрузить' }}
                  </button>

                  <button
                    v-if="currentAssets.icon"
                    type="button"
                    class="btn btn-outline btn-sm"
                    :disabled="uploading.icon"
                    @click="removeAsset('icon')"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <div class="media-upload-card">
                <div class="media-upload-card__head">
                  <div class="min-w-0">
                    <p class="media-upload-card__title">Баннер</p>
                    <p class="media-upload-card__status">
                      {{ currentAssets.banner ? 'Файл уже загружен' : 'Файл не выбран' }}
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  class="input media-upload-card__file"
                  @change="onFileChange('banner', $event)"
                />

                <p v-if="selectedFileNames.banner" class="media-upload-card__filename">
                  {{ selectedFileNames.banner }}
                </p>

                <div class="media-upload-card__actions">
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    :disabled="uploading.banner || !selectedFiles.banner"
                    @click="uploadAsset('banner')"
                  >
                    {{ uploading.banner ? 'Загрузка...' : 'Загрузить' }}
                  </button>

                  <button
                    v-if="currentAssets.banner"
                    type="button"
                    class="btn btn-outline btn-sm"
                    :disabled="uploading.banner"
                    @click="removeAsset('banner')"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <div class="media-upload-card">
                <div class="media-upload-card__head">
                  <div class="min-w-0">
                    <p class="media-upload-card__title">Фон страницы</p>
                    <p class="media-upload-card__status">
                      {{ currentAssets.background ? 'Файл уже загружен' : 'Файл не выбран' }}
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  class="input media-upload-card__file"
                  @change="onFileChange('background', $event)"
                />

                <p v-if="selectedFileNames.background" class="media-upload-card__filename">
                  {{ selectedFileNames.background }}
                </p>

                <div class="media-upload-card__actions">
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    :disabled="uploading.background || !selectedFiles.background"
                    @click="uploadAsset('background')"
                  >
                    {{ uploading.background ? 'Загрузка...' : 'Загрузить' }}
                  </button>

                  <button
                    v-if="currentAssets.background"
                    type="button"
                    class="btn btn-outline btn-sm"
                    :disabled="uploading.background"
                    @click="removeAsset('background')"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </section>
</template>