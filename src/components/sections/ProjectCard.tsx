import type { Project } from '../../data/projects'

type ProjectCardProps = {
  project: Project
}

/** 只接受 http(s) 地址，避免空地址或占位符渲染成死链 */
const hasValidUrl = (url: string) => /^https?:\/\//.test(url)

/**
 * 单张项目卡片：截图、名称、简介与 GitHub 外链。
 * 截图容器固定 16:10，懒加载图片到达前不会把下方内容顶开。
 * 悬浮只做抬升与描边/阴影强调；减弱动效下保留强调、去掉位移。
 */
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-canvas transition-transform duration-200 ease-out hover:-translate-y-1 hover:border-accent hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="aspect-[16/10] overflow-hidden bg-line/40">
        <img
          src={project.image}
          alt={`${project.name} 项目截图`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {/* 层级：Hero 姓名是唯一的 h1，区域标题 h2，卡片名称 h3 */}
        <h3 className="text-xl font-semibold tracking-wide text-ink">{project.name}</h3>
        <p className="flex-1 text-pretty text-sm leading-relaxed text-ink-muted">
          {project.summary}
        </p>

        {hasValidUrl(project.githubUrl) && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center text-sm font-medium text-accent underline-offset-4 hover:text-accent-strong hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            GitHub
            <span className="sr-only">（在新标签页打开）</span>
          </a>
        )}
      </div>
    </article>
  )
}
