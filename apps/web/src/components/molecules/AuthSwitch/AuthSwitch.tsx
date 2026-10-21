import { Icon } from '../../atoms/Icon/Icon.tsx'
import { TextLink } from '../../atoms/TextLink/TextLink.tsx'

type AuthSwitchProps = {
  question: string
  linkLabel: string
  to: string
  iconSrc?: string
}

export function AuthSwitch({ question, linkLabel, to, iconSrc }: AuthSwitchProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-base text-content">{question}</p>
      <TextLink to={to} variant="accent">
        {linkLabel}
        {iconSrc && <Icon src={iconSrc} className="size-5" />}
      </TextLink>
    </div>
  )
}
