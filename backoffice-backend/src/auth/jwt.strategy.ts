import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AppUser } from 'src/acdc/appuser.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'a-secret-that-should-be-moved-to-a-config-in-db',
        });
    }

    /**
     * See https://docs.nestjs.com/security/authentication
     * Do not change this's method signature.
     * The value returned will be stored as Request.user.
     * 
     * @param payload 
     * @returns an AppUser.
     * @throws UnauthorizedException if not valid login, but don't do that as the token has already been validated.
     */
    async validate(payload: any) {
        console.log("JwtStrategy.validate", payload);
        let au = new AppUser();
        au.id = payload.id;
        au.username = payload.username;
        return au;
        //throw new UnauthorizedException();
        // TODO fetch complete user related info from the DB, including roles.
    }
}
