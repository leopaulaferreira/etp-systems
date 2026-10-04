/** Cenário vetorial decorativo: luz ambiente e curvas que conectam marca e acesso. */
export default function LoginBackdrop() {
  return (
    <div aria-hidden="true" className="login-backdrop pointer-events-none absolute inset-0 overflow-hidden">
      <span className="login-backdrop-light" />
      <span className="login-backdrop-grid" />
      <svg className="login-backdrop-curves" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id="login-curve-light" x1="100" y1="900" x2="1500" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-brand-cyan-400)" stopOpacity="0" />
            <stop offset=".35" stopColor="var(--color-brand-cyan-400)" stopOpacity=".35" />
            <stop offset=".7" stopColor="var(--color-brand-blue-400)" stopOpacity=".2" />
            <stop offset="1" stopColor="var(--color-brand-blue-500)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="login-ribbon-light" x1="400" y1="900" x2="1450" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-brand-cyan-500)" stopOpacity="0" />
            <stop offset=".5" stopColor="var(--color-brand-blue-500)" stopOpacity=".07" />
            <stop offset="1" stopColor="var(--color-brand-blue-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M-100 970C400 1120 450 700 800 660S1150 180 1700 260L1700 355C1150 280 1150 810 800 755S400 1215-100 1065Z" fill="url(#login-ribbon-light)" />
        <g fill="none" stroke="url(#login-curve-light)" strokeWidth="1">
          <path d="M-100 940C400 1090 450 670 800 630S1150 150 1700 230" />
          <path d="M-100 970C400 1120 450 700 800 660S1150 180 1700 260" />
          <path d="M-100 1000C400 1150 450 730 800 690S1150 210 1700 290" opacity=".45" />
        </g>
      </svg>
      <span className="login-backdrop-line" />
    </div>
  )
}
