// src/wallet/wallet.service.ts
import { Injectable, BadRequestException, NotFoundException, HttpStatus, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransactionHistoryDto } from './dto/transaction-history.dto';
import { TransferDto } from './dto/transfer.dto';
import { send } from 'process';
@Injectable()
export class WalletService {
    constructor(private prisma: PrismaService) { }

    async deposit(userId: string, dto: DepositDto) {
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) throw new NotFoundException('Wallet not found');

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: wallet.balance + dto.amount },
            });

            await tx.transaction.create({
                data: {
                    amount: dto.amount,
                    description: dto.description,
                    type: 'deposit',
                    walletId: wallet.id,
                    userId: userId,
                },
            });

            return { message: 'Deposit successful' };
        });
    }

    async withdraw(userId: string, dto: WithdrawDto) {
        return this.prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) throw new NotFoundException('Wallet not found');
            if (wallet.balance < dto.amount) throw new BadRequestException('Insufficient balance');

            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: wallet.balance - dto.amount },
            });

            await tx.transaction.create({
                data: {
                    amount: dto.amount,
                    description: dto.description,
                    type: 'withdrawal',
                    walletId: wallet.id,
                    userId: userId,
                },
            });

            return { message: 'Withdrawal successful' };
        });
    }

    async transfer(senderId: string, senderEmail: string, dto: TransferDto) {
        const { receiverEmail, amount } = dto;

        return this.prisma.$transaction(async (tx) => {
            const senderWallet = await tx.wallet.findUnique({ where: { userId: senderId } });
            if (!senderWallet) {
                throw new HttpException('Sender wallet not found', HttpStatus.NOT_FOUND);
            }
            if (senderWallet.balance < amount) {
                throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
            }

            const receiverUser = await tx.user.findUnique({ where: { email: receiverEmail } });
            if (!receiverUser) {
                throw new HttpException('Receiver not found', HttpStatus.NOT_FOUND);
            }

            const receiverWallet = await tx.wallet.findUnique({ where: { userId: receiverUser.id } });
            if (!receiverWallet) {
                throw new HttpException('Receiver wallet not found', HttpStatus.NOT_FOUND);
            }

            await tx.wallet.update({
                where: { id: senderWallet.id },
                data: { balance: senderWallet.balance - amount },
            });

            await tx.wallet.update({
                where: { id: receiverWallet.id },
                data: { balance: receiverWallet.balance + amount },
            });
            await tx.transaction.createMany({
                data: [
                    {
                        userId: senderId,
                        walletId: senderWallet.id,
                        receiverId: receiverUser.id,
                        type: 'transfer_out',
                        amount,
                        description: `Transfer to ${receiverUser.email}`,
                    },
                    {
                        userId: receiverUser.id,
                        walletId: receiverWallet.id,
                        senderId: senderId,
                        type: 'transfer_in',
                        amount,
                        description: `Received from ${senderEmail}`,
                    },
                ],
            });

            return { message: 'Transfer successful' };
        });
    }

    async getTransactionHistory(userId: string, filter: TransactionHistoryDto) {
        const { type, page = 1, limit = 10 } = filter;
        console.log(type);
        const match: any = { userId: userId };

        if (type) {
            match.type = type;
        }

        const transactions = await this.prisma.transaction.findMany({
            where: match,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                amount: true,
                type: true,
                description: true,
                createdAt: true,
                isReversed: true,
                updatedAt: true,
                senderId: true,
                receiverId: true,
                walletId:true
            }
        });

        return transactions;
    }

    async reverseTransaction(transactionId: string) {
        return this.prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.findUnique({ where: { id: transactionId } });
            if (!transaction) {
                throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
            }

            // is transaction type allowed to reverse
            if (transaction.isReversed) {
                throw new HttpException('Transaction already reversed', HttpStatus.BAD_REQUEST);
            }

            const wallet = await tx.wallet.findUnique({ where: { id: transaction.walletId } });
            if (!wallet) {
                throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
            }

            // reverse amount
            let reverseAmount = transaction.amount;
            if (['withdrawal', 'transfer_out'].includes(transaction.type)) {
                reverseAmount = transaction.amount; // credit back
            } else if (['deposit', 'transfer_in'].includes(transaction.type)) {
                reverseAmount = -transaction.amount; // debit back
            } else {
                throw new HttpException('Transaction type cannot be reversed', HttpStatus.BAD_REQUEST);
            }

            // Update wallet balance
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: wallet.balance + reverseAmount },
            });

            // Mark original transaction as reversed
            await tx.transaction.update({
                where: { id: transactionId },
                data: { isReversed: true },
            });

            return { message: 'Transaction reversed successfully' };
        });
    }

    async getAllWallets() {
        return this.prisma.wallet.findMany({
            include: { user: { select: { name: true, email: true } } },
        });
    }





}
