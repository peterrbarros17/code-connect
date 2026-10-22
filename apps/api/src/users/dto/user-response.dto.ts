import { ApiProperty } from '@nestjs/swagger';

/**
 * Representação pública do usuário: sem hash de senha e sem campo interno.
 */
export class UserResponseDto {
  @ApiProperty({ example: '3f0c1b7e-0b4a-4f0e-9a3d-2c8f5b6d7e10' })
  id: string;

  @ApiProperty({ example: 'Maria Souza' })
  name: string;

  @ApiProperty({ example: 'maria.souza@email.com' })
  email: string;

  @ApiProperty({ example: '2026-10-21T18:00:00.000Z' })
  createdAt: Date;
}
