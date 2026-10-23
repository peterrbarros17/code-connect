import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

function trimText(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export function normalizeTags(value: unknown): string[] {
  const values = Array.isArray(value) ? value : [value];
  const tags = values.flatMap((item) =>
    String(item ?? '')
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean),
  );

  return [...new Set(tags)];
}

export class CreatePostDto {
  @ApiProperty({ example: 'Como organizar componentes React' })
  @Transform(({ value }) => trimText(value))
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @ApiProperty({
    example: 'Um resumo do que aprendi montando a estrutura do projeto.',
  })
  @Transform(({ value }) => trimText(value))
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  content: string;

  @ApiPropertyOptional({
    example: 'const total = itens.reduce((soma, item) => soma + item, 0)',
  })
  @Transform(({ value }) => trimText(value))
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  code?: string;

  @ApiPropertyOptional({
    example: '/uploads/posts/8e8f...png',
    description: 'URL absoluta ou caminho iniciado por / para a miniatura.',
  })
  @Transform(({ value }) => trimText(value))
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(/^(https?:\/\/|\/)/, {
    message: 'thumbnailUrl deve começar com http(s):// ou /.',
  })
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    example: ['react', 'front-end'],
    description: 'Até 5 tags. Também aceita uma string separada por vírgulas.',
  })
  @Transform(({ value }) => normalizeTags(value))
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Length(1, 30, { each: true })
  tags: string[] = [];
}
