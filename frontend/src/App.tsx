import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { initTelegram } from './services/telegram'
import BottomNav from './components/layout/BottomNav'
import Header from './components/layout/Header'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import CreateProjectPage from './pages/CreateProjectPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import MessagesPage from './pages/MessagesPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import AdminPage from './pages/AdminPage'
import AuthPage from './pages/AuthPage'
import LoadingScreen from './components/ui/LoadingScreen'

export default function App() {
  const { user, loading, initialize, login } = useAuthStore()
  const [tgReady, setTgReady] = useState(false)
  const [autoLoginDone, setAutoLoginDone] = useState(false)

  useEffect(() => {
    initTelegram()
    initialize()
    setTgReady(true)
  }, [])

  useEffect(() => {
    if (!tgReady || loading) return
    if (user) return
    if (autoLoginDone) return
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      setAutoLoginDone(true)
      login(true)
    }
  }, [tgReady, loading, user, autoLoginDone])

  if (!tgReady || loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <main className="pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/create" element={<CreateProjectPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}
