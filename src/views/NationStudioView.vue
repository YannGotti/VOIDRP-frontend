<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import NationMediaSlotCard from '../features/nations/components/NationMediaSlotCard.vue'
import NationStudioPreview from '../features/nations/components/NationStudioPreview.vue'
import {
  createNation,
  deleteNationBackground,
  deleteNationBanner,
  deleteNationIcon,
  getMyNation,
  leaveMyNation,
  updateMyNation,
  uploadNationBackground,
  uploadNationBanner,
  uploadNationIcon,
} from '../services/nationsApi'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const leaving = ref(false)
const error = ref('')
const success = ref('')
const nation = ref(null)

const selectedFiles = reactive({ icon: null, banner: null, background: null })
const uploading = reactive({ icon: false, banner: false, background: false })

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

const publicNationUrl = computed(() => {
  const slug = form.slug?.trim() || nation.value?.slug || ''
  if (!slug || typeof window === 'undefined') return ''
  return `${window.location.origin}/nation/${slug}`
})

const isEditMode = computed(() => Boolean(nation.value))

function hydrateForm(payload) {
  nation.value = payload
  form.title = payload?.title || ''
  form.slug = payload?.slug || ''
  form.tag = payload?.tag || ''
  form.short_description = payload?.short_description || ''
  form.description = payload?.description || ''
  form.accent_color = payload?.accent_color || '#6d5df6'
  form.recruitment_policy = payload?.recruitment_policy || 'request'
  form.is_public = Boolean(payload?.is_public)
}

async function loadNation() {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const payload = await getMyNation(auth.accessToken)
    if (payload) hydrateForm(payload)
    else nation.value = null
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить государство.'
  } finally {
    loading.value = false
  }
}

async function saveNation() {
  saving.value = true
  error.value = ''
  success.value = ''

  const payload = {
    title: form.title?.trim() || null,
    slug: form.slug?.trim() || null,
    tag: form.tag?.trim() || null,
    short_description: form.short_description?.trim() || null,
    description: form.description?.trim() || null,
    accent_color: form.accent_color?.trim() || null,
    recruitment_policy: form.recruitment_policy,
    is_public: form.is_public,
  }

  try {
    const response = isEditMode.value
      ? await updateMyNation(auth.accessToken, payload)
      : await createNation(auth.accessToken, payload)
    hydrateForm(response)
    success.value = isEditMode.value ? 'Государство обновлено.' : 'Государство создано.'
  } catch (err) {
    error.value = err.message || 'Не удалось сохранить государство.'
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
    let response = null
    if (slot === 'icon') response = await uploadNationIcon(auth.accessToken, file)
    if (slot === 'banner') response = await uploadNationBanner(auth.accessToken, file)
    if (slot === 'background') response = await uploadNationBackground(auth.accessToken, file)
    selectedFiles[slot] = null
    if (response?.nation) hydrateForm(response.nation)
    success.value = response?.message || 'Изображение обновлено.'
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
    let response = null
    if (slot === 'icon') response = await deleteNationIcon(auth.accessToken)
    if (slot === 'banner') response = await deleteNationBanner(auth.accessToken)
    if (slot === 'background') response = await deleteNationBackground(auth.accessToken)
    selectedFiles[slot] = null
    if (response?.nation) hydrateForm(response.nation)
    success.value = response?.message || 'Изображение удалено.'
  } catch (err) {
    error.value = err.message || 'Не удалось удалить изображение.'
  } finally {
    uploading[slot] = false
  }
}

async function leaveNation() {
  if (!window.confirm('Ты точно хочешь выйти из государства?')) return
  leaving.value = true
  error.value = ''
  success.value = ''
  try {
    await leaveMyNation(auth.accessToken)
    nation.value = null
    success.value = 'Ты вышел из государства.'
    Object.assign(form, { title: '', slug: '', tag: '', short_description: '', description: '', accent_color: '#6d5df6', recruitment_policy: 'request', is_public: true })
  } catch (err) {
    error.value = err.message || 'Не удалось выйти из государства.'
  } finally {
    leaving.value = false
  }
}

