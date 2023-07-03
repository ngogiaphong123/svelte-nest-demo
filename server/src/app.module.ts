import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config';
@Module({
    imports: [
        PrismaModule,
        AuthModule,
        CloudinaryModule,
        ConfigModule.forRoot(),
    ],
})
export class AppModule {}
