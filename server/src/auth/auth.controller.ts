import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto } from './dto';
import { Tokens } from './types';
import { ResponseMessage } from '../decorators/responseMessage.decorator';
import { ResTransformInterceptor } from '../interceptors/response.interceptor';
import { LocalAuthGuard } from './guards/auth.guard';
import { GetCurrentUser } from '../decorators/getCurrentUser.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorator/roles.decorator';
import { Role } from './types/roles.enum';
import { AddRoleDto } from './dto/addRole.dto';
import { GoogleAuthGuard } from './guards/google.guard';
import { AuthGuard } from '@nestjs/passport';
import { GoogleUser } from './types/googleUser';

@Controller('auth')
@UseInterceptors(ResTransformInterceptor)
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/local/register')
    @ResponseMessage('User registered successfully')
    @UseInterceptors(FileInterceptor('avatar'))
    @HttpCode(HttpStatus.CREATED)
    async register(
        @UploadedFile() avatar: Express.Multer.File,
        @Body() dto: RegisterDto,
    ) {
        return this.authService.register(dto, avatar);
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
    @UseGuards(LocalAuthGuard)
    async logout(@GetCurrentUser('userId') userId: string): Promise<Tokens> {
        return this.authService.logout(userId);
    }

    @Get('/local/me')
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('User retrieved successfully')
    @UseGuards(LocalAuthGuard)
    async getMe(@GetCurrentUser('userId') userId: string) {
        return this.authService.getMe(userId);
    }

    @Post('/local/refresh')
    @HttpCode(HttpStatus.CREATED)
    @ResponseMessage('Tokens refreshed successfully')
    async refreshTokens(@Body() dto: RefreshDto) {
        return this.authService.refreshTokens(dto);
    }

    @Post('/local/add-role')
    @HttpCode(HttpStatus.CREATED)
    @Roles(Role.Admin)
    @UseGuards(LocalAuthGuard, RolesGuard)
    @ResponseMessage('Role added successfully')
    async addRole(@Body() dto: AddRoleDto) {
        return this.authService.addRole(dto);
    }

    @Get('/google/login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(GoogleAuthGuard)
    @ResponseMessage('Google login successful')
    async googleLogin() {
        return;
    }

    @Get('/google/redirect')
    @HttpCode(HttpStatus.OK)
    @UseGuards(GoogleAuthGuard)
    @ResponseMessage('Google login successful')
    async googleLoginRedirect(@GetCurrentUser() user: GoogleUser) {
        return await this.authService.googleLogin(user);
    }
}
