import { IsNotEmpty, IsString } from 'class-validator';

export class AddRoleDto {
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    roleId: string;
}
