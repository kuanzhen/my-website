import { useState } from 'react'
import type { About } from '../../data/about'

type AboutSectionProps = Pick<About, 'photo' | 'paragraphs' | 'brand'>

/**
 * 关于我区域：页面最后一个 section。
 * 宽屏左照片右简介（2:3），md 以下堆叠为照片在上、简介在下。
 * 照片容器固定 4:5，懒加载到达前不把简介顶开。
 * 品牌标签是不可交互的纯文本，不参与 Tab 顺序。
 */
export function AboutSection({ photo, paragraphs, brand }: AboutSectionProps) {
  // 照片加载失败时移除 <img>，避免浏览器渲染破图图标；容器与简介保持原样
  const [photoFailed, setPhotoFailed] = useState(false)

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      /* scroll-mt-20 需与导航栏 h-16 保持同步 */
      className="scroll-mt-20 border-t border-line px-6 py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h2
          id="about-title"
          className="text-3xl font-semibold tracking-wide text-ink sm:text-4xl"
        >
          关于我
        </h2>

        <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
          <div className="aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-line bg-line/40">
            {photoFailed ? (
              <span className="sr-only">站主照片加载失败</span>
            ) : (
              <img
                src={photo}
                alt="寬真居士的照片"
                loading="lazy"
                decoding="async"
                onError={() => setPhotoFailed(true)}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          <div className="space-y-5">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-pretty text-base leading-relaxed text-ink-muted"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <p className="mt-10 inline-flex rounded-full border border-line px-4 py-1.5 text-sm text-ink-muted">
          {brand}
        </p>
      </div>
    </section>
  )
}
