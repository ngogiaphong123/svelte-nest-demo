import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
@Module({
    imports: [PrismaModule, AuthModule, CloudinaryModule, UsersModule],
    controllers: [UsersController],
    providers: [UsersService],
})
export class AppModule {}
