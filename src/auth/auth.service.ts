// src/auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const { name, email, password } = dto;

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new BadRequestException('Email is already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Using a transaction to ensure both user and wallet are created successfully
        const user = await this.prisma.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });

            const wallet = await tx.wallet.create({
                data: {
                    userId: createdUser.id,
                    balance: 0,
                },
            });

            return createdUser;
        });

        return {
            message: 'User registered successfully',
            user: {
                name: user.name,
                email: user.email,
            },
        };
    }

    async login(dto: LoginDto) {
        const { email, password } = dto;

        // Find by email
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('The email address is not registered');
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Create JWT payload
        const payload = { id: user.id, email: user.email, role: user.role };

        // Sign JWT token
        const token = this.jwtService.sign(payload);
        // Update lastLogin timestamp
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        return { access_token: token };
    }
}
