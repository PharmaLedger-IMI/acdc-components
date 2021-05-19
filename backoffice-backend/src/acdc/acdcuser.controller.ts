import {Connection} from "typeorm";
import {Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import {AcdcUser} from "./acdcuser.entity";
import {AuthGuard} from "@nestjs/passport";

@ApiTags("AcdcUser")
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller("/acdc/acdcuser")
export class AcdcUserController {
    constructor(private connection: Connection) {
    }

    @Get()
    @ApiOperation({summary: "Get all AcdcUsers"})
    async findAll(@Query() query: AcdcUser): Promise<AcdcUser[]> {
        let acdcUserCollection = await AcdcUser.find({order: {userId: "ASC"}});
        console.log("acdcUser.findAll, acdcUserColletion =", acdcUserCollection);
        return acdcUserCollection;
    }

    @Put(":id")
    @ApiOperation({summary: "Update one AcdcUser"})
    async update(@Param("id") id: string, @Body() acdcUser: AcdcUser): Promise<AcdcUser> {
        console.log("acdcUser.update... acdcUser=", acdcUser);
        const acdcUserRepository = this.connection.getRepository(AcdcUser);
        await acdcUserRepository.save(acdcUser);
        console.log("acdcUser.update, acdcUser =", acdcUser);
        return acdcUser;
    }

    @Post()
    @ApiOperation({summary: "Create one AcdcUser"})
    async create(@Body() acdcUser: AcdcUser): Promise<AcdcUser> {
        console.log("acdcUser.create... acdcUser=", acdcUser);
        const acdcUserRepository = this.connection.getRepository(AcdcUser);
        await acdcUserRepository.save(acdcUser);
        console.log("acdcUser.create, acdcUser =", acdcUser);
        return acdcUser;
    }

    @Get(":id")
    @ApiOperation({summary: "Get one AcdcUser"})
    async findOne(@Param("id") id: string): Promise<AcdcUser> {
        console.log("acdcUser.findOne... id=", id);
        let acdcUser = await AcdcUser.findOne(id);
        console.log("acdcUser.findOne acdcUser =", acdcUser);
        return acdcUser;
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete one AcdcUser"})
    async remove(@Param("id") id: string): Promise<void> {
        console.log("acdcUser.delete... id=", id);
        const acdcUserRepository = this.connection.getRepository(AcdcUser);
        const delResult = await acdcUserRepository.delete(id);
        console.log("acdcUser.delete, acdcUser =", delResult.raw);
        return;
    }
}
