import { ProjectCta } from '../ui/ProjectCta'
import { HeroBackground } from './HeroBackground'
import { ParticleField } from './ParticleField'

type HeroProps = {
  name: string
  role: string
  intro: string
  projectsLabel: string
}

/**
 * 首屏 Hero：至少占满可视高度，内容水平垂直居中。
 * min-h-hero 在同一规则内先写 100vh 再写 100dvh，不支持的浏览器自然回退。
 * 用 min- 而非固定高度，保证短视口或放大页面时内容撑开而不被裁切。
 */
export function Hero({ name, role, intro, projectsLabel }: HeroProps) {
  return (
    <section
      id="home"
      /* scroll-mt-20 需与导航栏 h-16 保持同步 */
      className="relative isolate flex min-h-hero scroll-mt-20 flex-col items-center justify-center overflow-hidden px-6 py-24 [@media(max-height:32rem)]:pt-20 [@media(max-height:32rem)]:pb-10"
    >
      <HeroBackground />
      <ParticleField />

      {/* 遮罩必须在粒子层之上：否则文字后面的粒子与连线不会被削弱，正文对比度会跌破 4.5:1 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,var(--scrim),transparent_75%)]"
      />

      <div className="relative z-30 flex w-full max-w-2xl flex-col items-center text-center">
        {/* 展示字体只有 Regular：挂 font-bold 会让浏览器合成假粗体，笔画糊成一团 */}
        <h1 className="font-calligraphy text-balance text-6xl leading-[1.15] tracking-[0.05em] sm:text-7xl [@media(max-height:32rem)]:text-5xl">
          {name}
        </h1>

        <p className="mt-4 text-base font-medium tracking-widest text-accent uppercase">
          {role}
        </p>

        <p className="mt-6 max-w-xl text-pretty text-base text-ink-muted sm:text-lg">
          {intro}
        </p>

        <div className="mt-10">
          <ProjectCta label={projectsLabel} />
        </div>
      </div>
    </section>
  )
}
