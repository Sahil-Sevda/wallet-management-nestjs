import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({ example: 50, description: 'Amount to withdraw' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Withdraw for shopping', description: 'Description of the withdrawal' })
  @IsString()
  @MinLength(3)
  description: string;
}
