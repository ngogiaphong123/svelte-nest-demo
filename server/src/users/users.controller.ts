import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../auth/types/roles.enum';
import { LocalAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ResponseMessage } from '../decorators/responseMessage.decorator';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {}

    @Get()
    @Roles(Role.Admin)
    @UseGuards(LocalAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.OK)
    @ResponseMessage('Users retrieved successfully')
    async getUsers() {
        return this.userService.getUsers();
    }
}
