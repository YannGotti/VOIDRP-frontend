<script setup>
import {computed, onMounted, reactive, ref, watch} from 'vue'
import { RouterLink } from 'vue-router'
import ProfileMediaSlotCard from '../features/profile/components/ProfileMediaSlotCard.vue'
import PublicProfileStudioPreview from '../features/profile/components/PublicProfileStudioPreview.vue'
import {
  deleteAvatar,
  deleteBackground,
  deleteBanner,
  getMyPublicProfile,
  updateMyPublicProfile,
  uploadAvatar,
  uploadBackground,
  uploadBanner,
} from '../services/profileApi'
import { toastError, toastSuccess } from '../services/toast'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')
const profile = ref(null)

const selectedFiles = reactive({
  avatar: null,
  banner: null,
  background: null,
})

const uploading = reactive({
  avatar: false,
  banner: false,
  background: false,
})

const form = reactive({
  slug: '',
  display_name: '',
  bio: '',
  status_text: '',
  theme_mode: 'default',
  accent_color: '#8b5cf6',
  is_public: true,
  allow_followers_list_public: true,
  allow_friends_list_public: true,
})

const colorPresets = ['#8b5cf6', '#7c3aed', '#3b82f6', '#14b8a6', '#ef4444', '#f59e0b', '#ec4899']

const selectedFileNames = computed(() => ({
  avatar: selectedFiles.avatar?.name || '',
  banner: selectedFiles.banner?.name || '',
  background: selectedFiles.background?.name || '',
}))

const publicSlug = computed(() => form.slug?.trim() || profile.value?.slug || '')
const publicProfileUrl = computed(() => {
  if (!publicSlug.value || typeof window === 'undefined') return ''
  return `${window.location.origin}/u/${publicSlug.value}`
})

const completionItems = computed(() => {
  const assets = profile.value?.assets || {}
  return [
    { key: 'slug', label: 'Ссылка', ready: Boolean(form.slug?.trim()), missingText: 'Добавь slug, чтобы страница открывалась по красивой ссылке.' },
    { key: 'display_name', label: 'Имя', ready: Boolean(form.display_name?.trim()), missingText: 'Укажи отображаемое имя.' },
    { key: 'status_text', label: 'Статус', ready: Boolean(form.status_text?.trim()), missingText: 'Добавь короткую строку под именем.' },
    { key: 'bio', label: 'Описание', ready: Boolean(form.bio?.trim()), missingText: 'Заполни блок «О себе».' },
    { key: 'avatar', label: 'Аватар', ready: Boolean(assets.avatar_url || assets.avatar_preview_url), missingText: 'Загрузи аватар.' },
    { key: 'banner', label: 'Баннер', ready: Boolean(assets.banner_url || assets.banner_preview_url), missingText: 'Загрузи баннер.' },
    { key: 'background', label: 'Фон', ready: Boolean(assets.background_url || assets.background_preview_url), missingText: 'Фон необязателен, но делает страницу богаче.', optional: true },
  ]
})

const completion = computed(() => {
  const done = completionItems.value.filter((item) => item.ready).length
  return Math.round((done / completionItems.value.length) * 100)
})

const requiredMissingItems = computed(() => completionItems.value.filter((item) => !item.ready && !item.optional))
const showCompletionHints = computed(() => requiredMissingItems.value.length > 0)
const showCompletionPanel = computed(() => completion.value < 100)

function hydrateForm(payload) {
  profile.value = payload
  form.slug = payload?.slug || ''
  form.display_name = payload?.display_name || ''
  form.bio = payload?.bio || ''
  form.status_text = payload?.status_text || ''
  form.theme_mode = payload?.theme_mode || 'default'
  form.accent_color = payload?.accent_color || '#8b5cf6'
  form.is_public = Boolean(payload?.is_public)
  form.allow_followers_list_public = Boolean(payload?.allow_followers_list_public)
  form.allow_friends_list_public = Boolean(payload?.allow_friends_list_public)
}

