import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Gostei muito da explicação!' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({
    example: '30d5f0cf-0cc8-4f17-8ac8-9a1e06b27b3d',
    description: 'Id do comentário respondido (apenas respostas de 1º nível).',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
