import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { projectsApi, categoriesApi } from '../services/api'
import ProjectCard from '../components/common/ProjectCard'

export default function HomePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [popular, setPopular] = useState<any[]>([])
  const [lastOrders, setLastOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [popularData, ordersData] = await Promise.all([
        projectsApi.getPopular(),
        projectsApi.getLastOrders(),
      ])
      setPopular(Array.isArray(popularData) ? popularData : [])
      setLastOrders(Array.isArray(ordersData) ? ordersData : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user?.role) {
    return (
      <div className="page">
        <div className="mt-8 text-center">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-bold mb-2">Добро пожаловать в TaskGram!</h2>
          <p className="text-gray-400 mb-6">Заполните профиль, чтобы начать</p>
          <button onClick={() => navigate('/profile/edit')} className="btn-primary">
            Заполнить профиль
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Привет, {user.firstName || 'Пользователь'}! 👋</h2>
        <p className="text-sm text-gray-400 mt-1">Что ищем сегодня?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={() => navigate('/search?type=job')} className="card text-left hover:bg-dark-hover transition-all">
          <span className="text-2xl mb-2 block">💼</span>
          <p className="font-semibold text-sm">Работа</p>
          <p className="text-xs text-gray-500">Постоянная</p>
        </button>
        <button onClick={() => navigate('/search?type=freelance')} className="card text-left hover:bg-dark-hover transition-all">
          <span className="text-2xl mb-2 block">🚀</span>
          <p className="font-semibold text-sm">Фриланс</p>
          <p className="text-xs text-gray-500">Проекты</p>
        </button>
        <button onClick={() => navigate('/search?type=microtask')} className="card text-left hover:bg-dark-hover transition-all">
          <span className="text-2xl mb-2 block">⚡</span>
          <p className="font-semibold text-sm">Микрозадачи</p>
          <p className="text-xs text-gray-500">Быстрые заказы</p>
        </button>
        <button onClick={() => navigate('/create')} className="card text-left hover:bg-dark-hover transition-all border-accent-blue/30">
          <span className="text-2xl mb-2 block">➕</span>
          <p className="font-semibold text-sm">Создать</p>
          <p className="text-xs text-gray-500">Новый проект</p>
        </button>
      </div>

      {/* Popular Projects */}
      {popular.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">🔥 Популярное</h3>
            <button onClick={() => navigate('/search')} className="text-sm text-accent-blue">Все</button>
          </div>
          <div className="space-y-3">
            {popular.slice(0, 5).map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Last Orders */}
      {lastOrders.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">📋 Последние заказы</h3>
            <button onClick={() => navigate('/search')} className="text-sm text-accent-blue">Все</button>
          </div>
          <div className="space-y-3">
            {lastOrders.slice(0, 5).map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
