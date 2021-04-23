import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppUserService } from '../acdc/appuser.service';
import {AcdcUserService} from "../acdc/acdcuser.service";

@Injectable()
export class AuthService {
    constructor(
        private acdcUserService: AcdcUserService,
        private jwtService: JwtService
    ) { }

    /**
     * Validate a username/password.
     * @param acdcUsername
     * @param acdcPassHash password in clear text.
     * @returns an AppUser if matched. null if not matched.
     */
    async validateUser(acdcUsername: string, acdcPassHash: string): Promise<any> {
        console.log("AuthService.validateUser ", acdcUsername, acdcPassHash);
        if (!acdcUsername) {
            console.log("AuthService.validateUser returned null because of missing username");
            return null;
        }
        const acdcUserCollection = await this.acdcUserService.findByEmail(acdcUsername);
        console.log("AuthService.validateUser found ", acdcUserCollection);
        if (!acdcUserCollection || acdcUserCollection.length == 0) {
            console.log("AuthService.validateUser returned null because username not found!");
            return null;
        }
        if (acdcUserCollection[0].passhash === acdcPassHash // TODO clear text comparison to bcrypt
        ) {
            console.log("AuthService.validateUser returned ", acdcUserCollection[0]);
            return acdcUserCollection[0];
        }
        console.log("AuthService.validateUser returned null");
        return null;
    }

    /**
     * Transforms a valid AppUser into a valid (signed) JWT token.
     * @param acdcUser an AppUser object, as returned by LocalStrategy.validate()
     * @returns an object with the JWT authentication token. Please document the return type in the auth.controller.ts login method
     */
    async login(acdcUser: any) {
        const payload = {id: acdcUser.userid, username: acdcUser.email};
        return {
            id: acdcUser.userid,
            username: acdcUser.email,
            token: this.jwtService.sign(payload),
        };
    }

    /**
     * Marks this JWT token as expired.
     * @param au an AppUser object, as returned by JwtStrategy.validate()
     * @returns an object with the JWT authentication token.
     */
    async logout(au: any) {
        // TODO
        return au;
    }
}
