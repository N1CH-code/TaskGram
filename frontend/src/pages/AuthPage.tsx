import { useAuthStore } from '../store/authStore'
import { getInitData } from '../services/telegram'

export default function AuthPage() {
  const { login, loading, error } = useAuthStore()

  const handleLogin = async () => {
    await login()
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">📋</div>
        <h1 className="text-3xl font-bold text-white mb-2">TaskGram</h1>
        <p className="text-gray-400 mb-8">
          Платформа для поиска работы, фриланса и микрозадач внутри Telegram
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-primary w-full text-lg py-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Вход...
            </span>
          ) : (
            '🚀 Войти через Telegram'
          )}
        </button>

        {error && (
          <div className="mt-4 card bg-red-500/10 border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-600">
          <p>Нажимая "Войти", вы принимаете условия использования платформы</p>
        </div>
      </div>
    </div>
  )
}
