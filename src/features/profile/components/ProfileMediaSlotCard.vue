<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  slotName: { type: String, required: true },
  variant: { type: String, default: 'banner' },
  previewUrl: { type: String, default: '' },
  selectedFileName: { type: String, default: '' },
  uploading: { type: Boolean, default: false },
  hasAsset: { type: Boolean, default: false },
  recommendation: { type: String, default: '' },
  accept: {
    type: String,
    default: 'image/png,image/jpeg,image/webp',
  },
})

const emit = defineEmits(['select-file', 'upload', 'remove'])

const previewClass = computed(() => {
  if (props.variant === 'avatar') return 'aspect-square max-w-[180px] rounded-[24px]'
  if (props.variant === 'background') return 'aspect-[16/9] rounded-[24px]'
  return 'aspect-[16/6] rounded-[24px]'
})

const slotChip = computed(() => {
  if (props.slotName === 'avatar') return 'Аватар'
  if (props.slotName === 'background') return 'Фон'
  return 'Баннер'
})

function onSelect(event) {
  const file = event.target?.files?.[0] || null
  emit('select-file', file)
}
</script>

<template>
  <div class="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
    <div class="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4">
      <div class="min-w-0">
        <h3 class="text-lg font-black text-slate-950">{{ title }}</h3>
        <p class="mt-1 text-sm leading-6 text-slate-600">
          {{ subtitle }}
        </p>
      </div>

      <span class="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
        {{ slotChip }}
      </span>
    </div>

    <div class="p-4">
      <div class="flex justify-center">
        <div
          class="flex w-full items-center justify-center overflow-hidden border border-slate-200 bg-white shadow-sm"
          :class="previewClass"
        >
          <img
            v-if="previewUrl"
            :src="previewUrl"
            :alt="title"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center px-6 text-center text-sm font-semibold leading-6 text-slate-400"
          >
            Изображение пока не выбрано
          </div>
        </div>
      </div>

      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <div class="rounded-[18px] border border-slate-200 bg-white px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Файл</p>
          <p class="mt-2 break-words text-sm font-medium leading-6 text-slate-800">
            {{ selectedFileName || 'Ничего не выбрано' }}
          </p>
        </div>

        <div class="rounded-[18px] border border-slate-200 bg-white px-4 py-3">
          <p class="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Рекомендации</p>
          <p class="mt-2 text-sm leading-6 text-slate-700">
            {{ recommendation }}
          </p>
        </div>
      </div>

      <div class="mt-3 rounded-[18px] border border-dashed border-slate-300 bg-white px-4 py-3">
        <label class="form-control">
          <span class="mb-2 text-sm font-semibold text-slate-700">Выбрать файл</span>
          <input
            type="file"
            :accept="accept"
            class="file-input file-input-bordered w-full rounded-2xl"
            @change="onSelect"
          />
        </label>

        <div class="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            class="btn btn-primary rounded-2xl"
            :disabled="uploading || !selectedFileName"
            @click="$emit('upload')"
          >
            <span v-if="uploading" class="loading loading-spinner loading-sm"></span>
            <span v-else>Загрузить</span>
          </button>

          <button
            type="button"
            class="btn btn-outline rounded-2xl"
            :disabled="uploading || !hasAsset"
            @click="$emit('remove')"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
