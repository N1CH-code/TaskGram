import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import ProjectStatusBadge from '../components/ui/ProjectStatusBadge'

export default function MessagesPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'employer' | 'worker'>('employer')

  useEffect(() => {
    loadProjects()
  }, [tab])

  async function loadProjects() {
    setLoading(true)
    try {
      const data = await projectsApi.getMy(tab)
      setProjects(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('employer')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'employer' ? 'bg-accent-blue/20 text-accent-blue' : 'bg-dark-card text-gray-400'
          }`}
        >
          Мои проекты
        </button>
        <button
          onClick={() => setTab('worker')}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
            tab === 'worker' ? 'bg-accent-blue/20 text-accent-blue' : 'bg-dark-card text-gray-400'
          }`}
        >
          Мои отклики
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-gray-400">Нет активных проектов</p>
          <p className="text-sm text-gray-500 mt-1">Откликнитесь на проект, чтобы начать</p>
          <button onClick={() => navigate('/search')} className="btn-primary mt-4">
            Найти проекты
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project: any) => {
            const otherPerson = tab === 'employer' ? project.worker : project.employer
            return (
              <button
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="card w-full text-left hover:bg-dark-hover transition-all animate-fade-in"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {otherPerson?.photoUrl ? (
                      <img src={otherPerson.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-accent-blue font-semibold">
                        {otherPerson?.firstName?.[0] || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{project.title}</p>
                    <p className="text-xs text-gray-500">
                      {otherPerson?.firstName || otherPerson?.username || 'Пользователь'}
                    </p>
                  </div>
                  <ProjectStatusBadge status={project.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>💬 {project._count?.messages || 0}</span>
                  <span>📎 {project._count?.files || 0}</span>
                  {project.price && <span className="text-accent-blue font-medium">{project.price.toLocaleString()} ₽</span>}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
