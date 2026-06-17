export function initTelegram() {
  const tg = (window as any).Telegram?.WebApp
  if (tg) {
    tg.expand()
    tg.enableClosingConfirmation()
    tg.setHeaderColor('#0F0F10')
    tg.setBackgroundColor('#0F0F10')
    tg.isClosingConfirmationEnabled = true
  }
}

export function getTelegramUser() {
  const tg = (window as any).Telegram?.WebApp
  return tg?.initDataUnsafe?.user || null
}

export function getInitData() {
  const tg = (window as any).Telegram?.WebApp
  return tg?.initData || ''
}

export function showAlert(message: string) {
  const tg = (window as any).Telegram?.WebApp
  tg?.showAlert(message)
}

export function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const tg = (window as any).Telegram?.WebApp
    tg?.showConfirm(message, (confirmed: boolean) => {
      resolve(confirmed)
    })
  })
}

export function hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'medium') {
  const tg = (window as any).Telegram?.WebApp
  tg?.HapticFeedback?.impactOccurred(style)
}
