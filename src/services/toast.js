import { reactive } from 'vue'

const DEFAULT_DURATION = 4200

export const toastState = reactive({
  items: [],
})

function createId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function removeToast(id) {
  const index = toastState.items.findIndex((item) => item.id === id)
  if (index >= 0) {
    toastState.items.splice(index, 1)
  }
}

export function pushToast({
  type = 'info',
  title = '',
  message = '',
  duration = DEFAULT_DURATION,
} = {}) {
  if (!message) {
    return null
  }

  const id = createId()
  const toast = { id, type, title, message }
  toastState.items.push(toast)

  if (duration > 0) {
    window.setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

export function toastSuccess(message, title = 'Готово') {
  return pushToast({ type: 'success', title, message })
}

export function toastError(message, title = 'Не удалось выполнить действие') {
  return pushToast({ type: 'error', title, message, duration: 5600 })
}

export function toastInfo(message, title = 'Уведомление') {
  return pushToast({ type: 'info', title, message })
}