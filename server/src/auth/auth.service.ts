import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshDto, RegisterDto } from './dto';
import * as argon2 from 'argon2';
import { Payload } from './types/payload.type';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService) {}

    async register(dto: RegisterDto) {
        const { email, password, confirmPassword } = dto;
        if (password !== confirmPassword) {
            throw new HttpException(
                'Passwords do not match',
                HttpStatus.BAD_REQUEST,
            );
        }
        const hashedPassword = await this.hashData(password);
        const user = await this.prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
            },
            select: {
                email: true,
                userId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return user;
    }

    async login(dto: LoginDto) {
        const { email, password } = dto;
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!user) {
            throw new HttpException(
                'Invalid credentials',
                HttpStatus.BAD_REQUEST,
            );
        }
        const isPasswordValid = await this.verifyHash(user.password, password);
        if (!isPasswordValid) {
            throw new HttpException(
                'Invalid credentials',
                HttpStatus.BAD_REQUEST,
            );
        }
        const payload: Payload = {
            email: user.email,
            userId: user.userId,
        };
        const tokens = await this.generateTokens(payload);
        await this.updateRefreshToken(user.userId, tokens.refresh_token);
        return tokens;
    }

    async logout(userId: string) {
        await this.updateRefreshToken(userId, '');
        return {
            access_token: '',
            refresh_token: '',
        };
    }

    async refreshTokens(dto: RefreshDto) {
        try {
            const { refresh_token } = dto;
            const decoded = await this.verifyToken(refresh_token);
            const user = await this.prisma.user.findFirst({
                where: {
                    userId: decoded.userId,
                    refreshToken: refresh_token,
                },
            });
            if (!user) {
                throw new HttpException(
                    'Invalid token',
                    HttpStatus.BAD_REQUEST,
                );
            }
            const payload: Payload = {
                email: user.email,
                userId: user.userId,
            };
            const tokens = await this.generateTokens(payload);
            await this.updateRefreshToken(user.userId, tokens.refresh_token);
            return tokens;
        } catch (err) {
            throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
        }
    }

    async hashData(data: string) {
        return await argon2.hash(data);
    }

    async verifyHash(hashedData: string, plainData: string) {
        return await argon2.verify(hashedData, plainData);
    }

    async generateTokens(payload: Payload) {
        const access_token = await this.jwt.signAsync(payload, {
            expiresIn: process.env.ACCESS_TOKEN_TTL,
            privateKey: process.env.PRIVATE_KEY,
            secret: process.env.JWT_SECRET,
        });
        const refresh_token = await this.jwt.signAsync(payload, {
            expiresIn: process.env.REFRESH_TOKEN_TTL,
            privateKey: process.env.PRIVATE_KEY,
            secret: process.env.JWT_SECRET,
        });
        return { access_token, refresh_token };
    }

    async verifyToken(token: string) {
        return await this.jwt.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
            publicKey: process.env.PUBLIC_KEY,
        });
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        await this.prisma.user.update({
            where: {
                userId: userId,
            },
            data: {
                refreshToken: refreshToken,
            },
        });
    }
}
