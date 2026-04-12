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

const currentAssets = computed(() => ({
  icon:
    nation.value?.assets?.icon_url ||
    nation.value?.assets?.icon_preview_url ||
    '',
  banner:
    nation.value?.assets?.banner_url ||
    nation.value?.assets?.banner_preview_url ||
    '',
  background:
    nation.value?.assets?.background_url ||
    nation.value?.assets?.background_preview_url ||
    '',
}))

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
    error.value = err?.message || 'Не удалось загрузить государство.'
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  saving.value = true
  error.value = ''
  success.value = ''

  const payload = {
    title: form.title.trim(),
    slug: form.slug.trim(),
    tag: form.tag.trim(),
    short_description: form.short_description.trim() || null,
    description: form.description.trim() || null,
    accent_color: form.accent_color,
    recruitment_policy: form.recruitment_policy,
    is_public: Boolean(form.is_public),
  }

  try {
    const response = isEditMode.value
      ? await updateMyNation(auth.accessToken, payload)
      : await createNation(auth.accessToken, payload)

    if (response) {
      hydrateForm(response)
    } else {
      await loadNation()
    }

    success.value = isEditMode.value
      ? 'Государство обновлено.'
      : 'Государство создано.'
  } catch (err) {
    error.value = err?.message || 'Не удалось сохранить государство.'
  } finally {
    saving.value = false
  }
}

function onFileChange(slot, event) {
  const file = event?.target?.files?.[0] || null
  selectedFiles[slot] = file
}

async function uploadAsset(slot) {
  const file = selectedFiles[slot]
  if (!file) return

  const handlers = {
    icon: uploadNationIcon,
    banner: uploadNationBanner,
    background: uploadNationBackground,
  }

  uploading[slot] = true
  error.value = ''
  success.value = ''

  try {
    await handlers[slot](auth.accessToken, file)
    selectedFiles[slot] = null
    await loadNation()
    success.value = 'Файл обновлён.'
  } catch (err) {
    error.value = err?.message || 'Не удалось загрузить файл.'
  } finally {
    uploading[slot] = false
  }
}

async function removeAsset(slot) {
  const handlers = {
    icon: deleteNationIcon,
    banner: deleteNationBanner,
    background: deleteNationBackground,
  }

  uploading[slot] = true
  error.value = ''
  success.value = ''

  try {
    await handlers[slot](auth.accessToken)
    await loadNation()
    success.value = 'Файл удалён.'
  } catch (err) {
    error.value = err?.message || 'Не удалось удалить файл.'
  } finally {
    uploading[slot] = false
  }
}

async function leaveMyNationAction() {
  if (!window.confirm('Точно выйти из государства?')) return

  leaving.value = true
  error.value = ''
  success.value = ''

  try {
    await leaveNation(auth.accessToken)
    nation.value = null
    form.title = ''
    form.slug = ''
    form.tag = ''
    form.short_description = ''
    form.description = ''
    form.accent_color = '#6d5df6'
    form.recruitment_policy = 'request'
    form.is_public = true
    success.value = 'Ты вышел из государства.'
  } catch (err) {
    error.value = err?.message || 'Не удалось выйти из государства.'
  } finally {
    leaving.value = false
  }
}

onMounted(loadNation)
</script>

