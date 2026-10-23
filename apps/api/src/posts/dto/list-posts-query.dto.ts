import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { normalizeTags } from './create-post.dto.js';

export class ListPostsQueryDto {
  @ApiPropertyOptional({ example: 'componentes' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    example: 'react,front-end',
    description: 'Tags separadas por vírgula ou repetidas na query string.',
  })
  @Transform(({ value }) => normalizeTags(value))
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ enum: ['recent', 'popular'], default: 'recent' })
  @IsOptional()
  @IsIn(['recent', 'popular'])
  sort: 'recent' | 'popular' = 'recent';

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 12, minimum: 1, maximum: 50 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 12;
}
