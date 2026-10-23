import { Icon } from '../../atoms/Icon/Icon.tsx'
import { Input } from '../../atoms/Input/Input.tsx'
import { Tag } from '../../atoms/Tag/Tag.tsx'
import { icons } from '../../../constants/icons.ts'
import type { PostTag } from '../../../types/posts.ts'

type FilterBarProps = {
  tags: PostTag[]
  selectedTags: string[]
  search: string
  onSearchChange: (value: string) => void
  onToggleTag: (tag: string) => void
  onClear: () => void
}

export function FilterBar({
  tags,
  selectedTags,
  search,
  onSearchChange,
  onToggleTag,
  onClear,
}: FilterBarProps) {
  const suggestions = tags
    .filter((tag) => !selectedTags.includes(tag.tag))
    .slice(0, 6)

  return (
    <section className="flex flex-col gap-3" aria-label="Busca e filtros">
      <form role="search" onSubmit={(event) => event.preventDefault()} className="relative">
        <label htmlFor="post-search" className="sr-only">
          Buscar posts
        </label>
        <Input
          id="post-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por título, conteúdo ou tag"
          className="pl-11"
          autoComplete="off"
        />
        <Icon
          src={icons.search}
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2"
        />
      </form>

      <div className="flex min-h-8 flex-wrap items-center gap-2">
        {selectedTags.map((tag) => (
          <Tag
            key={tag}
            label={tag}
            variant="selected"
            onRemove={() => onToggleTag(tag)}
          />
        ))}

        {suggestions.map((tag) => (
          <Tag
            key={tag.tag}
            label={tag.tag}
            variant="suggestion"
            onClick={() => onToggleTag(tag.tag)}
          />
        ))}

        {(search || selectedTags.length > 0) && (
          <button
            type="button"
            onClick={onClear}
            className="rounded px-2 py-1 text-sm text-accent underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Limpar tudo
          </button>
        )}
      </div>
    </section>
  )
}
