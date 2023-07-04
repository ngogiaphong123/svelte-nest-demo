import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        CloudinaryModule,
        UsersModule,
        ConfigModule.forRoot(),
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
