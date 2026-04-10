<script setup>
import { computed } from 'vue'

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
  form: {
    type: Object,
    required: true,
  },
  publicProfileUrl: {
    type: String,
    default: '',
  },
})

const displayName = computed(() => {
  return props.form.display_name || props.profile?.display_name || props.profile?.player_account?.minecraft_nickname || 'Твоё имя'
})

const slugText = computed(() => props.form.slug || props.profile?.slug || 'your-profile')
const statusText = computed(() => props.form.status_text || props.profile?.status_text || 'Короткий статус ещё не заполнен')
const bioText = computed(() => {
  return props.form.bio || props.profile?.bio || 'Здесь будет описание профиля.'
})

const accent = computed(() => props.form.accent_color || props.profile?.accent_color || '#6d5df6')
const avatarUrl = computed(() => props.profile?.assets?.avatar_url || props.profile?.assets?.avatar_preview_url || '')
const bannerUrl = computed(() => props.profile?.assets?.banner_url || props.profile?.assets?.banner_preview_url || '')
const backgroundUrl = computed(() => props.profile?.assets?.background_url || props.profile?.assets?.background_preview_url || '')
const avatarFallback = computed(() => displayName.value.slice(0, 1).toUpperCase())

const pageShellStyle = computed(() => {
  if (!backgroundUrl.value) {
    return {
      background: `linear-gradient(180deg, ${accent.value}0d 0%, #f8fafc 30%, #eef2ff 100%)`,
    }
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(248,250,252,0.84), rgba(241,245,249,0.92)), url(${backgroundUrl.value})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

const heroStyle = computed(() => {
  if (bannerUrl.value) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.12), rgba(15,23,42,0.70)), url(${bannerUrl.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  return {
    background: `linear-gradient(135deg, ${accent.value}55, rgba(15,23,42,0.95) 58%, rgba(2,6,23,1))`,
  }
})

const accentBadgeStyle = computed(() => ({
  borderColor: accent.value,
  backgroundColor: `${accent.value}18`,
  color: accent.value,
}))

const accentDotStyle = computed(() => ({
  backgroundColor: accent.value,
}))

const accentLineStyle = computed(() => ({
  background: `linear-gradient(90deg, ${accent.value}, transparent)`,
}))
</script>

<template>
  <div
    class="overflow-hidden rounded-[28px] border border-slate-200 shadow-[0_18px_70px_rgba(15,23,42,0.10)]"
    :style="pageShellStyle"
  >
    <div class="p-3">
      <div class="overflow-hidden rounded-[24px] border border-white/50 bg-white/82 shadow-sm backdrop-blur">
        <div class="relative h-[220px] overflow-hidden bg-slate-950" :style="heroStyle">
          <div class="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/55"></div>

          <div class="absolute left-4 top-4 flex flex-wrap gap-2">
            <span class="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/85 backdrop-blur-md">
              @{{ slugText }}
            </span>
            <span
              class="rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] bg-white/90"
              :style="accentBadgeStyle"
            >
              Акцент
            </span>
          </div>
        </div>

        <div class="relative px-4 pb-4">
          <div class="-mt-12 flex items-end gap-4">
            <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[24px] border-4 border-white bg-slate-100 text-3xl font-black uppercase text-slate-700 shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt="avatar"
                class="h-full w-full object-cover"
              />
              <span v-else>{{ avatarFallback }}</span>
            </div>

            <div class="min-w-0 flex-1 pb-1">
              <div class="flex items-center gap-2">
                <span class="h-2.5 w-2.5 rounded-full" :style="accentDotStyle"></span>
                <span class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  Цвет страницы
                </span>
              </div>

              <h3 class="mt-2 truncate text-2xl font-black tracking-tight text-slate-950">
                {{ displayName }}
              </h3>

              <p class="mt-1 text-sm leading-6 text-slate-600">
                {{ statusText }}
              </p>
            </div>
          </div>

          <div class="mt-4 h-[2px] w-full rounded-full" :style="accentLineStyle"></div>

          <div class="mt-4 grid gap-3">
            <div class="rounded-[20px] border border-slate-200 bg-white/82 p-4 backdrop-blur">
              <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">О себе</p>
              <p class="mt-2 text-sm leading-6 text-slate-700">
                {{ bioText }}
              </p>
            </div>

            <div class="rounded-[20px] border border-slate-200 bg-white/82 p-4 backdrop-blur">
              <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Ссылка</p>
              <p class="mt-2 break-all text-sm leading-6 text-slate-700">
                {{ publicProfileUrl || `/u/${slugText}` }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
