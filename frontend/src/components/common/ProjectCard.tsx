import { Link } from 'react-router-dom'
import { projectsApi } from '../../services/api'
import ProjectTypeBadge from '../ui/ProjectTypeBadge'
import { useState, useEffect } from 'react'

export default function ProjectCard({ project }: { project: any }) {
  const priceStr = project.price ? `${project.price.toLocaleString()} ₽` : 'Договорная'

  return (
    <Link to={`/projects/${project.id}`} className="card block hover:bg-dark-hover transition-all duration-200 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-sm font-semibold text-accent-blue overflow-hidden">
            {project.employer?.photoUrl ? (
              <img src={project.employer.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              (project.employer?.firstName?.[0] || 'U')
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{project.employer?.firstName || project.employer?.username || 'Пользователь'}</p>
            <p className="text-xs text-gray-500">{project.employer?.rating ? `★ ${project.employer.rating}` : 'Новый'}</p>
          </div>
        </div>
        <ProjectTypeBadge type={project.type?.toLowerCase()} />
      </div>

      <h3 className="text-base font-semibold text-white mb-2 line-clamp-2">{project.title}</h3>
      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{project.description}</p>

      {project.skills && project.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.skills.slice(0, 4).map((skill: string) => (
            <span key={skill} className="chip text-xs">{skill}</span>
          ))}
          {project.skills.length > 4 && (
            <span className="chip text-xs">+{project.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-dark-border">
        <span className="text-base font-bold text-accent-blue">{priceStr}</span>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {project._count?.messages > 0 && <span>💬 {project._count.messages}</span>}
        </div>
      </div>
    </Link>
  )
}