<template>
  <section class="py-8 md:py-10">
    <div class="container-shell space-y-5">
      <section class="surface-card p-5 md:p-7">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div class="section-kicker !mb-2">Студия государства</div>
            <h1 class="text-3xl font-black tracking-tight text-slate-50 md:text-4xl">
              {{ isEditMode ? 'Управление государством' : 'Создание государства' }}
            </h1>
            <p class="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-[15px]">
              Название, оформление, правила вступления и публичная страница собраны
              в одном аккуратном интерфейсе.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <RouterLink v-if="publicNationUrl" :to="`/nation/${form.slug || nation?.slug}`" class="btn btn-outline">
              Публичная страница
            </RouterLink>
            <RouterLink to="/nations" class="btn btn-outline">
              Каталог государств
            </RouterLink>
          </div>
        </div>
      </section>

      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>

      <div v-if="loading" class="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div class="skeleton h-[520px] rounded-[28px]"></div>
        <div class="skeleton h-[520px] rounded-[28px]"></div>
      </div>

      <div v-else class="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <section class="surface-card p-5 md:p-6">
          <div class="section-kicker !mb-2">Основное</div>
          <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
            Параметры государства
          </h2>

          <div class="mt-5 grid gap-4 md:grid-cols-2">
            <label class="form-control md:col-span-2">
              <span class="field-label">Название</span>
              <input v-model="form.title" class="input" maxlength="80" required />
            </label>

            <label class="form-control">
              <span class="field-label">Slug</span>
              <input v-model="form.slug" class="input" maxlength="80" required />
            </label>

            <label class="form-control">
              <span class="field-label">Тег</span>
              <input v-model="form.tag" class="input" maxlength="8" required />
            </label>

            <label class="form-control md:col-span-2">
              <span class="field-label">Короткое описание</span>
              <input
                v-model="form.short_description"
                class="input"
                maxlength="180"
                placeholder="Коротко о вашем государстве"
              />
            </label>

            <label class="form-control md:col-span-2">
              <span class="field-label">Полное описание</span>
              <textarea
                v-model="form.description"
                rows="6"
                maxlength="5000"
                class="textarea"
                placeholder="Подробно расскажи о государстве, его идеях и правилах."
              ></textarea>
            </label>
          </div>

          <div class="mt-6 border-t border-white/10 pt-6">
            <div class="field-label">Акцентный цвет</div>
            <div class="mt-3 flex flex-wrap gap-3">
              <button
                v-for="color in colorPresets"
                :key="color"
                type="button"
                class="h-11 w-11 rounded-full border-2 transition"
                :class="form.accent_color === color ? 'border-white scale-[1.04]' : 'border-white/15'"
                :style="{ backgroundColor: color }"
                @click="form.accent_color = color"
              ></button>

              <input v-model="form.accent_color" type="color" class="h-11 w-14 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1" />
            </div>
          </div>

          <div class="mt-6 border-t border-white/10 pt-6">
            <div class="grid gap-4">
              <label class="form-control">
                <span class="field-label">Режим вступления</span>
                <select v-model="form.recruitment_policy" class="input">
                  <option value="open">Свободное вступление</option>
                  <option value="request">По заявке</option>
                  <option value="invite_only">Только по приглашению</option>
                </select>
              </label>

              <label class="action-card flex items-start gap-4">
                <input v-model="form.is_public" type="checkbox" class="mt-1 h-5 w-5 accent-violet-500" />
                <div>
                  <p class="font-semibold text-slate-100">Публичная страница</p>
                  <p class="mt-1 text-sm leading-6 text-slate-400">
                    Если выключить, государство не будет доступно по прямой ссылке другим игрокам.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-6">
            <button type="button" class="btn btn-primary" :disabled="saving" @click="submitForm">
              <span v-if="saving" class="spinner"></span>
              <span>{{ saving ? 'Сохраняем...' : isEditMode ? 'Сохранить изменения' : 'Создать государство' }}</span>
            </button>

            <button
              v-if="isEditMode"
              type="button"
              class="btn btn-ghost"
              :disabled="leaving"
              @click="leaveMyNationAction"
            >
              <span v-if="leaving" class="spinner"></span>
              <span>{{ leaving ? 'Выходим...' : 'Выйти из государства' }}</span>
            </button>
          </div>
        </section>

        <section class="space-y-5">
          <article class="surface-card overflow-hidden p-0">
            <div class="relative h-40 overflow-hidden border-b border-white/10 bg-slate-950">
              <img v-if="currentAssets.banner" :src="currentAssets.banner" alt="banner" class="h-full w-full object-cover" />
              <div
                v-else
                class="h-full w-full"
                :style="{ background: `radial-gradient(circle at top left, ${form.accent_color}66, transparent 35%), linear-gradient(135deg, rgba(15,23,42,.92), rgba(9,14,27,1))` }"
              ></div>
            </div>

            <div class="p-5 md:p-6">
              <div class="-mt-12 flex items-end gap-3">
                <div class="preview-avatar h-16 w-16 border-4 border-[#09101d] bg-[#0f172a] text-lg shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                  <img v-if="currentAssets.icon" :src="currentAssets.icon" alt="icon" class="h-full w-full object-cover" />
                  <span v-else>{{ (form.tag || 'TG').slice(0, 2).toUpperCase() }}</span>
                </div>

                <div class="min-w-0 pb-1">
                  <div class="flex items-center gap-2">
                    <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: form.accent_color }"></span>
                    <span class="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      [{{ form.tag || 'TAG' }}]
                    </span>
                  </div>
                  <h3 class="mt-2 truncate text-xl font-black tracking-tight text-slate-50">
                    {{ form.title || 'Название государства' }}
                  </h3>
                </div>
              </div>

              <p class="mt-4 text-sm leading-7 text-slate-400">
                {{ form.short_description || 'Короткое описание пока не заполнено.' }}
              </p>

              <div class="mt-4 flex flex-wrap gap-2">
                <span class="footer-chip">{{ form.recruitment_policy }}</span>
                <span class="footer-chip">{{ form.is_public ? 'Публичное' : 'Скрытое' }}</span>
              </div>

              <div v-if="publicNationUrl" class="mt-4 text-sm text-slate-400">
                {{ publicNationUrl }}
              </div>
            </div>
          </article>

          <article class="surface-card p-5 md:p-6">
            <div class="section-kicker !mb-2">Медиа</div>
            <h2 class="text-xl font-black tracking-tight text-slate-50 md:text-2xl">
              Иконка, баннер и фон
            </h2>

            <div class="mt-5 grid gap-4">
              <div class="action-card">
                <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p class="font-semibold text-slate-100">Иконка</p>
                    <p class="mt-1 text-sm text-slate-400">
                      {{ selectedFileNames.icon || (currentAssets.icon ? 'Файл уже загружен' : 'Файл не выбран') }}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <input type="file" accept="image/*" class="input max-w-[240px] cursor-pointer" @change="onFileChange('icon', $event)" />
                    <button type="button" class="btn btn-primary" :disabled="uploading.icon || !selectedFiles.icon" @click="uploadAsset('icon')">
                      {{ uploading.icon ? 'Загрузка...' : 'Загрузить' }}
                    </button>
                    <button v-if="currentAssets.icon" type="button" class="btn btn-outline" :disabled="uploading.icon" @click="removeAsset('icon')">
                      Удалить
                    </button>
                  </div>
                </div>
              </div>

              <div class="action-card">
                <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p class="font-semibold text-slate-100">Баннер</p>
                    <p class="mt-1 text-sm text-slate-400">
                      {{ selectedFileNames.banner || (currentAssets.banner ? 'Файл уже загружен' : 'Файл не выбран') }}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <input type="file" accept="image/*" class="input max-w-[240px] cursor-pointer" @change="onFileChange('banner', $event)" />
                    <button type="button" class="btn btn-primary" :disabled="uploading.banner || !selectedFiles.banner" @click="uploadAsset('banner')">
                      {{ uploading.banner ? 'Загрузка...' : 'Загрузить' }}
                    </button>
                    <button v-if="currentAssets.banner" type="button" class="btn btn-outline" :disabled="uploading.banner" @click="removeAsset('banner')">
                      Удалить
                    </button>
                  </div>
                </div>
              </div>

              <div class="action-card">
                <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p class="font-semibold text-slate-100">Фон страницы</p>
                    <p class="mt-1 text-sm text-slate-400">
                      {{ selectedFileNames.background || (currentAssets.background ? 'Файл уже загружен' : 'Файл не выбран') }}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <input type="file" accept="image/*" class="input max-w-[240px] cursor-pointer" @change="onFileChange('background', $event)" />
                    <button type="button" class="btn btn-primary" :disabled="uploading.background || !selectedFiles.background" @click="uploadAsset('background')">
                      {{ uploading.background ? 'Загрузка...' : 'Загрузить' }}
                    </button>
                    <button v-if="currentAssets.background" type="button" class="btn btn-outline" :disabled="uploading.background" @click="removeAsset('background')">
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  </section>
</template>
