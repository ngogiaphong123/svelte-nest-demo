import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto } from './dto';
import { Tokens } from './types';
import { ResponseMessage } from '../decorators/response_message.decorator';
import { ResTransformInterceptor } from '../interceptors/response.interceptor';

@Controller('auth')
@UseInterceptors(ResTransformInterceptor)
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/local/register')
    @ResponseMessage('User registered successfully')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('/local/login')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('User logged in successfully')
    async login(@Body() dto: LoginDto): Promise<Tokens> {
        return this.authService.login(dto);
    }

    @Post('/local/logout')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('User logged out successfully')
    async logout(): Promise<Tokens> {
        return this.authService.logout();
    }

    @Post('/local/refresh')
    @HttpCode(HttpStatus.CREATED)
    @ResponseMessage('Tokens refreshed successfully')
    async refreshTokens(@Body() dto: RefreshDto) {
        return this.authService.refreshTokens(dto);
    }
}
