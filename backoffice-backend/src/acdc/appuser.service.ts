
import { Connection } from 'typeorm';
import { AppUser } from './appuser.entity';

export class AppUserService {
    constructor(
        private connection: Connection,
    ) { }

    /**
     * Find an active user by username.
     * @param auUsername 
     * @returns an array of AppUser. An empty array if not found.
     */
    async findByUsername(auUsername: string): Promise<AppUser[]> {
        console.log("auService.findByUsername au.username=", auUsername);
        let whereOpts = [
            { username: auUsername },
        ];
        let auCollection = await AppUser.find({ where: whereOpts, order: { id: "DESC" } });
        return auCollection;
    }
}
