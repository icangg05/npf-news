export type ToastType = 'success' | 'error' | 'info'
export interface ToastItem {
  id: number
  type: ToastType
  message: string
}

let counter = 0

export function useToast() {
  const toasts = useState<ToastItem[]>('toasts', () => [])

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function push(type: ToastType, message: string) {
    const id = ++counter
    toasts.value = [...toasts.value, { id, type, message }]
    if (import.meta.client) {
      setTimeout(() => remove(id), 3500)
    }
  }

  return {
    toasts,
    remove,
    success: (m: string) => push('success', m),
    error: (m: string) => push('error', m),
    info: (m: string) => push('info', m),
  }
}