onMounted(loadNation)
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
              <div class="section-kicker !mb-2">Государство</div>
              <h1 class="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">{{ isEditMode ? 'Управление государством' : 'Создание государства' }}</h1>
              <p class="mt-2 text-sm leading-6 text-slate-600 md:text-[15px]">Большой баннер, иконка, фон страницы, цвет и описание — всё в той же player-first системе, что и профиль игрока.</p>
            </div>

            <div class="flex flex-wrap gap-3">
              <RouterLink to="/nations" class="btn btn-outline rounded-2xl">Все государства</RouterLink>
              <RouterLink v-if="publicNationUrl" :to="`/nation/${form.slug || nation?.slug}`" class="btn btn-outline rounded-2xl">Открыть страницу</RouterLink>
              <button type="button" class="btn btn-primary rounded-2xl" :disabled="saving" @click="saveNation">
                <span v-if="saving" class="loading loading-spinner loading-sm"></span>
                <span v-else>{{ isEditMode ? 'Сохранить' : 'Создать государство' }}</span>
              </button>
            </div>
          </div>

          <p v-if="error" class="mt-4 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{{ error }}</p>
          <p v-if="success" class="mt-4 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{{ success }}</p>
        </section>

        <div class="grid gap-5 xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
          <aside class="space-y-5">
            <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
              <div class="section-kicker !mb-2">Превью</div>
              <h2 class="text-xl font-black text-slate-950 md:text-2xl">Как страница выглядит</h2>
              <div class="mt-5">
                <NationStudioPreview :nation="nation" :form="form" :public-nation-url="publicNationUrl" />
              </div>
            </section>

            <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
              <div class="section-kicker !mb-2">Акцент</div>
              <h2 class="text-xl font-black text-slate-950 md:text-2xl">Цвет государства</h2>

              <div class="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <div class="flex items-center gap-4">
                  <input v-model="form.accent_color" type="color" class="h-14 w-16 cursor-pointer rounded-2xl border border-slate-200 bg-white p-1" />
                  <input v-model="form.accent_color" type="text" class="input input-bordered h-14 flex-1 rounded-2xl" placeholder="#6d5df6" />
                </div>

                <div class="mt-4 flex flex-wrap gap-3">
                  <button v-for="color in colorPresets" :key="color" type="button" class="h-10 w-10 rounded-full border border-slate-200 shadow-sm transition hover:scale-105" :style="{ backgroundColor: color }" @click="form.accent_color = color"></button>
                </div>
              </div>
            </section>
          </aside>

          <div class="space-y-5">
            <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
              <div class="section-kicker !mb-2">Оформление</div>
              <h2 class="text-xl font-black text-slate-950 md:text-2xl">Картинки государства</h2>

              <div class="mt-5 space-y-4">
                <NationMediaSlotCard title="Баннер" subtitle="Широкая верхняя обложка страницы государства." variant="banner" :preview-url="nation?.assets?.banner_url || nation?.assets?.banner_preview_url || ''" :selected-file-name="selectedFileNames.banner" :uploading="uploading.banner" :has-asset="Boolean(nation?.assets?.banner_url || nation?.assets?.banner_preview_url)" recommendation="PNG/JPEG/WEBP, до 2 MB, желательно 1600×400 и шире." @select-file="onFileSelected('banner', $event)" @upload="uploadSelected('banner')" @remove="removeAsset('banner')" />
                <NationMediaSlotCard title="Иконка" subtitle="Главный знак государства рядом с названием." variant="icon" :preview-url="nation?.assets?.icon_url || nation?.assets?.icon_preview_url || ''" :selected-file-name="selectedFileNames.icon" :uploading="uploading.icon" :has-asset="Boolean(nation?.assets?.icon_url || nation?.assets?.icon_preview_url)" recommendation="PNG/JPEG/WEBP, квадрат, до 512 KB." @select-file="onFileSelected('icon', $event)" @upload="uploadSelected('icon')" @remove="removeAsset('icon')" />
                <NationMediaSlotCard title="Фон страницы" subtitle="Широкий фон под всем полотном публичной страницы." variant="background" :preview-url="nation?.assets?.background_url || nation?.assets?.background_preview_url || ''" :selected-file-name="selectedFileNames.background" :uploading="uploading.background" :has-asset="Boolean(nation?.assets?.background_url || nation?.assets?.background_preview_url)" recommendation="PNG/JPEG/WEBP, до 3 MB, желательно 1600×900." @select-file="onFileSelected('background', $event)" @upload="uploadSelected('background')" @remove="removeAsset('background')" />
              </div>
            </section>

            <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
              <div class="section-kicker !mb-2">Текст</div>
              <h2 class="text-xl font-black text-slate-950 md:text-2xl">Название и описание</h2>

              <div class="mt-5 grid gap-4">
                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-700">Название</span>
                  <input v-model="form.title" type="text" maxlength="64" class="input input-bordered rounded-2xl" placeholder="Королевство Dawn" />
                </label>

                <div class="grid gap-4 md:grid-cols-[1fr_160px]">
                  <label class="form-control">
                    <span class="mb-2 text-sm font-semibold text-slate-700">Slug</span>
                    <input v-model="form.slug" type="text" maxlength="64" class="input input-bordered rounded-2xl" placeholder="kingdom-dawn" />
                  </label>

                  <label class="form-control">
                    <span class="mb-2 text-sm font-semibold text-slate-700">Тег</span>
                    <input v-model="form.tag" type="text" maxlength="8" class="input input-bordered rounded-2xl" placeholder="DAWN" />
                  </label>
                </div>

                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-700">Короткое описание</span>
                  <input v-model="form.short_description" type="text" maxlength="140" class="input input-bordered rounded-2xl" placeholder="Торговля, строительство, дипломатия" />
                </label>

                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-700">Полное описание</span>
                  <textarea v-model="form.description" rows="6" maxlength="5000" class="textarea textarea-bordered rounded-2xl" placeholder="Подробно расскажи о государстве, его идеях и правилах."></textarea>
                </label>
              </div>
            </section>

            <section class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
              <div class="section-kicker !mb-2">Правила вступления</div>
              <h2 class="text-xl font-black text-slate-950 md:text-2xl">Как игроки попадают внутрь</h2>

              <div class="mt-5 grid gap-4">
                <label class="form-control">
                  <span class="mb-2 text-sm font-semibold text-slate-700">Режим вступления</span>
                  <select v-model="form.recruitment_policy" class="select select-bordered rounded-2xl">
                    <option value="open">Свободное вступление</option>
                    <option value="request">По заявке</option>
                    <option value="invite_only">Только по приглашению</option>
                  </select>
                </label>

                <label class="flex items-start gap-4 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                  <input v-model="form.is_public" type="checkbox" class="toggle toggle-primary mt-1" />
                  <div>
                    <p class="font-semibold text-slate-900">Публичная страница</p>
                    <p class="mt-1 text-sm leading-6 text-slate-600">Если выключить, государство не будет доступно по прямой ссылке другим игрокам.</p>
                  </div>
                </label>
              </div>

              <div v-if="isEditMode" class="mt-6 border-t border-slate-200 pt-6">
                <button type="button" class="btn btn-ghost rounded-2xl text-rose-700" :disabled="leaving" @click="leaveNation">
                  <span v-if="leaving" class="loading loading-spinner loading-sm"></span>
                  <span v-else>Выйти из государства</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