async function loadProfile() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = await getMyPublicProfile(authStore.accessToken)
    hydrateForm(payload)
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить публичный профиль.'
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  saving.value = true
  error.value = ''
  success.value = ''

  try {
    const payload = await updateMyPublicProfile(authStore.accessToken, {
      slug: form.slug?.trim() || null,
      display_name: form.display_name?.trim() || null,
      bio: form.bio?.trim() || null,
      status_text: form.status_text?.trim() || null,
      theme_mode: form.theme_mode || 'default',
      accent_color: form.accent_color?.trim() || null,
      is_public: form.is_public,
      allow_followers_list_public: form.allow_followers_list_public,
      allow_friends_list_public: form.allow_friends_list_public,
    })

    hydrateForm(payload)
    success.value = 'Профиль сохранён.'
  } catch (err) {
    error.value = err.message || 'Не удалось сохранить профиль.'
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

  uploading[slot] = true
  error.value = ''
  success.value = ''

  try {
    let payload = null
    if (slot === 'avatar') payload = await uploadAvatar(authStore.accessToken, file)
    if (slot === 'banner') payload = await uploadBanner(authStore.accessToken, file)
    if (slot === 'background') payload = await uploadBackground(authStore.accessToken, file)

    selectedFiles[slot] = null
    if (payload) hydrateForm(payload)
    else await loadProfile()

    success.value = 'Изображение загружено.'
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить изображение.'
  } finally {
    uploading[slot] = false
  }
}

async function removeAsset(slot) {
  uploading[slot] = true
  error.value = ''
  success.value = ''

  try {
    let payload = null
    if (slot === 'avatar') payload = await deleteAvatar(authStore.accessToken)
    if (slot === 'banner') payload = await deleteBanner(authStore.accessToken)
    if (slot === 'background') payload = await deleteBackground(authStore.accessToken)

    selectedFiles[slot] = null
    if (payload) hydrateForm(payload)
    else await loadProfile()

    success.value = 'Изображение удалено.'
  } catch (err) {
    error.value = err.message || 'Не удалось удалить изображение.'
  } finally {
    uploading[slot] = false
  }
}

async function copyPublicLink() {
  if (!publicProfileUrl.value) return

  try {
    await navigator.clipboard.writeText(publicProfileUrl.value)
    success.value = 'Ссылка скопирована.'
    error.value = ''
  } catch {
    error.value = 'Не удалось скопировать ссылку.'
  }
}

