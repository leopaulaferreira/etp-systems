import dashboardHeroLearning from '../../../assets/illustrations/dashboard-hero-learning-dark.webp'

export default function WelcomeIllustration() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full w-full items-center justify-end"
    >
      <img
        src={dashboardHeroLearning}
        alt=""
        className="max-h-[176px] w-full object-contain object-right drop-shadow-[0_14px_18px_rgba(37,99,235,0.12)]"
      />
    </div>
  )
}
