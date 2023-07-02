import {
    CanActivate,
    ExecutionContext,
    HttpException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwt: JwtService) {}
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwt.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
                publicKey: process.env.PUBLIC_KEY,
            });
            request.user = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Access token expired');
        }
    }

    private extractTokenFromHeader(request: any): string | null {
        const {
            headers: { authorization },
        } = request;
        if (authorization && authorization.split(' ')[0] === 'Bearer') {
            return authorization.split(' ')[1];
        }
        return null;
    }
}
