import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}
    async getUsers() {
        const users = await this.prisma.user.findMany({
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
        return users.map((user) => {
            const { roles, ...rest } = user;
            return { ...rest, roles: roles.map((role) => role.role.title) };
        });
    }
}
