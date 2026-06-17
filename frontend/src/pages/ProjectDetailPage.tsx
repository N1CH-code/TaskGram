import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projectsApi, messagesApi, reviewsApi, filesApi, contactsApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import ProjectStatusBadge from '../components/ui/ProjectStatusBadge'
import ProjectTypeBadge from '../components/ui/ProjectTypeBadge'
import StarRating from '../components/ui/StarRating'
import { hapticFeedback } from '../services/telegram'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [project, setProject] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'reviews'>('chat')
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  const isEmployer = user?.id === project?.employerId
  const isWorker = user?.id === project?.workerId
  const isParticipant = isEmployer || isWorker

  useEffect(() => {
    loadProject()
  }, [id])

  async function loadProject() {
    if (!id) return
    setLoading(true)
    try {
      const data = await projectsApi.getById(id)
      setProject(data)
      if (data.messages) setMessages(data.messages)
      if (data.files) setFiles(data.files)
      if (data.reviews) setReviews(data.reviews)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleApply() {
    if (!id) return
    try {
      await projectsApi.apply(id)
      hapticFeedback('medium')
      loadProject()
    } catch (err: any) {
      alert(err.message || 'Ошибка')
    }
  }

  async function handleAccept(workerId: string) {
    if (!id) return
    try {
      await projectsApi.accept(id, workerId)
      hapticFeedback('medium')
      loadProject()
    } catch (err: any) {
      alert(err.message || 'Ошибка')
    }
  }

  async function handleStatusChange(status: string) {
    if (!id) return
    try {
      await projectsApi.updateStatus(id, status)
      hapticFeedback('light')
      loadProject()
    } catch (err: any) {
      alert(err.message || 'Ошибка')
    }
  }

  async function handleSendMessage() {
    if (!id || !messageText.trim()) return
    setSendingMessage(true)
    try {
      await messagesApi.send({ projectId: id, text: messageText })
      setMessageText('')
      hapticFeedback('light')
      loadProject()
    } catch (err: any) {
      alert(err.message || 'Ошибка')
    } finally {
      setSendingMessage(false)
    }
  }

  async function handleSubmitReview() {
    if (!id) return
    try {
      await reviewsApi.create({ projectId: id, rating: reviewRating, comment: reviewComment })
      setShowReviewModal(false)
      hapticFeedback('medium')
      loadProject()
    } catch (err: any) {
      alert(err.message || 'Ошибка')
    }
  }

  async function handleContactRequest(targetId: string) {
    try {
      await contactsApi.request(targetId, id)
      hapticFeedback('light')
      alert('Запрос на обмен контактами отправлен')
    } catch (err: any) {
      alert(err.message || 'Ошибка')
    }
  }

  if (loading) {
    return (
      <div className="page flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="page text-center py-20">
        <p className="text-gray-400">Проект не найден</p>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
            ← Назад
          </button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <ProjectTypeBadge type={project.type?.toLowerCase()} size="md" />
          <ProjectStatusBadge status={project.status} />
        </div>
        <h1 className="text-xl font-bold mb-2">{project.title}</h1>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-sm overflow-hidden">
            {project.employer?.photoUrl ? (
              <img src={project.employer.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-accent-blue font-semibold">{project.employer?.firstName?.[0] || 'U'}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{project.employer?.firstName || project.employer?.username || 'Пользователь'}</p>
            <p className="text-xs text-gray-500">
              {project.employer?.rating ? `★ ${project.employer.rating}` : '★ 0.0'}
            </p>
          </div>
        </div>
      </div>

      {/* Price */}
      {project.price && (
        <div className="card mb-4 text-center">
          <p className="text-2xl font-bold text-accent-blue">{project.price.toLocaleString()} ₽</p>
        </div>
      )}

      {/* Description */}
      <div className="card mb-4">
        <p className="text-sm text-gray-300 whitespace-pre-wrap">{project.description}</p>
      </div>

      {/* Skills */}
      {project.skills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skills.map((skill: string) => (
            <span key={skill} className="chip">{skill}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      {!isParticipant && project.status === 'NEW' && (
        <button onClick={handleApply} className="btn-primary w-full mb-4">
          📩 Откликнуться
        </button>
      )}

      {isEmployer && project.status === 'DISCUSSION' && !project.workerId && (
        <button onClick={() => handleAccept(project.worker?.id || prompt('Введите ID исполнителя:') || '')} className="btn-primary w-full mb-4">
          ✅ Принять исполнителя
        </button>
      )}

      {isEmployer && project.status === 'IN_PROGRESS' && (
        <button onClick={() => handleStatusChange('REVIEW')} className="btn-primary w-full mb-4">
          📤 Отправить на проверку
        </button>
      )}

      {isParticipant && project.status === 'REVIEW' && (
        <div className="flex gap-2 mb-4">
          <button onClick={() => handleStatusChange('COMPLETED')} className="btn-primary flex-1">
            ✅ Завершить
          </button>
          <button onClick={() => handleStatusChange('IN_PROGRESS')} className="btn-secondary flex-1">
            🔄 В доработку
          </button>
        </div>
      )}

      {/* Contact Exchange */}
      {isParticipant && project.status === 'IN_PROGRESS' && (
        <button
          onClick={() => handleContactRequest(isEmployer ? project.workerId : project.employerId)}
          className="btn-secondary w-full mb-4"
        >
          🤝 Обменяться контактами
        </button>
      )}

      {/* Leave Review */}
      {isParticipant && project.status === 'COMPLETED' && (
        <button onClick={() => setShowReviewModal(true)} className="btn-secondary w-full mb-4">
          ⭐ Оставить отзыв
        </button>
      )}

      {/* Tabs */}
      <div className="flex border-b border-dark-border mb-4">
        {['chat', 'files', 'reviews'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab ? 'text-accent-blue border-accent-blue' : 'text-gray-500 border-transparent'
            }`}
          >
            {tab === 'chat' ? '💬 Чат' : tab === 'files' ? '📎 Файлы' : '⭐ Отзывы'}
          </button>
        ))}
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div>
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">Пока нет сообщений</p>
            ) : (
              messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] card py-2 px-3 ${
                    msg.senderId === user?.id ? 'bg-accent-blue/10 border-accent-blue/30' : ''
                  }`}>
                    <p className="text-xs text-gray-500 mb-1">{msg.sender?.firstName || 'Пользователь'}</p>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-[10px] text-gray-600 mt-1">
                      {new Date(msg.createdAt).toLocaleString('ru')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {isParticipant && (
            <div className="flex gap-2">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Введите сообщение..."
                className="input flex-1"
              />
              <button onClick={handleSendMessage} disabled={sendingMessage || !messageText.trim()} className="btn-primary px-4">
                ➤
              </button>
            </div>
          )}
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div>
          {files.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">Файлы не загружены</p>
          ) : (
            <div className="space-y-2">
              {files.map((file: any) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex items-center gap-3 hover:bg-dark-hover transition-all"
                >
                  <span className="text-2xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString('ru')}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">Отзывов пока нет</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review: any) => (
                <div key={review.id} className="card">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center text-xs overflow-hidden">
                      {review.author?.photoUrl ? (
                        <img src={review.author.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-accent-blue">{review.author?.firstName?.[0]}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium">{review.author?.firstName}</span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.comment && <p className="text-sm text-gray-400 mt-1">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold mb-4">Оставить отзыв</h3>
            <div className="flex justify-center mb-4">
              <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Напишите отзыв..."
              className="input mb-4 min-h-[80px]"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowReviewModal(false)} className="btn-secondary flex-1">Отмена</button>
              <button onClick={handleSubmitReview} className="btn-primary flex-1">Отправить</button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {project.actions?.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">История</h4>
          <div className="space-y-1">
            {project.actions.map((action: any) => (
              <p key={action.id} className="text-xs text-gray-600">
                {new Date(action.createdAt).toLocaleString('ru')} — {action.description}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
