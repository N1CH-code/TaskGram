import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsApi, categoriesApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { hapticFeedback } from '../services/telegram'

export default function CreateProjectPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'freelance',
    categoryId: '',
    price: '',
    skills: '',
    deadline: '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const data = await categoriesApi.getAll()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSubmit() {
    if (!form.title || !form.description) return
    setLoading(true)
    try {
      const skills = form.skills ? form.skills.split(',').map(s => s.trim()) : []
      const project = await projectsApi.create({
        ...form,
        price: form.price ? parseFloat(form.price) : undefined,
        skills,
      })
      hapticFeedback('medium')
      navigate(`/projects/${project.id}`)
    } catch (err: any) {
      alert(err.message || 'Ошибка при создании')
    } finally {
      setLoading(false)
    }
  }

  const priceLabel = form.type === 'job' ? 'Зарплата (₽)' : 'Бюджет (₽)'

  return (
    <div className="page">
      {/* Step indicator */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              s <= step ? 'bg-accent-blue' : 'bg-dark-border'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold mb-4">Тип проекта</h2>
          <div className="space-y-3">
            {[
              { value: 'freelance', label: '🚀 Фриланс', desc: 'Разовые проекты' },
              { value: 'job', label: '💼 Работа', desc: 'Постоянная занятость' },
              { value: 'microtask', label: '⚡ Микрозадача', desc: 'Быстрые задания' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => { setForm(f => ({ ...f, type: option.value })); setStep(2) }}
                className={`card w-full text-left hover:bg-dark-hover transition-all ${
                  form.type === option.value ? 'border-accent-blue' : ''
                }`}
              >
                <p className="text-lg font-semibold">{option.label}</p>
                <p className="text-sm text-gray-400">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold mb-4">Детали</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Название *</label>
              <input
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Например: Нужен дизайнер для карточек WB"
                className="input"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Описание *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Опишите задачу подробнее..."
                className="input min-h-[120px] resize-none"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{priceLabel}</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="1000"
                className="input"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Категория</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="input"
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Навыки (через запятую)</label>
              <input
                value={form.skills}
                onChange={(e) => setForm(f => ({ ...f, skills: e.target.value }))}
                placeholder="Дизайн, Photoshop, Figma"
                className="input"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">Назад</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1">Далее</button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold mb-4">Предпросмотр</h2>
          <div className="card mb-4">
            <p className="text-sm text-gray-400 mb-1">
              {form.type === 'job' ? '💼 Работа' : form.type === 'freelance' ? '🚀 Фриланс' : '⚡ Микрозадача'}
            </p>
            <h3 className="text-lg font-semibold mb-2">{form.title}</h3>
            <p className="text-sm text-gray-400 mb-3">{form.description}</p>
            {form.price && (
              <p className="text-xl font-bold text-accent-blue">{parseFloat(form.price).toLocaleString()} ₽</p>
            )}
          </div>
          <div className="card bg-yellow-500/5 border-yellow-500/20 mb-4">
            <p className="text-sm text-yellow-400">
              ⚠️ Для защиты своей работы рекомендуем отправлять заказчику предварительные материалы с водяным знаком и не передавать исходные файлы до выполнения условий сделки.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">Назад</button>
            <button onClick={handleSubmit} className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Публикация...' : '📢 Опубликовать'}
            </button>
          </div>
        </div>
      )}

      {/* Safety Tips */}
      {step === 1 && (
        <div className="mt-6 card bg-accent-blue/5 border-accent-blue/20">
          <p className="text-sm text-accent-blue font-medium mb-1">🔒 Безопасность</p>
          <p className="text-xs text-gray-400">
            Не передавайте исходные файлы до подтверждения оплаты. Используйте водяные знаки для预览.
          </p>
        </div>
      )}
    </div>
  )
}
