import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostAuthorDto {
  @ApiProperty({ example: '3f0c1b7e-0b4a-4f0e-9a3d-2c8f5b6d7e10' })
  id: string;

  @ApiProperty({ example: 'Maria Souza' })
  name: string;
}

export class PostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional({ nullable: true })
  code: string | null;

  @ApiPropertyOptional({ nullable: true })
  thumbnailUrl: string | null;

  @ApiProperty({ type: [String], example: ['react', 'front-end'] })
  tags: string[];

  @ApiProperty({ type: PostAuthorDto })
  author: PostAuthorDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  likesCount: number;

  @ApiProperty()
  commentsCount: number;

  @ApiProperty()
  likedByMe: boolean;
}

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  postId: string;

  @ApiPropertyOptional({ nullable: true })
  parentId: string | null;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: PostAuthorDto })
  author: PostAuthorDto;

  @ApiProperty()
  createdAt: Date;
}

export class PostDetailResponseDto extends PostResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  comments: CommentResponseDto[];
}

export class PostListResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  items: PostResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class PostLikeResponseDto {
  @ApiProperty()
  liked: boolean;

  @ApiProperty()
  likesCount: number;
}

export class PostTagDto {
  @ApiProperty({ example: 'react' })
  tag: string;

  @ApiProperty({ example: 8 })
  count: number;
}

export class PostThumbnailResponseDto {
  @ApiProperty({ example: '/uploads/posts/8e8f.png' })
  url: string;
}
