import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Header() {
  const location = useLocation()
  const { user } = useAuthStore()

  const titles: Record<string, string> = {
    '/': 'TaskGram',
    '/search': 'Поиск',
    '/create': 'Создать проект',
    '/messages': 'Сообщения',
    '/profile': 'Профиль',
    '/profile/edit': 'Редактировать профиль',
    '/subscriptions': 'Подписки',
    '/admin': 'Админ панель',
  }

  const title = Object.entries(titles).find(([path]) => location.pathname === path)?.[1] || 'TaskGram'

  if (location.pathname.startsWith('/projects/')) return null

  return (
    <header className="sticky top-0 z-40 bg-dark-bg/95 backdrop-blur-lg border-b border-dark-border px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {user?.isPremium && (
          <span className="text-xs bg-accent-blue/20 text-accent-blue px-2 py-0.5 rounded-full font-medium">
            Premium
          </span>
        )}
      </div>
    </header>
  )
}
