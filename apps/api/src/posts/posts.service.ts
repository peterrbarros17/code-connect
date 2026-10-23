import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Comment } from './entities/comment.entity.js';
import { PostLike } from './entities/post-like.entity.js';
import { Post } from './entities/post.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { ListPostsQueryDto } from './dto/list-posts-query.dto.js';
import {
  CommentResponseDto,
  PostDetailResponseDto,
  PostLikeResponseDto,
  PostListResponseDto,
  PostResponseDto,
  PostTagDto,
  PostThumbnailResponseDto,
} from './dto/post-response.dto.js';

export type UploadedImage = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;
const THUMBNAIL_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly posts: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly likes: Repository<PostLike>,
    @InjectRepository(Comment)
    private readonly comments: Repository<Comment>,
  ) {}

  async list(
    query: ListPostsQueryDto,
    currentUser?: User | null,
  ): Promise<PostListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const tags = query.tags ?? [];
    const search = query.search?.trim();

    const queryBuilder = this.posts
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.author', 'author');

    if (search) {
      queryBuilder.andWhere(
        `"post"."search_vector" @@ websearch_to_tsquery('portuguese', :search)`,
        { search },
      );
    }

    if (tags.length > 0) {
      queryBuilder.andWhere(
        '"post"."tags" @> CAST(:tags AS text[])',
        { tags },
      );
    }

    if (query.sort === 'popular') {
      queryBuilder
        .addSelect(
          `(
            SELECT COUNT(*)::int
            FROM "post_likes" "popularity_likes"
            WHERE "popularity_likes"."post_id" = "post"."id"
          )`,
          'popularity',
        )
        .orderBy('popularity', 'DESC')
        .addOrderBy('post.createdAt', 'DESC');
    } else {
      queryBuilder.orderBy('post.createdAt', 'DESC');
    }

    const [posts, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const [likedIds, likeCounts, commentCounts] = await Promise.all([
      this.getLikedPostIds(posts, currentUser),
      this.getCountByPost(this.likes, posts),
      this.getCountByPost(this.comments, posts),
    ]);

    return {
      items: posts.map((post) =>
        this.toResponse(
          post,
          likedIds.has(post.id),
          likeCounts.get(post.id) ?? 0,
          commentCounts.get(post.id) ?? 0,
        ),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(
    id: string,
    currentUser?: User | null,
  ): Promise<PostDetailResponseDto> {
    const post = await this.posts.findOne({
      where: { id },
      relations: { author: true },
    });

    if (!post) {
      throw new NotFoundException('Post não encontrado.');
    }

    const [likesCount, commentsCount, likedByMe, comments] = await Promise.all([
      this.likes.count({ where: { postId: id } }),
      this.comments.count({ where: { postId: id } }),
      currentUser
        ? this.likes.exists({
            where: { postId: id, userId: currentUser.id },
          })
        : Promise.resolve(false),
      this.comments.find({
        where: { postId: id },
        relations: { author: true },
        order: { createdAt: 'ASC' },
      }),
    ]);

    return Object.assign(
      this.toResponse(post, likedByMe, likesCount, commentsCount),
      { comments: comments.map((comment) => this.toCommentResponse(comment)) },
    );
  }

  async getTags(): Promise<PostTagDto[]> {
    const rows = (await this.posts.query(`
      SELECT tag, COUNT(*)::int AS count
      FROM "posts", unnest("tags") AS tag
      GROUP BY tag
      ORDER BY count DESC, tag ASC
    `)) as Array<{ tag: string; count: number | string }>;

    return rows.map((row) => ({
      tag: row.tag,
      count: Number(row.count),
    }));
  }

  async create(
    dto: CreatePostDto,
    author: User,
  ): Promise<PostDetailResponseDto> {
    const post = this.posts.create({
      id: randomUUID(),
      authorId: author.id,
      title: dto.title,
      content: dto.content,
      code: dto.code || null,
      thumbnailUrl: dto.thumbnailUrl || null,
      tags: dto.tags ?? [],
    });

    await this.posts.save(post);

    return this.findOne(post.id, author);
  }

  async like(postId: string, user: User): Promise<PostLikeResponseDto> {
    await this.ensurePostExists(postId);

    await this.likes
      .createQueryBuilder()
      .insert()
      .values({ postId, userId: user.id })
      .orIgnore()
      .execute();

    return {
      liked: true,
      likesCount: await this.likes.count({ where: { postId } }),
    };
  }

  async unlike(postId: string, user: User): Promise<PostLikeResponseDto> {
    await this.ensurePostExists(postId);

    await this.likes.delete({ postId, userId: user.id });

    return {
      liked: false,
      likesCount: await this.likes.count({ where: { postId } }),
    };
  }

  async addComment(
    postId: string,
    dto: CreateCommentDto,
    author: User,
  ): Promise<CommentResponseDto> {
    await this.ensurePostExists(postId);

    if (dto.parentId) {
      const parent = await this.comments.findOne({
        where: { id: dto.parentId, postId },
      });

      if (!parent) {
        throw new BadRequestException(
          'O comentário respondido não pertence a este post.',
        );
      }

      if (parent.parentId) {
        throw new BadRequestException(
          'Respostas só podem ser feitas em comentários de primeiro nível.',
        );
      }
    }

    const comment = this.comments.create({
      id: randomUUID(),
      postId,
      authorId: author.id,
      parentId: dto.parentId ?? null,
      content: dto.content,
      author,
    });

    const saved = await this.comments.save(comment);

    return this.toCommentResponse(saved);
  }

  async saveThumbnail(
    file: UploadedImage | undefined,
  ): Promise<PostThumbnailResponseDto> {
    if (!file) {
      throw new BadRequestException('Envie uma imagem no campo "image".');
    }

    if (file.size > MAX_THUMBNAIL_BYTES) {
      throw new BadRequestException('A imagem deve ter no máximo 5 MB.');
    }

    const extension = THUMBNAIL_EXTENSIONS[file.mimetype];

    if (!extension) {
      throw new BadRequestException(
        'Formato inválido. Envie JPG, PNG, WEBP ou GIF.',
      );
    }

    const directory = join(process.cwd(), 'uploads', 'posts');
    const filename = `${randomUUID()}${extension}`;

    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, filename), file.buffer);

    return { url: `/uploads/posts/${filename}` };
  }

  private async ensurePostExists(id: string): Promise<void> {
    const exists = await this.posts.exists({ where: { id } });

    if (!exists) {
      throw new NotFoundException('Post não encontrado.');
    }
  }

  private async getCountByPost<T extends { postId: string }>(
    repository: Repository<T>,
    posts: Post[],
  ): Promise<Map<string, number>> {
    if (posts.length === 0) {
      return new Map();
    }

    const rows = await repository
      .createQueryBuilder('item')
      .select('item.postId', 'postId')
      .addSelect('COUNT(*)::int', 'count')
      .where('item.postId IN (:...ids)', {
        ids: posts.map((post) => post.id),
      })
      .groupBy('item.postId')
      .getRawMany<{ postId: string; count: number | string }>();

    return new Map(rows.map((row) => [row.postId, Number(row.count)]));
  }

  private async getLikedPostIds(
    posts: Post[],
    currentUser?: User | null,
  ): Promise<Set<string>> {
    if (!currentUser || posts.length === 0) {
      return new Set();
    }

    const rows = await this.likes.find({
      where: {
        userId: currentUser.id,
        postId: In(posts.map((post) => post.id)),
      },
      select: { postId: true },
    });

    return new Set(rows.map((row) => row.postId));
  }

  private toResponse(
    post: Post,
    likedByMe: boolean,
    likesCount = 0,
    commentsCount = 0,
  ): PostResponseDto {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      code: post.code,
      thumbnailUrl: post.thumbnailUrl,
      tags: post.tags,
      author: {
        id: post.author.id,
        name: post.author.name,
      },
      createdAt: post.createdAt,
      likesCount,
      commentsCount,
      likedByMe,
    };
  }

  private toCommentResponse(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      postId: comment.postId,
      parentId: comment.parentId,
      content: comment.content,
      author: {
        id: comment.author.id,
        name: comment.author.name,
      },
      createdAt: comment.createdAt,
    };
  }
}
