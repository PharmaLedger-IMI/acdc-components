import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {AcdcUserService} from "../acdc/acdcuser.service";
import {AcdcUser} from "../acdc/acdcuser.entity";

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
     * @returns an AcdcUser if matched. null if not matched.
     */
    async validateUser(acdcUsername: string, acdcPassHash: string): Promise<AcdcUser> {
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
        if (acdcUserCollection[0].passHash === acdcPassHash // TODO clear text comparison to bcrypt
        ) {
            console.log("AuthService.validateUser returned ", acdcUserCollection[0]);
            return acdcUserCollection[0];
        }
        console.log("AuthService.validateUser returned null");
        return null;
    }

    /**
     * Transforms a valid AcdcUser into a valid (signed) JWT token.
     * @param acdcUser an AcdcUser object, as returned by LocalStrategy.validate()
     * @returns an object with the JWT authentication token. Please document the return type in the auth.controller.ts login method
     */
    async login(acdcUser: AcdcUser) {
        const payload = {userId: acdcUser.userId, email: acdcUser.email};
        return {
            userId: acdcUser.userId,
            email: acdcUser.email,
            token: this.jwtService.sign(payload),
        };
    }

    /**
     * Marks this JWT token as expired.
     * @param au an AcdcUser object, as returned by JwtStrategy.validate()
     * @returns an object with the JWT authentication token.
     */
    async logout(au: any) {
        // TODO
        return au;
    }
}
