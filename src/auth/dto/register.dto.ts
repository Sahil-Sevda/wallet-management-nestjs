// src/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Tester', description: 'User full name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'hello@gmail.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'strongPassword123@',
    description: 'User password, minimum 8 characters, at least one uppercase letter, and one special character',
  })
  @MinLength(8)
   @Matches(/(?=.*[A-Z])/, {
    message: 'password must contain at least one uppercase letter',
  })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'password must contain at least one special character',
  })
  password: string;
}
