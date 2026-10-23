import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post as HttpPost,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { ListPostsQueryDto } from './dto/list-posts-query.dto.js';
import {
  CommentResponseDto,
  PostDetailResponseDto,
  PostLikeResponseDto,
  PostListResponseDto,
  PostTagDto,
  PostThumbnailResponseDto,
} from './dto/post-response.dto.js';
import { PostsService, UploadedImage } from './posts.service.js';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Lista posts com busca, filtros e ordenação' })
  @ApiOkResponse({ type: PostListResponseDto })
  list(
    @Query() query: ListPostsQueryDto,
    @CurrentUser() user?: User | null,
  ): Promise<PostListResponseDto> {
    return this.postsService.list(query, user);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Lista as tags existentes com contagem de posts' })
  @ApiOkResponse({ type: [PostTagDto] })
  tags(): Promise<PostTagDto[]> {
    return this.postsService.getTags();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Detalha um post e seus comentários' })
  @ApiOkResponse({ type: PostDetailResponseDto })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user?: User | null,
  ): Promise<PostDetailResponseDto> {
    return this.postsService.findOne(id, user);
  }

  @HttpPost()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria um post' })
  @ApiCreatedResponse({ type: PostDetailResponseDto })
  create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: User,
  ): Promise<PostDetailResponseDto> {
    return this.postsService.create(dto, user);
  }

  @HttpPost('thumbnail')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Faz upload da miniatura de um post' })
  @ApiCreatedResponse({ type: PostThumbnailResponseDto })
  uploadThumbnail(
    @UploadedFile() file: UploadedImage | undefined,
  ): Promise<PostThumbnailResponseDto> {
    return this.postsService.saveThumbnail(file);
  }

  @HttpPost(':id/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Curti um post' })
  @ApiCreatedResponse({ type: PostLikeResponseDto })
  like(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ): Promise<PostLikeResponseDto> {
    return this.postsService.like(id, user);
  }

  @Delete(':id/likes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a curtida de um post' })
  @ApiOkResponse({ type: PostLikeResponseDto })
  unlike(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: User,
  ): Promise<PostLikeResponseDto> {
    return this.postsService.unlike(id, user);
  }

  @HttpPost(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comenta ou responde um comentário' })
  @ApiCreatedResponse({ type: CommentResponseDto })
  comment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: User,
  ): Promise<CommentResponseDto> {
    return this.postsService.addComment(id, dto, user);
  }
}
