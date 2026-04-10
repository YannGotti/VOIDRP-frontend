<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
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
  accent_color: '#6d5df6',
  is_public: true,
  allow_followers_list_public: true,
  allow_friends_list_public: true,
})

const colorPresets = [
  '#6d5df6',
  '#4f46e5',
  '#2563eb',
  '#0f766e',
  '#0f172a',
  '#b91c1c',
  '#f59e0b',
]

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
    {
      key: 'slug',
      label: 'Ссылка профиля',
      ready: Boolean(form.slug?.trim()),
      missingText: 'Добавь slug, чтобы страница открывалась по красивой ссылке.',
    },
    {
      key: 'display_name',
      label: 'Имя профиля',
      ready: Boolean(form.display_name?.trim()),
      missingText: 'Укажи отображаемое имя.',
    },
    {
      key: 'status_text',
      label: 'Короткий статус',
      ready: Boolean(form.status_text?.trim()),
      missingText: 'Добавь короткую строку под именем.',
    },
    {
      key: 'bio',
      label: 'Описание',
      ready: Boolean(form.bio?.trim()),
      missingText: 'Заполни блок «О себе».',
    },
    {
      key: 'avatar',
      label: 'Аватар',
      ready: Boolean(assets.avatar_url || assets.avatar_preview_url),
      missingText: 'Загрузи аватар.',
    },
    {
      key: 'banner',
      label: 'Баннер',
      ready: Boolean(assets.banner_url || assets.banner_preview_url),
      missingText: 'Загрузи баннер.',
    },
    {
      key: 'background',
      label: 'Фон страницы',
      ready: Boolean(assets.background_url || assets.background_preview_url),
      missingText: 'Фон необязателен, но он делает страницу богаче.',
      optional: true,
    },
  ]
})

const completion = computed(() => {
  const done = completionItems.value.filter((item) => item.ready).length
  return Math.round((done / completionItems.value.length) * 100)
})

const missingItems = computed(() => {
  return completionItems.value.filter((item) => !item.ready)
})

