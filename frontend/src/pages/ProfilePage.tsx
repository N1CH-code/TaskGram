import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { projectsApi, reviewsApi, portfolioApi } from '../services/api'
import StarRating from '../components/ui/StarRating'
import ProjectCard from '../components/common/ProjectCard'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'projects'>('portfolio')
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    if (!user) return
    setLoading(true)
    try {
      const [portfolioData, reviewsData, projectsData] = await Promise.all([
        portfolioApi.getByUser(user.id),
        reviewsApi.getByUser(user.id),
        projectsApi.getMy('worker'),
      ])
      setPortfolio(Array.isArray(portfolioData) ? portfolioData : [])
      setReviews(Array.isArray(reviewsData) ? reviewsData : [])
      setProjects(Array.isArray(projectsData) ? projectsData : [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="page">
      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-accent-blue/20 mx-auto mb-3 overflow-hidden border-2 border-accent-blue/30">
          {user.photoUrl ? (
            <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-accent-blue">
              {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold">{user.firstName || user.username || 'Пользователь'}</h2>
        <p className="text-sm text-gray-400">@{user.username || 'username'}</p>
        
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="text-center">
            <StarRating rating={user.rating} size="sm" />
            <p className="text-xs text-gray-500 mt-0.5">{user.reviewsCount} отзывов</p>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-3">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{user.completedProjects}</p>
            <p className="text-xs text-gray-500">Завершено</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{user.activeProjects}</p>
            <p className="text-xs text-gray-500">Активно</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-accent-blue">{user.rating || '0.0'}</p>
            <p className="text-xs text-gray-500">Рейтинг</p>
          </div>
        </div>

        {user.description && (
          <p className="text-sm text-gray-400 mt-3 mx-4">{user.description}</p>
        )}

        {user.skills && user.skills.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {user.skills.map((skill: string) => (
              <span key={skill} className="chip text-xs">{skill}</span>
            ))}
          </div>
        )}
      </div>

      {/* Premium Badge */}
      {user.isPremium && (
        <div className="card bg-accent-blue/10 border-accent-blue/30 mb-4 text-center">
          <p className="text-accent-blue font-semibold">⭐ Premium {user.subscriptionTier === 'PREMIUM_PRO' ? 'Pro' : ''}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => navigate('/profile/edit')} className="btn-secondary flex-1 text-sm">
          ✏️ Редактировать
        </button>
        <button onClick={() => navigate('/subscriptions')} className="btn-secondary flex-1 text-sm">
          ⭐ Подписки
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-border mb-4">
        {[
          { key: 'portfolio', label: '📁 Портфолио' },
          { key: 'reviews', label: '⭐ Отзывы' },
          { key: 'projects', label: '📋 Проекты' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.key ? 'text-accent-blue border-accent-blue' : 'text-gray-500 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div>
          {portfolio.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-sm mb-3">Портфолио пусто</p>
              <button onClick={() => navigate('/profile/edit')} className="btn-secondary text-sm">
                Добавить работу
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {portfolio.map((item: any) => (
                <div key={item.id} className="card">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
                  )}
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.tags && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] chip">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-sm">Пока нет отзывов</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review: any) => (
                <div key={review.id} className="card">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">{review.author?.firstName || 'Пользователь'}</span>
                    <span className="text-xs text-gray-500">• {review.project?.title}</span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.comment && <p className="text-sm text-gray-400 mt-1">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div>
          {projects.length === 0 ? (
            <p className="text-center text-gray-500 py-10 text-sm">Нет завершённых проектов</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Logout */}
      <div className="mt-6 text-center">
        <button onClick={logout} className="text-sm text-gray-500 hover:text-red-400 transition-colors">
          Выйти из аккаунта
        </button>
      </div>
    </div>
  )
}
