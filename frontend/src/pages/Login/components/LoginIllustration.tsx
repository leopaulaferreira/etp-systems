import { type PointerEvent } from 'react'
import etpSymbol from '../../../assets/etp-symbol-flat.svg'

export default function LoginIllustration() {
  function moveLight(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || document.documentElement.classList.contains('etp-reduced-motion')) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
    event.currentTarget.style.setProperty('--mark-light-x', `${x * 100}%`)
    event.currentTarget.style.setProperty('--mark-light-y', `${y * 100}%`)
    event.currentTarget.style.setProperty('--mark-rotate-x', `${(0.5 - y) * 8}deg`)
    event.currentTarget.style.setProperty('--mark-rotate-y', `${(x - 0.5) * 10 - 8}deg`)
  }

  function resetLight(event: PointerEvent<HTMLDivElement>) {
    for (const property of ['--mark-light-x', '--mark-light-y', '--mark-rotate-x', '--mark-rotate-y']) {
      event.currentTarget.style.removeProperty(property)
    }
  }

  return (
    <div aria-hidden="true" className="login-illustration" onPointerMove={moveLight} onPointerLeave={resetLight} onPointerCancel={resetLight}>
      <span className="login-mark-halo" />
      <span className="login-mark-base" />
      <div className="login-mark-frame">
        <span className="login-mark-edge" />
        <img src={etpSymbol} alt="" width="172" height="172" draggable={false} />
      </div>
    </div>
  )
}
