import type { Project } from '../../data/projects'
import { ProjectCard } from './ProjectCard'

type ProjectSectionProps = {
  projects: readonly Project[]
}

/**
 * 项目展示区：占据 #projects 锚点，替代此前的「内容待补充」占位。
 * 列数按视口递增：手机单列、平板两列、桌面三列。
 */
export function ProjectSection({ projects }: ProjectSectionProps) {
  return (
    <section
      id="projects"
      /* scroll-mt-20 需与导航栏 h-16 保持同步 */
      className="scroll-mt-20 border-t border-line px-6 py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="text-3xl font-semibold tracking-wide text-ink sm:text-4xl">项目</h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
