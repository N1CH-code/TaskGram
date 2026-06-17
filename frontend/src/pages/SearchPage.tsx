import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { projectsApi, categoriesApi } from '../services/api'
import ProjectCard from '../components/common/ProjectCard'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [type, setType] = useState(searchParams.get('type') || '')
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const types = [
    { value: '', label: 'Все' },
    { value: 'job', label: 'Работа' },
    { value: 'freelance', label: 'Фриланс' },
    { value: 'microtask', label: 'Микрозадачи' },
  ]

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProjects()
  }, [type, categoryId, sort, page, search])

  async function loadCategories() {
    try {
      const data = await categoriesApi.getAll()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    }
  }

  async function loadProjects() {
    setLoading(true)
    try {
      const params: any = { page, limit: 20, sort }
      if (type) params.type = type
      if (categoryId) params.categoryId = categoryId
      if (search) params.search = search

      const data = await projectsApi.getAll(params)
      if (page === 1) {
        setProjects(data.projects || [])
      } else {
        setProjects(prev => [...prev, ...(data.projects || [])])
      }
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    const params: any = {}
    if (search) params.search = search
    if (type) params.type = type
    setSearchParams(params)
  }

  return (
    <div className="page">
      {/* Search */}
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск проектов..."
          className="input"
        />
      </form>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => { setType(t.value); setPage(1) }}
            className={`whitespace-nowrap ${type === t.value ? 'chip-active' : 'chip'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => { setCategoryId(''); setPage(1) }}
            className={`whitespace-nowrap ${!categoryId ? 'chip-active' : 'chip'}`}
          >
            Все категории
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => { setCategoryId(cat.id); setPage(1) }}
              className={`whitespace-nowrap ${categoryId === cat.id ? 'chip-active' : 'chip'}`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Sort */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">Найдено: {projects.length}</p>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1) }}
          className="bg-dark-card text-sm text-gray-300 border border-dark-border rounded-lg px-3 py-1.5 outline-none"
        >
          <option value="newest">Новые</option>
          <option value="price">По цене</option>
        </select>
      </div>

      {/* Results */}
      {loading && page === 1 ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-400">Ничего не найдено</p>
          <p className="text-sm text-gray-500 mt-1">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Load More */}
      {page < totalPages && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="btn-secondary w-full mt-4"
          disabled={loading}
        >
          {loading ? 'Загрузка...' : 'Загрузить ещё'}
        </button>
      )}
    </div>
  )
}
