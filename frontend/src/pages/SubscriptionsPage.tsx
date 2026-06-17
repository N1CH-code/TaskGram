import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { subscriptionsApi } from '../services/api'
import { hapticFeedback } from '../services/telegram'

export default function SubscriptionsPage() {
  const { user, updateUser } = useAuthStore()
  const [plans, setPlans] = useState<any>({ worker: [], employer: [] })
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    loadPlans()
  }, [])

  async function loadPlans() {
    try {
      const data = await subscriptionsApi.getPlans()
      setPlans(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleTrial() {
    setActivating(true)
    try {
      await subscriptionsApi.activateTrial()
      updateUser({ isPremium: true, subscriptionTier: 'PREMIUM' })
      hapticFeedback('medium')
      alert('🎉 3 дня Premium активированы!')
    } catch (err: any) {
      alert(err.message || 'Ошибка')
    } finally {
      setActivating(false)
    }
  }

  async function handleSubscribe(tier: string) {
    try {
      const data = await subscriptionsApi.subscribeWorker(tier)
      // Redirect to payment
      window.open(data.paymentLink, '_blank')
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

  return (
    <div className="page">
      {/* Trial Offer */}
      {!user?.trialUsed && (
        <div className="card bg-gradient-to-r from-accent-blue/20 to-purple-500/20 border-accent-blue/30 mb-6 text-center">
          <p className="text-3xl mb-2">🎁</p>
          <h3 className="text-lg font-bold mb-1">3 дня Premium бесплатно</h3>
          <p className="text-sm text-gray-400 mb-3">Попробуйте все возможности платформы</p>
          <button onClick={handleTrial} disabled={activating} className="btn-primary">
            {activating ? 'Активация...' : '🎯 Активировать'}
          </button>
        </div>
      )}

      {/* Worker Plans */}
      <section className="mb-6">
        <h3 className="text-lg font-bold mb-4">Для исполнителей</h3>
        <div className="space-y-3">
          {plans.worker?.map((plan: any) => (
            <div key={plan.tier} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-bold">{plan.name}</p>
                  <p className="text-2xl font-bold text-accent-blue">{plan.price} ₽<span className="text-sm text-gray-500">/мес</span></p>
                </div>
                {user?.subscriptionTier === plan.tier && (
                  <span className="chip-active text-xs">Активна</span>
                )}
              </div>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="text-sm text-gray-300 flex items-center gap-2">
                    <span className="text-green-400">✓</span> {feature}
                  </li>
                ))}
              </ul>
              {user?.subscriptionTier !== plan.tier && (
                <button onClick={() => handleSubscribe(plan.tier)} className="btn-primary w-full text-sm">
                  {plan.tier === 'PREMIUM' ? '🚀 Оформить Premium' : '💎 Оформить Premium Pro'}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Employer Plans */}
      <section className="mb-6">
        <h3 className="text-lg font-bold mb-4">Для работодателей</h3>
        <div className="space-y-3">
          <div className="card">
            <p className="text-lg font-bold mb-1">Публикация заказа</p>
            <p className="text-xs text-gray-500 mb-2">Фриланс / Микрозадача</p>
            <p className="text-2xl font-bold text-accent-blue mb-3">99 ₽<span className="text-sm text-gray-500">/раз</span></p>
          </div>
          <div className="card">
            <p className="text-lg font-bold mb-1">Публикация вакансии</p>
            <p className="text-xs text-gray-500 mb-2">Постоянная работа</p>
            <p className="text-2xl font-bold text-accent-blue mb-3">199 ₽<span className="text-sm text-gray-500">/раз</span></p>
          </div>
          <div className="card">
            <p className="text-lg font-bold mb-1">Подписка работодателя</p>
            <p className="text-2xl font-bold text-accent-blue">1 490 ₽<span className="text-sm text-gray-500">/мес</span></p>
            <ul className="space-y-1 mt-3 mb-4">
              <li className="text-sm text-gray-300 flex items-center gap-2">
                <span className="text-green-400">✓</span> Безлимит публикаций
              </li>
              <li className="text-sm text-gray-300 flex items-center gap-2">
                <span className="text-green-400">✓</span> Приоритетная поддержка
              </li>
            </ul>
            {user?.employerTier !== 'SUBSCRIBER' && (
              <button onClick={() => subscriptionsApi.subscribeEmployer()} className="btn-primary w-full text-sm">
                🏢 Оформить подписку
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Current Status */}
      <div className="card">
        <p className="text-sm font-medium mb-2">Мой тариф</p>
        <p className="text-sm text-gray-400">
          {user?.isPremium ? `⭐ Premium ${user.subscriptionTier === 'PREMIUM_PRO' ? 'Pro' : ''}` : '🆓 Бесплатный'}
        </p>
        {user?.premiumExpiresAt && (
          <p className="text-xs text-gray-500 mt-1">
            Действует до: {new Date(user.premiumExpiresAt).toLocaleDateString('ru')}
          </p>
        )}
      </div>
    </div>
  )
}
