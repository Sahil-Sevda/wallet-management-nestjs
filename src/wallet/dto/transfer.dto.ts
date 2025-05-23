import { IsEmail, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
  @ApiProperty({ example: 'hello@gmail.com', description: 'Receiver email address' })
  @IsEmail()
  receiverEmail: string;

  @ApiProperty({ example: 100, description: 'Amount to transfer' })
  @IsNumber()
  @Min(1)
  amount: number;
}
