/**
 * Hero 背景的渐变底层。
 * 刻意不使用整屏 filter: blur()，色块的柔化完全由 radial-gradient 的透明色标完成。
 * 所有配色取自 index.css 的主题变量，切换主题时自动跟随。
 * 可读性遮罩不在这里，而在粒子层之上（见 Hero.tsx），否则压不住粒子与连线。
 */
export function HeroBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-canvas" />

      <div className="absolute -top-[15%] -left-[20%] h-[85%] aspect-square bg-[radial-gradient(circle_at_center,var(--glow-a),transparent_65%)]" />
      <div className="absolute top-[5%] -right-[25%] h-[75%] aspect-square bg-[radial-gradient(circle_at_center,var(--glow-b),transparent_65%)]" />
      <div className="absolute -bottom-[20%] left-[10%] h-[80%] aspect-square bg-[radial-gradient(circle_at_center,var(--glow-c),transparent_65%)]" />
    </div>
  )
}
