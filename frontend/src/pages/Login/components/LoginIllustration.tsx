import etpSymbol from '../../../assets/etp-symbol-white.svg'

export default function LoginIllustration() {
  return (
    <div aria-hidden="true" className="login-illustration">
      <span className="login-mark-halo" />
      <span className="login-mark-base" />
      <div className="login-mark-frame">
        <span className="login-mark-edge" />
        <img src={etpSymbol} alt="" width="172" height="172" draggable={false} />
      </div>
    </div>
  )
}
