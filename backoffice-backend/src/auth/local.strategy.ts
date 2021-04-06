import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }

    /**
     * See https://docs.nestjs.com/security/authentication
     * Do not change this's method signature.
     * The value returned will be stored as Request.user.
     * 
     * @param username from UserCredentials.username
     * @param password from UserCredentials.password in clear text.
     * @returns an AppUser if valid login.
     * @throws UnauthorizedException if not a valid login.
     */
    async validate(username: string, password: string): Promise<any> {
        console.log("LocalStrategy.validate ",username, password);
        const au = await this.authService.validateUser(username, password);
        if (!au) {
            throw new UnauthorizedException();
        }
        return au;
    }
}
