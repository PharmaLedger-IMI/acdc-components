import {Injectable} from "@nestjs/common";
import {AcdcUser} from "./acdcuser.entity";

@Injectable()
export class AcdcUserService {
    async findByEmail(email: string): Promise<AcdcUser[]> {
        console.log("AcdcUserService.findByEmail AcdcUser.email=", email);
        return await AcdcUser.find({where: {email: email}, order: {userId: "DESC"}})
    }
}