function hydrateForm(payload) {
  profile.value = payload
  form.slug = payload?.slug || ''
  form.display_name = payload?.display_name || ''
  form.bio = payload?.bio || ''
  form.status_text = payload?.status_text || ''
  form.theme_mode = payload?.theme_mode || 'default'
  form.accent_color = payload?.accent_color || '#6d5df6'
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
        <section class="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:px-7 md:py-6">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-3xl">
              <div class="section-kicker !mb-2">Редактор профиля</div>
              <h1 class="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                Внешний вид профиля
              </h1>
              <p class="mt-2 text-sm leading-6 text-slate-600 md:text-[15px]">
                Баннер отвечает только за верхнюю обложку. Фон — за весь холст страницы. Акцентный цвет
                работает отдельно и не должен теряться даже при загруженных картинках.
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <RouterLink to="/profile" class="btn btn-outline rounded-2xl">
                Кабинет
              </RouterLink>

              <button
                v-if="publicProfileUrl"
                type="button"
                class="btn btn-outline rounded-2xl"
                @click="copyPublicLink"
              >
                Копировать ссылку
              </button>

              <button type="button" class="btn btn-primary rounded-2xl" :disabled="saving" @click="saveProfile">
                <span v-if="saving" class="loading loading-spinner loading-sm"></span>
                <span v-else>Сохранить</span>
              </button>
            </div>
          </div>

          <div class="mt-5 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-semibold text-slate-800">Готовность профиля</span>
              <span class="text-sm font-bold text-slate-700">{{ completion }}%</span>
            </div>
            <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                class="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-all"
                :style="{ width: `${completion}%` }"
              ></div>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div
                v-for="item in completionItems"
                :key="item.key"
                class="rounded-[18px] border px-4 py-3 text-sm"
                :class="item.ready ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700'"
              >
                <p class="font-semibold">{{ item.label }}</p>
                <p class="mt-1 text-xs uppercase tracking-[0.14em]">
                  {{ item.ready ? 'Готово' : item.optional ? 'Необязательно' : 'Нужно заполнить' }}
                </p>
              </div>
            </div>

            <div v-if="missingItems.length" class="mt-4 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p class="font-semibold">Что ещё можно дополнить:</p>
              <ul class="mt-2 space-y-1 list-disc pl-5">
                <li v-for="item in missingItems" :key="`missing-${item.key}`">
                  {{ item.missingText }}
                </li>
              </ul>
            </div>
          </div>

          <p v-if="error" class="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ error }}
          </p>

          <p v-if="success" class="mt-4 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {{ success }}
          </p>
        </section>

        <div class="grid gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <aside class="space-y-5">
            <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
              <div class="section-kicker !mb-2">Превью</div>
              <h2 class="text-xl font-black text-slate-950 md:text-2xl">Как страница выглядит</h2>
              <p class="mt-2 text-sm leading-6 text-slate-600">
                Здесь фон страницы отделён от баннера. Баннер влияет только на hero, а фон — на весь профиль.
              </p>

              <div class="mt-5">
                <PublicProfileStudioPreview
                  :profile="profile"
                  :form="form"
                  :public-profile-url="publicProfileUrl"
                />
              </div>
            </section>

            <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
              <div class="section-kicker !mb-2">Акцент</div>
              <h2 class="text-xl font-black text-slate-950 md:text-2xl">Цвет страницы</h2>

              <div class="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div class="flex items-center gap-4">
                  <input
                    v-model="form.accent_color"
                    type="color"
                    class="h-14 w-16 cursor-pointer rounded-2xl border border-slate-200 bg-white p-1"
                  />
                  <input
                    v-model="form.accent_color"
                    type="text"
                    class="input input-bordered h-14 flex-1 rounded-2xl"
                    placeholder="#6d5df6"
                  />
                </div>

                <div class="mt-4 flex flex-wrap gap-3">
                  <button
                    v-for="color in colorPresets"
                    :key="color"
                    type="button"
                    class="h-10 w-10 rounded-full border border-slate-200 shadow-sm transition hover:scale-105"
                    :style="{ backgroundColor: color }"
                    @click="form.accent_color = color"
                  ></button>
                </div>
              </div>
            </section>
          </aside>

          <div class="space-y-5">
            <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
              <div class="section-kicker !mb-2">Оформление</div>
              <h2 class="text-xl font-black text-slate-950 md:text-2xl">Картинки профиля</h2>

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

            <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
              <div class="section-kicker !mb-2">Текст</div>
              <h2 class="text-xl font-black text-slate-950 md:text-2xl">Имя и описание</h2>

              <div class="mt-5 grid gap-4">
                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-700">Отображаемое имя</span>
                  <input
                    v-model="form.display_name"
                    type="text"
                    maxlength="32"
                    class="input input-bordered rounded-2xl"
                    placeholder="mironoouv"
                  />
                </label>

                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-700">Slug профиля</span>
                  <input
                    v-model="form.slug"
                    type="text"
                    maxlength="32"
                    class="input input-bordered rounded-2xl"
                    placeholder="mironoouv"
                  />
                </label>

                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-700">Короткий статус</span>
                  <input
                    v-model="form.status_text"
                    type="text"
                    maxlength="120"
                    class="input input-bordered rounded-2xl"
                    placeholder="Строю, исследую, собираю команду"
                  />
                </label>

                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-700">Описание</span>
                  <textarea
                    v-model="form.bio"
                    rows="5"
                    maxlength="1200"
                    class="textarea textarea-bordered rounded-2xl"
                    placeholder="Расскажи немного о себе и стиле игры."
                  ></textarea>
                </label>
              </div>
            </section>

            <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
              <div class="section-kicker !mb-2">Приватность</div>
              <h2 class="text-xl font-black text-slate-950 md:text-2xl">Настройки видимости</h2>

              <div class="mt-5 grid gap-4">
                <label class="flex items-start gap-4 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <input v-model="form.is_public" type="checkbox" class="toggle toggle-primary mt-1" />
                  <div>
                    <p class="font-semibold text-slate-900">Публичный профиль</p>
                    <p class="mt-1 text-sm leading-6 text-slate-600">
                      Если выключить, страница не будет открываться другим игрокам.
                    </p>
                  </div>
                </label>

                <label class="flex items-start gap-4 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <input
                    v-model="form.allow_followers_list_public"
                    type="checkbox"
                    class="toggle toggle-primary mt-1"
                  />
                  <div>
                    <p class="font-semibold text-slate-900">Показывать подписчиков</p>
                  </div>
                </label>

                <label class="flex items-start gap-4 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <input
                    v-model="form.allow_friends_list_public"
                    type="checkbox"
                    class="toggle toggle-primary mt-1"
                  />
                  <div>
                    <p class="font-semibold text-slate-900">Показывать друзей</p>
                  </div>
                </label>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
