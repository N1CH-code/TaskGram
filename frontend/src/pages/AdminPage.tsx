import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function AdminPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/')
      return
    }
    loadData()
  }, [])

  async function loadData() {
    try {
      const [dash, statsData, usersData] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getStats(),
        adminApi.getUsers(1, 50),
      ])
      setDashboard(dash)
      setStats(statsData)
      setUsers(usersData.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleBlock(userId: string) {
    try {
      await adminApi.toggleBlock(userId)
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  if (!user?.isAdmin) return null

  if (loading) {
    return (
      <div className="page flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="page">
      <h2 className="text-xl font-bold mb-4">👨‍💼 Админ панель</h2>

      {/* Stats */}
      {dashboard?.stats && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card text-center">
            <p className="text-2xl font-bold">{dashboard.stats.totalUsers}</p>
            <p className="text-xs text-gray-500">Пользователей</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold">{dashboard.stats.totalProjects}</p>
            <p className="text-xs text-gray-500">Проектов</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold">{dashboard.stats.activeProjects}</p>
            <p className="text-xs text-gray-500">Активных</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold">{dashboard.stats.totalReviews}</p>
            <p className="text-xs text-gray-500">Отзывов</p>
          </div>
        </div>
      )}

      {/* Stats Details */}
      {stats && (
        <div className="card mb-6">
          <h3 className="font-bold mb-3">Статистика за месяц</h3>
          <div className="space-y-2 text-sm">
            <p>Новых пользователей: <span className="font-bold text-accent-blue">{stats.monthly?.usersThisMonth}</span></p>
            <p>Новых проектов: <span className="font-bold text-accent-blue">{stats.monthly?.projectsThisMonth}</span></p>
            <p>Новых подписок: <span className="font-bold text-accent-blue">{stats.monthly?.newSubscriptions}</span></p>
          </div>
          {stats.projectsByStatus && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Статусы проектов:</p>
              <div className="space-y-1 text-xs">
                {stats.projectsByStatus.map((s: any) => (
                  <p key={s.status}>{s.status}: {s._count}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users List */}
      <div>
        <h3 className="font-bold mb-3">Пользователи</h3>
        <div className="space-y-2">
          {users.map((u: any) => (
            <div key={u.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-sm">
                  {u.firstName?.[0] || u.username?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium">{u.firstName || u.username || 'Без имени'}</p>
                  <p className="text-xs text-gray-500">
                    ID: {u.telegramId?.slice(0, 8)}... • {u.role} • Проектов: {u._count?.sentProjects}
                  </p>
                  {u.isAdmin && <span className="text-[10px] text-accent-blue">Админ</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${u.isBlocked ? 'text-red-400' : 'text-green-400'}`}>
                  {u.isBlocked ? 'Заблокирован' : 'Активен'}
                </span>
                <button
                  onClick={() => handleToggleBlock(u.id)}
                  className={`text-xs px-2 py-1 rounded-lg ${
                    u.isBlocked ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {u.isBlocked ? 'Разблок.' : 'Блок.'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
