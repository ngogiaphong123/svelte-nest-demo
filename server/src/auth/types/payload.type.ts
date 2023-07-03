import { Role } from './roles.enum';

export type Payload = {
    email: string;
    userId: string;
    roles: Role[];
};
