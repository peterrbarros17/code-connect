export type PostAuthor = {
  id: string
  name: string
}

export type PostComment = {
  id: string
  postId: string
  parentId: string | null
  content: string
  author: PostAuthor
  createdAt: string
}

export type Post = {
  id: string
  title: string
  content: string
  code: string | null
  thumbnailUrl: string | null
  tags: string[]
  author: PostAuthor
  createdAt: string
  likesCount: number
  commentsCount: number
  likedByMe: boolean
}

export type PostDetail = Post & {
  comments: PostComment[]
}

export type PostListResponse = {
  items: Post[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type PostTag = {
  tag: string
  count: number
}

export type PostSort = 'recent' | 'popular'

export type ListPostsParams = {
  search?: string
  tags?: string[]
  sort?: PostSort
  page?: number
  limit?: number
}

export type CreatePostPayload = {
  title: string
  content: string
  code?: string
  thumbnailUrl?: string
  tags: string[]
}

export type CreateCommentPayload = {
  content: string
  parentId?: string
}

export type LikeResponse = {
  liked: boolean
  likesCount: number
}

export type UploadResponse = {
  url: string
}
