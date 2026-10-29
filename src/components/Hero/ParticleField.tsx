import { useEffect, useRef } from 'react'

import { useTheme } from '../../hooks/useTheme'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

/** 设备像素比上限：DPR 3 的屏幕上 1 个 CSS 像素要画 9 个物理像素，成本不可控 */
const MAX_DPR = 2
/** 每个粒子平均占用的面积，用来按容器大小推导粒子数 */
const AREA_PER_PARTICLE = 10000
const MIN_PARTICLES = 20
const MAX_PARTICLES = 110
/** 容器尺寸变化小于该阈值时忽略，避免地址栏动画期间反复重建粒子 */
const RESIZE_THRESHOLD = 8
/** 漂移速度范围，单位 px/ms（约 4–13 px/s） */
const MIN_SPEED = 0.004
const MAX_SPEED = 0.013
/** 单帧最大时间步长，避免切回标签页时粒子瞬移 */
const MAX_DELTA = 64
/** 连线距离：取容器短边的比例，并夹在上下限之间，避免窄屏上糊成一片 */
const LINK_DISTANCE_RATIO = 0.22
const LINK_DISTANCE_MIN = 80
const LINK_DISTANCE_MAX = 160
/** 连线最高不透明度（相对粒子色），低于粒子本身，避免压过文字 */
const LINK_ALPHA = 0.45
/** 按距离分成若干档，同档共用一次 stroke，减少状态切换 */
const LINK_ALPHA_STEPS = 4

