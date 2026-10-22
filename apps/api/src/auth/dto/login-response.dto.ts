import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'Access token JWT. Envie no header Authorization: Bearer <token>.',
  })
  access_token: string;

  @ApiProperty({ example: 'Bearer' })
  token_type: string;

  @ApiProperty({
    example: 3600,
    description: 'Segundos até a expiração do access token.',
  })
  expires_in: number;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
