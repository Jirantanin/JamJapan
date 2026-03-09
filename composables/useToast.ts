interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function show(type: Toast['type'], message: string, duration = 3000) {
    const id = Date.now()
    toasts.value.push({ id, type, message })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  function success(message: string) {
    show('success', message)
  }

  function error(message: string) {
    show('error', message)
  }

  function info(message: string) {
    show('info', message)
  }

  return { toasts, show, success, error, info }
}