export function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const colorRef = useRef('')
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })
  const redrawRef = useRef<() => void>(() => {})

  // 主题变化只更新颜色并补画一帧，不重建粒子，避免位置跳变
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (canvas === null || container === null) return

    const context = canvas.getContext('2d')
    // Canvas 不可用时直接返回：页面保留 CSS 渐变底，内容不受影响
    if (context === null) return

    let disposed = false
    let frameId: number | null = null
    let idleId: number | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let lastTime = 0
    // Hero 是否在视口内：滚出视口即暂停，避免在项目/联系我等区块时离屏空转
    let isInView = true

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const readColor = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--particle-color')
        .trim()
      if (value !== '') colorRef.current = value
    }

    const seedParticles = (width: number, height: number) => {
      const count = Math.min(
        MAX_PARTICLES,
        Math.max(MIN_PARTICLES, Math.round((width * height) / AREA_PER_PARTICLE)),
      )

      particlesRef.current = Array.from({ length: count }, () => {
        const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED)
        const angle = Math.random() * Math.PI * 2
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 0.8 + Math.random() * 1.4,
        }
      })
    }

    const draw = () => {
      const { width, height } = sizeRef.current
      const particles = particlesRef.current
      context.clearRect(0, 0, width, height)

      const linkDistance = Math.min(
        LINK_DISTANCE_MAX,
        Math.max(LINK_DISTANCE_MIN, Math.min(width, height) * LINK_DISTANCE_RATIO),
      )
      const maxDistanceSquared = linkDistance * linkDistance

      // 按距离把线段分档，同一档只用一次 stroke
      const buckets: number[][] = Array.from({ length: LINK_ALPHA_STEPS }, () => [])
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distanceSquared = dx * dx + dy * dy
          if (distanceSquared > maxDistanceSquared) continue

          const closeness = 1 - Math.sqrt(distanceSquared) / linkDistance
          const bucket = Math.min(
            LINK_ALPHA_STEPS - 1,
            Math.floor(closeness * LINK_ALPHA_STEPS),
          )
          buckets[bucket].push(a.x, a.y, b.x, b.y)
        }
      }

      context.strokeStyle = colorRef.current
      context.lineWidth = 1
      for (let bucket = 0; bucket < LINK_ALPHA_STEPS; bucket += 1) {
        const segments = buckets[bucket]
        if (segments.length === 0) continue

        context.globalAlpha = LINK_ALPHA * ((bucket + 0.5) / LINK_ALPHA_STEPS)
        context.beginPath()
        for (let i = 0; i < segments.length; i += 4) {
          context.moveTo(segments[i], segments[i + 1])
          context.lineTo(segments[i + 2], segments[i + 3])
        }
        context.stroke()
      }

      // 点画在连线之上，交点看起来像节点
      context.globalAlpha = 1
      context.fillStyle = colorRef.current
      for (const particle of particles) {
        context.beginPath()
        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2)
        context.fill()
      }
    }
    redrawRef.current = draw

    const step = (delta: number) => {
      const { width, height } = sizeRef.current
      for (const particle of particlesRef.current) {
        particle.x += particle.vx * delta
        particle.y += particle.vy * delta

        // 越界后从对侧回卷，保持整体密度稳定
        if (particle.x < -particle.r) particle.x = width + particle.r
        else if (particle.x > width + particle.r) particle.x = -particle.r
        if (particle.y < -particle.r) particle.y = height + particle.r
        else if (particle.y > height + particle.r) particle.y = -particle.r
      }
    }

    const stop = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
        frameId = null
      }
    }

    const loop = (time: number) => {
      if (lastTime === 0) lastTime = time
      step(Math.min(time - lastTime, MAX_DELTA))
      lastTime = time
      draw()
      frameId = requestAnimationFrame(loop)
    }

    const start = () => {
      if (disposed || motionQuery.matches || document.hidden || !isInView) return
      stop()
      lastTime = 0
      frameId = requestAnimationFrame(loop)
    }

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.round(rect.width)
      const height = Math.round(rect.height)
      if (width === 0 || height === 0) return

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const previous = sizeRef.current
      const unchanged =
        Math.abs(width - previous.width) < RESIZE_THRESHOLD &&
        Math.abs(height - previous.height) < RESIZE_THRESHOLD &&
        dpr === previous.dpr
      if (unchanged) return

      sizeRef.current = { width, height, dpr }
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      // 位图按物理像素分配，绘制仍以 CSS 像素为单位
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      seedParticles(width, height)
      draw()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stop()
        return
      }
      lastTime = 0
      if (motionQuery.matches) draw()
      else start()
    }

    const handleMotionChange = () => {
      if (motionQuery.matches) {
        stop()
        draw()
      } else {
        start()
      }
    }

    readColor()
    resize()

    // 只观察容器：容器随 section 一起变化，window.resize 是多余的第二个触发源
    const observer = new ResizeObserver(resize)
    observer.observe(container)

    // 滚出视口即暂停动画：Hero 离屏后循环继续空转会抢占主线程，使回首页的滚动动画掉帧。
    // 首次回调只同步 isInView、不启动动画：启动仍交给下面的 requestIdleCallback 延迟，避免抢 LCP。
    let firstObservation = true
    const visibilityObserver = new IntersectionObserver((entries) => {
      isInView = entries[entries.length - 1].isIntersecting
      if (firstObservation) {
        firstObservation = false
        return
      }
      if (isInView) start()
      else stop()
    })
    visibilityObserver.observe(container)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    motionQuery.addEventListener('change', handleMotionChange)

    // 减弱动效时只保留静态一帧，不进入动画循环
    if (!motionQuery.matches) {
      const begin = () => {
        idleId = null
        timeoutId = null
        start()
      }
      // 首屏绘制完成后再启动，避免与 LCP 抢主线程
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(begin, { timeout: 2000 })
      } else {
        timeoutId = setTimeout(begin, 200)
      }
    }

    return () => {
      disposed = true
      stop()
      if (idleId !== null) window.cancelIdleCallback(idleId)
      if (timeoutId !== null) clearTimeout(timeoutId)
      observer.disconnect()
      visibilityObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      motionQuery.removeEventListener('change', handleMotionChange)
      redrawRef.current = () => {}
    }
  }, [])

  useEffect(() => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--particle-color')
      .trim()
    if (value !== '') colorRef.current = value
    // 主题切换后补画一帧：动画运行中会被下一帧覆盖，静态模式下立即生效
    redrawRef.current()
  }, [resolvedTheme])

  return (
    <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
