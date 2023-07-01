import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/local/register')
    async register() {
        return this.authService.register();
    }

    @Post('/local/login')
    async login() {
        return this.authService.login();
    }

    @Post('/local/logout')
    async logout() {
        return this.authService.logout();
    }

    @Post('/local/refresh')
    async refreshTokens() {
        return this.authService.refreshTokens();
    }
}
