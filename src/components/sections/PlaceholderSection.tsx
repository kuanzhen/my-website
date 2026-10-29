type PlaceholderSectionProps = {
  id: string
  title: string
  description: string
}

/**
 * 占位 section：只提供稳定锚点与明确标题，供顶部导航平滑定位。
 * 复用 min-h-hero，使跳转结果至少占满一屏，滚动切换能被明显观察到。
 * 内容明确标注为待补充，不伪装成已完成区块。
 */
export function PlaceholderSection({ id, title, description }: PlaceholderSectionProps) {
  return (
    <section
      id={id}
      /* scroll-mt-20 需与导航栏 h-16 保持同步 */
      className="flex min-h-hero scroll-mt-20 flex-col items-center justify-center border-t border-line px-6 py-24 text-center"
    >
      <h2 className="text-3xl font-semibold tracking-wide text-ink sm:text-4xl">{title}</h2>
      <p className="mt-4 max-w-md text-pretty text-base text-ink-muted">{description}</p>
    </section>
  )
}
