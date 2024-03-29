import { Controller, Request, Body, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { UserCredentials } from './usercredentials';

@ApiTags('Authentication')
@Controller('/auth')
export class AuthController {
    constructor(
        private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('/login')
    @ApiOkResponse({
        description: 'The credentials are validated, and user session information is returned.',
        schema: {
            type: "object",
            properties: {
                userId: { type: 'string' },
                email: { type: 'string' },
                token: { type: 'string' },
            }
        },
   })
   @ApiUnauthorizedResponse({ description: 'The credentials are not valid.', })
    async login(@Body() userCredentials: UserCredentials, @Request() req: any) {
        // @Body is here to tell swagger what fields are required.
        // local.strategy already validated the username/password and filled req.user with an AcdcUser
        let auDb = req.user;
        console.log("/auth/login auDb =", auDb);
        return this.authService.login(auDb);
    }


    // just to test the /login
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'Get information from an authenticated user.',
        schema: {
            type: "object",
            properties: {
                userId: { type: 'string' },
                email: { type: 'string' }
            }
        },
    })
    @Post('/get/current')
    async getCurrentLoggedUser(@Request() req: any) {
        if (req.user) {
            return req.user;
        } else {
            return null;
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('/logout')
    async logout(@Request() req: any) {
        return await this.authService.logout(req.user)
    }
}

