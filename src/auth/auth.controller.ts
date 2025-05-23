import {
    Body, Controller, Post, BadRequestException, UnauthorizedException,
    InternalServerErrorException,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiBody({
        type: RegisterDto,
        examples: {
            example1: {
                summary: 'Sample registration',
                value: {
                    name: 'testing',
                    email: 'testing@wallet.com',
                    password: 'strongPassword123@',
                },
            },
        },
    })
    async register(@Body() dto: RegisterDto) {
        try {
            return await this.authService.register(dto);
        } catch (error) {
            console.error('Registration error:', error);
            throw new HttpException(error.message || 'Registration failed', error.status || HttpStatus.INTERNAL_SERVER_ERROR);

        }
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({ status: 200, description: 'User logged in successfully' })
    @ApiBody({
        type: LoginDto,
        examples: {
            example1: {
                summary: 'Sample login',
                value: {
                    email: 'testing@wallet.com',
                    password: 'strongPassword123@',
                },
            },
        },
    })
    async login(@Body() dto: LoginDto) {
        try {
            return this.authService.login(dto);
        } catch (error) {
            throw new HttpException(error.message || 'Login failed', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