onMounted(loadProfile)
watch(error, (value) => { if (value) toastError(value) })
watch(success, (value) => { if (value) toastSuccess(value) })
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell">
      <div v-if="loading" class="space-y-5">
        <div class="skeleton h-28 rounded-[28px]"></div>
        <div class="grid gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <div class="skeleton h-[540px] rounded-[28px]"></div>
          <div class="space-y-5">
            <div class="skeleton h-[260px] rounded-[28px]"></div>
            <div class="skeleton h-[560px] rounded-[28px]"></div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-5">
        <section class="surface-card px-5 py-5 md:px-7 md:py-6">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-3xl">
              <div class="section-kicker !mb-2">Редактор профиля</div>
              <h1 class="text-2xl font-black tracking-tight text-slate-50 md:text-3xl">
                Внешний вид профиля
              </h1>
              <p class="mt-2 text-sm leading-6 text-slate-400 md:text-[15px]">
                Баннер отвечает только за верхнюю обложку. Фон меняет весь холст публичной страницы. Акцентный цвет должен быть заметен и на превью, и на реальном профиле.
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <RouterLink to="/profile" class="btn btn-outline rounded-2xl">Кабинет</RouterLink>
              <button v-if="publicProfileUrl" type="button" class="btn btn-outline rounded-2xl" @click="copyPublicLink">Копировать ссылку</button>
              <button type="button" class="btn btn-primary rounded-2xl" :disabled="saving" @click="saveProfile">
                <span v-if="saving" class="spinner"></span>
                <span v-else>Сохранить</span>
              </button>
            </div>
          </div>

          <div v-if="showCompletionPanel" class="mt-5 rounded-[20px] border border-white/10 bg-black/20 px-4 py-4">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-semibold text-slate-200">Готовность профиля</span>
              <span class="text-sm font-bold text-slate-300">{{ completion }}%</span>
            </div>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
              <div class="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all" :style="{ width: `${completion}%` }"></div>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div
                v-for="item in completionItems"
                :key="item.key"
                class="rounded-[18px] border px-4 py-3 text-sm"
                :class="item.ready ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-slate-950/50 text-slate-300'"
              >
                <p class="font-semibold">{{ item.label }}</p>
                <p class="mt-1 text-xs uppercase tracking-[0.14em]">
                  {{ item.ready ? 'Готово' : item.optional ? 'Необязательно' : 'Нужно заполнить' }}
                </p>
              </div>
            </div>

            <div v-if="showCompletionHints" class="mt-4 rounded-[18px] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              <p class="font-semibold">Что ещё можно дополнить:</p>
              <ul class="mt-2 list-disc space-y-1 pl-5">
                <li v-for="item in requiredMissingItems" :key="`missing-${item.key}`">{{ item.missingText }}</li>
              </ul>
            </div>
          </div>

        </section>

        <div class="grid gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <aside class="space-y-5">
            <section class="surface-card p-5 md:p-6">
              <div class="section-kicker !mb-2">Превью</div>
              <h2 class="text-xl font-black text-slate-50 md:text-2xl">Как страница выглядит</h2>
              <p class="mt-2 text-sm leading-6 text-slate-400">
                Здесь фон страницы отделён от баннера. Баннер влияет только на hero, а фон — на весь профиль.
              </p>

              <div class="mt-5">
                <PublicProfileStudioPreview :profile="profile" :form="form" :public-profile-url="publicProfileUrl" />
              </div>
            </section>

            <section class="surface-card p-5 md:p-6">
              <div class="section-kicker !mb-2">Акцент</div>
              <h2 class="text-xl font-black text-slate-50 md:text-2xl">Цвет страницы</h2>

              <div class="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div class="flex items-center gap-4">
                  <input v-model="form.accent_color" type="color" class="h-14 w-16 cursor-pointer rounded-2xl border border-white/10 bg-transparent p-1" />
                  <input v-model="form.accent_color" type="text" class="input h-14 flex-1 rounded-2xl" placeholder="#8b5cf6" />
                </div>

                <div class="mt-4 flex flex-wrap gap-3">
                  <button
                    v-for="color in colorPresets"
                    :key="color"
                    type="button"
                    class="h-10 w-10 rounded-full border border-white/10 shadow-sm transition hover:scale-105"
                    :style="{ backgroundColor: color }"
                    @click="form.accent_color = color"
                  ></button>
                </div>
              </div>
            </section>
          </aside>

          <div class="space-y-5">
            <section class="surface-card p-5 md:p-6">
              <div class="section-kicker !mb-2">Оформление</div>
              <h2 class="text-xl font-black text-slate-50 md:text-2xl">Картинки профиля</h2>

              <div class="mt-5 space-y-4">
                <ProfileMediaSlotCard
                  title="Баннер"
                  subtitle="Верхняя широкая обложка профиля. Используется только в hero-блоке."
                  slot-name="banner"
                  variant="banner"
                  :preview-url="profile?.assets?.banner_url || profile?.assets?.banner_preview_url || ''"
                  :selected-file-name="selectedFileNames.banner"
                  :uploading="uploading.banner"
                  :has-asset="Boolean(profile?.assets?.banner_url || profile?.assets?.banner_preview_url)"
                  recommendation="PNG/JPEG/WEBP, до 2 MB, желательно 16:9."
                  @select-file="onFileSelected('banner', $event)"
                  @upload="uploadSelected('banner')"
                  @remove="removeAsset('banner')"
                />

                <ProfileMediaSlotCard
                  title="Аватар"
                  subtitle="Главное изображение рядом с именем."
                  slot-name="avatar"
                  variant="avatar"
                  :preview-url="profile?.assets?.avatar_url || profile?.assets?.avatar_preview_url || ''"
                  :selected-file-name="selectedFileNames.avatar"
                  :uploading="uploading.avatar"
                  :has-asset="Boolean(profile?.assets?.avatar_url || profile?.assets?.avatar_preview_url)"
                  recommendation="PNG/JPEG/WEBP, квадрат, до 512 KB."
                  @select-file="onFileSelected('avatar', $event)"
                  @upload="uploadSelected('avatar')"
                  @remove="removeAsset('avatar')"
                />

                <ProfileMediaSlotCard
                  title="Фон страницы"
                  subtitle="Отдельный слой для всего полотна страницы. Не заменяет баннер."
                  slot-name="background"
                  variant="background"
                  :preview-url="profile?.assets?.background_url || profile?.assets?.background_preview_url || ''"
                  :selected-file-name="selectedFileNames.background"
                  :uploading="uploading.background"
                  :has-asset="Boolean(profile?.assets?.background_url || profile?.assets?.background_preview_url)"
                  recommendation="PNG/JPEG/WEBP, до 3 MB, желательно 1600×900 или шире."
                  @select-file="onFileSelected('background', $event)"
                  @upload="uploadSelected('background')"
                  @remove="removeAsset('background')"
                />
              </div>
            </section>

            <section class="surface-card p-5 md:p-6">
              <div class="section-kicker !mb-2">Текст</div>
              <h2 class="text-xl font-black text-slate-50 md:text-2xl">Имя и описание</h2>

              <div class="mt-5 grid gap-4">
                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-300">Отображаемое имя</span>
                  <input v-model="form.display_name" type="text" maxlength="32" class="input rounded-2xl" placeholder="mironoouv" />
                </label>

                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-300">Slug профиля</span>
                  <input v-model="form.slug" type="text" maxlength="32" class="input rounded-2xl" placeholder="mironoouv" />
                </label>

                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-300">Короткий статус</span>
                  <input v-model="form.status_text" type="text" maxlength="120" class="input rounded-2xl" placeholder="Строю, исследую, собираю команду" />
                </label>

                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-300">Описание</span>
                  <textarea v-model="form.bio" rows="5" maxlength="1200" class="textarea rounded-2xl" placeholder="Расскажи немного о себе и стиле игры."></textarea>
                </label>
              </div>
            </section>

            <section class="surface-card p-5 md:p-6">
              <div class="section-kicker !mb-2">Приватность</div>
              <h2 class="text-xl font-black text-slate-50 md:text-2xl">Настройки видимости</h2>

              <div class="mt-5 grid gap-4">
                <label class="panel-card flex items-center justify-between gap-4 p-4">
                  <div>
                    <p class="font-semibold text-slate-100">Публичный профиль</p>
                    <p class="mt-1 text-sm leading-6 text-slate-400">Страница будет доступна другим игрокам по ссылке.</p>
                  </div>
                  <input v-model="form.is_public" type="checkbox" class="toggle" />
                </label>

                <label class="panel-card flex items-center justify-between gap-4 p-4">
                  <div>
                    <p class="font-semibold text-slate-100">Список подписчиков</p>
                    <p class="mt-1 text-sm leading-6 text-slate-400">Разрешить показывать другим игрокам подписчиков профиля.</p>
                  </div>
                  <input v-model="form.allow_followers_list_public" type="checkbox" class="toggle" />
                </label>

                <label class="panel-card flex items-center justify-between gap-4 p-4">
                  <div>
                    <p class="font-semibold text-slate-100">Список друзей</p>
                    <p class="mt-1 text-sm leading-6 text-slate-400">Разрешить показывать друзьям и другим игрокам этот блок.</p>
                  </div>
                  <input v-model="form.allow_friends_list_public" type="checkbox" class="toggle" />
                </label>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


