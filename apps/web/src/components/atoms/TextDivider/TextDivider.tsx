type TextDividerProps = {
  text: string
}

export function TextDivider({ text }: TextDividerProps) {
  return (
    <div role="separator" aria-label={text} className="flex items-center gap-4 text-base text-content">
      <span className="h-px flex-1 bg-content" />
      <span>{text}</span>
      <span className="h-px flex-1 bg-content" />
    </div>
  )
}
