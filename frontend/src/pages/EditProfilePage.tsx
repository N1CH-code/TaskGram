import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { usersApi, portfolioApi } from '../services/api'
import { hapticFeedback } from '../services/telegram'

export default function EditProfilePage() {
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    description: user?.description || '',
    role: user?.role || 'BOTH',
    skills: user?.skills?.join(', ') || '',
    phone: user?.phone || '',
  })

  const roles = [
    { value: 'WORKER', label: '🔧 Ищу работу', desc: 'Я исполнитель' },
    { value: 'EMPLOYER', label: '💼 Ищу исполнителей', desc: 'Я работодатель' },
    { value: 'BOTH', label: '🔄 И то и другое', desc: 'Я и исполнитель, и работодатель' },
  ]

  async function handleSave() {
    setSaving(true)
    try {
      const skills = form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      const data = await usersApi.updateProfile({
        ...form,
        skills,
      })
      updateUser(data)
      hapticFeedback('medium')
      navigate('/profile')
    } catch (err: any) {
      alert(err.message || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <h2 className="text-xl font-bold mb-6">Редактировать профиль</h2>

      {/* Role Selector */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">Кто вы?</label>
        <div className="space-y-2">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setForm(f => ({ ...f, role: role.value }))}
              className={`card w-full text-left hover:bg-dark-hover transition-all ${
                form.role === role.value ? 'border-accent-blue' : ''
              }`}
            >
              <p className="font-semibold text-sm">{role.label}</p>
              <p className="text-xs text-gray-500">{role.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Имя</label>
          <input
            value={form.firstName}
            onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
            placeholder="Ваше имя"
            className="input"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Фамилия</label>
          <input
            value={form.lastName}
            onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
            placeholder="Ваша фамилия"
            className="input"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Телефон</label>
          <input
            value={form.phone}
            onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+7 (999) 123-45-67"
            className="input"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">О себе</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Расскажите о своём опыте..."
            className="input min-h-[100px] resize-none"
            rows={4}
          />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Навыки (через запятую)</label>
          <input
            value={form.skills}
            onChange={(e) => setForm(f => ({ ...f, skills: e.target.value }))}
            placeholder="Дизайн, Figma, Photoshop, Python"
            className="input"
          />
        </div>
      </div>

      {/* Safety Warning */}
      <div className="card bg-yellow-500/5 border-yellow-500/20 mb-6">
        <p className="text-sm text-yellow-400 font-medium mb-1">⚠️ Безопасность</p>
        <p className="text-xs text-gray-400">
          Для защиты своей работы рекомендуем отправлять заказчику предварительные материалы с водяным знаком и не передавать исходные файлы до выполнения условий сделки.
        </p>
        <ul className="text-xs text-gray-500 mt-2 space-y-1">
          <li>🎨 Дизайнерам: используйте водяные знаки</li>
          <li>🎬 Видеомонтажёрам: используйте превью низкого качества</li>
          <li>💻 Программистам: показывайте демо</li>
          <li>📐 CLO3D: отправляйте рендеры</li>
          <li>🧵 Вышивальщикам: отправляйте превью</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/profile')} className="btn-secondary flex-1">Отмена</button>
        <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>
          {saving ? 'Сохранение...' : '💾 Сохранить'}
        </button>
      </div>
    </div>
  )
}
