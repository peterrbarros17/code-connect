import { TextDivider } from '../../atoms/TextDivider/TextDivider.tsx'
import { SocialButton } from '../../molecules/SocialButton/SocialButton.tsx'

export type SocialProvider = 'github' | 'gmail'

type SocialLoginProps = {
  onProviderClick: (provider: SocialProvider) => void
}

const providers: { id: SocialProvider; label: string; iconSrc: string }[] = [
  { id: 'github', label: 'Github', iconSrc: '/github.png' },
  { id: 'gmail', label: 'Gmail', iconSrc: '/gmail.png' },
]

export function SocialLogin({ onProviderClick }: SocialLoginProps) {
  return (
    <div className="flex flex-col gap-4">
      <TextDivider text="ou entre com outras contas" />
      <div className="flex justify-center gap-6">
        {providers.map((provider) => (
          <SocialButton
            key={provider.id}
            label={provider.label}
            iconSrc={provider.iconSrc}
            onClick={() => onProviderClick(provider.id)}
          />
        ))}
      </div>
    </div>
  )
}
