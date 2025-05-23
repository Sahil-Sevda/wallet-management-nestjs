import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UsePipes,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { TransactionHistoryDto } from './dto/transaction-history.dto';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post('deposit')
  @Roles('endUser')
  @ApiOperation({ summary: 'Deposit funds into user wallet' })
  @ApiResponse({ status: 201, description: 'Deposit successful' })
  @ApiBody({
    type: DepositDto,
    examples: {
      example1: {
        value: {
          amount: 500,
          description:'Deposit'
        },
      },
    },
  })
  async deposit(@Body() dto: DepositDto, @Req() req) {
    try {
      return await this.walletService.deposit(req.user.userId, dto);
    } catch (error) {
      throw new HttpException(error.message || 'Deposit failed', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('withdraw')
  @Roles('endUser')
  @ApiOperation({ summary: 'Withdraw funds from user wallet' })
  @ApiResponse({ status: 201, description: 'Withdrawal successful' })
  @ApiBody({
    type: WithdrawDto,
    examples: {
      example1: {
        value: {
          amount: 300,
          description:'Withdraw'
        },
      },
    },
  })
  async withdraw(@Body() dto: WithdrawDto, @Req() req) {
    try {
      return await this.walletService.withdraw(req.user.userId, dto);
    } catch (error) {
      throw new HttpException(error.message || 'Withdrawal failed', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('transfer')
  @Roles('endUser')
  @ApiOperation({ summary: 'Transfer funds to another user' })
  @ApiResponse({ status: 201, description: 'Transfer successful' })
  @ApiBody({
    type: TransferDto,
    examples: {
      example1: {
        value: {
          amount: 250,
          receiverEmail: 'receiver@example.com',
        },
      },
    },
  })
  async transfer(@Body() dto: TransferDto, @Req() req) {
    try {
      return await this.walletService.transfer(req.user.userId, req.user.email, dto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Transfer failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('transactions')
  @Roles('endUser')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiQuery({ name: 'type', required: false, enum: ['deposit', 'withdrawal', 'transfer_in', 'transfer_out'] })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getTransactions(@Req() req, @Query() query: TransactionHistoryDto) {
    try {
      return await this.walletService.getTransactionHistory(req.user.userId, query);
    } catch (error) {
      throw new HttpException('Failed to fetch transactions', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('all-wallets')
  @Roles('admin')
  @ApiOperation({ summary: 'Admin: Get all user wallets' })
  async getAllWallets(@Req() req) {
    try {
      return await this.walletService.getAllWallets();
    } catch (error) {
      throw new HttpException('Failed to fetch wallets', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('reverse-transaction')
  @Roles('admin')
  @ApiOperation({ summary: 'Admin: Reverse a specific transaction' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        transactionId: {
          type: 'string',
          example: 'txn_abc123456',
        },
      },
    },
  })
  async reverseTransaction(@Body('transactionId') transactionId: string, @Req() req) {
    try {
      return await this.walletService.reverseTransaction(transactionId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to reverse transaction',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
