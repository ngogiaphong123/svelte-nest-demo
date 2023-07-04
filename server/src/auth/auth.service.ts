import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshDto, RegisterDto } from './dto';
import * as argon2 from 'argon2';
import { Payload } from './types/payload.type';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role } from './types/roles.enum';
import { AddRoleDto } from './dto/addRole.dto';
import { GoogleUser } from './types/googleUser';
@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private cloudinary: CloudinaryService,
    ) {}

    async register(dto: RegisterDto, avatar: Express.Multer.File) {
        if (!avatar) {
            throw new HttpException(
                'Avatar is required',
                HttpStatus.BAD_REQUEST,
            );
        }
        const { email, password, confirmPassword, fullName } = dto;
        if (password !== confirmPassword) {
            throw new HttpException(
                'Passwords do not match',
                HttpStatus.BAD_REQUEST,
            );
        }
        const hashedPassword = await this.hashData(password);
        const userExists = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (userExists) {
            throw new HttpException(
                'User with this email already exists',
                HttpStatus.BAD_REQUEST,
            );
        }
        const { url } = await this.cloudinary.uploadFile(avatar);
        const user = await this.prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                avatarUrl: url,
                fullName: fullName,
            },
            select: {
                email: true,
                userId: true,
                avatarUrl: true,
                fullName: true,
            },
        });
        const userRole = await this.prisma.role.findUnique({
            where: {
                title: 'user',
            },
        });
        const provider = await this.prisma.authProvider.findUnique({
            where: {
                providerName: 'local',
            },
        });
        await this.prisma.hasRole.create({
            data: {
                roleId: userRole.roleId,
                userId: user.userId,
            },
        });
        await this.prisma.hasAuthProvider.create({
            data: {
                userId: user.userId,
                authProviderId: provider.id,
            },
        });
        return { ...user, role: [userRole.title] };
    }

    async login(dto: LoginDto) {
        const { email, password } = dto;
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                email: true,
                userId: true,
                password: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                title: true,
                            },
                        },
                    },
                },
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
            roles: user.roles.map((role) => role.role.title) as Role[],
        };
        const tokens = await this.generateTokens(payload);
        await this.updateRefreshToken(user.userId, tokens.refresh_token);
        return tokens;
    }

    async googleLogin(user: GoogleUser) {
        const { email, username, avatarUrl } = user;
        const userExists = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                email: true,
                userId: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                title: true,
                            },
                        },
                    },
                },
            },
        });
        if (!userExists) {
            const newUser = await this.prisma.user.create({
                data: {
                    email: email,
                    fullName: username,
                    avatarUrl: avatarUrl,
                },
                select: {
                    email: true,
                    userId: true,
                    roles: {
                        select: {
                            role: {
                                select: {
                                    title: true,
                                },
                            },
                        },
                    },
                },
            });
            const userRole = await this.prisma.role.findUnique({
                where: {
                    title: 'user',
                },
            });
            const provider = await this.prisma.authProvider.findUnique({
                where: {
                    providerName: 'google',
                },
            });
            await this.prisma.hasRole.create({
                data: {
                    roleId: userRole.roleId,
                    userId: newUser.userId,
                },
            });
            await this.prisma.hasAuthProvider.create({
                data: {
                    userId: newUser.userId,
                    authProviderId: provider.id,
                },
            });
            const payload: Payload = {
                email: newUser.email,
                userId: newUser.userId,
                roles: newUser.roles.map((role) => role.role.title) as Role[],
            };
            const tokens = await this.generateTokens(payload);
            await this.updateRefreshToken(newUser.userId, tokens.refresh_token);
            return tokens;
        }
        const payload: Payload = {
            email: userExists.email,
            userId: userExists.userId,
            roles: userExists.roles.map((role) => role.role.title) as Role[],
        };
        const tokens = await this.generateTokens(payload);
        await this.updateRefreshToken(userExists.userId, tokens.refresh_token);
        return tokens;
    }

    async logout(userId: string) {
        await this.updateRefreshToken(userId, '');
        return {
            access_token: '',
            refresh_token: '',
        };
    }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                userId: userId,
            },
            select: {
                email: true,
                userId: true,
                avatarUrl: true,
                fullName: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                title: true,
                            },
                        },
                    },
                },
            },
        });
        const { roles, ...rest } = user;
        return { ...rest, roles: roles.map((role) => role.role.title) };
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
                select: {
                    email: true,
                    userId: true,
                    roles: {
                        select: {
                            role: {
                                select: {
                                    title: true,
                                },
                            },
                        },
                    },
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
                roles: user.roles.map((role) => role.role.title) as Role[],
            };
            const tokens = await this.generateTokens(payload);
            await this.updateRefreshToken(user.userId, tokens.refresh_token);
            return tokens;
        } catch (err) {
            throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
        }
    }

    async addRole(dto: AddRoleDto) {
        const { userId, roleId } = dto;
        const user = await this.prisma.user.findUnique({
            where: {
                userId: userId,
            },
            select: {
                email: true,
                userId: true,
                roles: {
                    select: {
                        role: {
                            select: {
                                title: true,
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        const role = await this.prisma.role.findUnique({
            where: {
                roleId: roleId,
            },
        });
        if (!role) {
            throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
        }
        const hasRole = await this.prisma.hasRole.findFirst({
            where: {
                userId: userId,
                roleId: roleId,
            },
        });
        if (hasRole) {
            throw new HttpException(
                'User already has this role',
                HttpStatus.BAD_REQUEST,
            );
        }
        await this.prisma.hasRole.create({
            data: {
                roleId: roleId,
                userId: userId,
            },
        });
        return {
            message: `Role ${role.title} added to user ${user.email} successfully`,
        };
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
