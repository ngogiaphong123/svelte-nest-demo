import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async register() {}

    async login() {}

    async logout() {}

    async refreshTokens() {}
}
