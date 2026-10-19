type LogoProps = {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return <img src="/Logo/Logo_Large.svg" alt="Code Connect" className={`h-auto w-32 ${className}`} />
}
