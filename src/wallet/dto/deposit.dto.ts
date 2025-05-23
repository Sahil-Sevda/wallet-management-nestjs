import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({ example: 100, description: 'Amount to deposit' })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 'Deposit for groceries', description: 'Description of the deposit' })
  @IsString()
  @MinLength(3)
  description: string;
}
