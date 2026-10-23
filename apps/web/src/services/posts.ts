import type {
  CreateCommentPayload,
  CreatePostPayload,
  LikeResponse,
  ListPostsParams,
  PostComment,
  PostDetail,
  PostListResponse,
  PostTag,
  UploadResponse,
} from '../types/posts.ts'
import { api } from './api.ts'

export async function listPosts(params: ListPostsParams = {}): Promise<PostListResponse> {
  const { data } = await api.get<PostListResponse>('/posts', {
    params: {
      search: params.search || undefined,
      tags: params.tags?.length ? params.tags.join(',') : undefined,
      sort: params.sort ?? 'recent',
      page: params.page ?? 1,
      limit: params.limit ?? 12,
    },
  })

  return data
}

export async function getPostTags(): Promise<PostTag[]> {
  const { data } = await api.get<PostTag[]>('/posts/tags')

  return data
}

export async function getPost(id: string): Promise<PostDetail> {
  const { data } = await api.get<PostDetail>(`/posts/${id}`)

  return data
}

export async function createPost(payload: CreatePostPayload): Promise<PostDetail> {
  const { data } = await api.post<PostDetail>('/posts', payload)

  return data
}

export async function likePost(id: string): Promise<LikeResponse> {
  const { data } = await api.post<LikeResponse>(`/posts/${id}/likes`)

  return data
}

export async function unlikePost(id: string): Promise<LikeResponse> {
  const { data } = await api.delete<LikeResponse>(`/posts/${id}/likes`)

  return data
}

export async function createComment(
  postId: string,
  payload: CreateCommentPayload,
): Promise<PostComment> {
  const { data } = await api.post<PostComment>(`/posts/${postId}/comments`, payload)

  return data
}

export async function uploadPostThumbnail(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('image', file)

  const { data } = await api.post<UploadResponse>('/posts/thumbnail', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return data
}
