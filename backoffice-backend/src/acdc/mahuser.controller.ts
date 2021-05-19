import {Connection} from "typeorm";
import {Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiTags} from "@nestjs/swagger";
import {MahUser} from "./mahuser.entity";
import {AuthGuard} from "@nestjs/passport";

@ApiTags("MahUser")
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller("/acdc/mahuser")
export class MahUserController {
    constructor(private connection: Connection) {
    }

    @Get()
    @ApiOperation({summary: "Get all MahUsers"})
    async findAll(@Query() query: MahUser): Promise<MahUser[]> {
        let mahUserCollection = await MahUser.find({order: {mahId: "ASC"}});
        console.log("mahUser.findAll, mahUserColletion =", mahUserCollection);
        return mahUserCollection;
    }

    @Put(":id")
    @ApiOperation({summary: "Update one MahUser"})
    async update(@Param("id") id: string, @Body() mahUser: MahUser): Promise<MahUser> {
        console.log("mahUser.update... id=", id, "mahUser=", mahUser);
        const mahRepository = this.connection.getRepository(MahUser);
        await mahRepository.save(mahUser);
        console.log("mahUser.update, mahUser =", mahUser);
        return mahUser;
    }

    @Post()
    @ApiOperation({summary: "Create one MahUser"})
    async create(@Body() mahUser: MahUser): Promise<MahUser> {
        console.log("mahUser.create... mahUser=", mahUser);
        const mahRepository = this.connection.getRepository(MahUser);
        await mahRepository.save(mahUser);
        console.log("mahUser.create, mahUser =", mahUser);
        return mahUser;
    }

    @Get(":id")
    @ApiOperation({summary: "Get one MahUser"})
    async findOne(@Param("id") id: string): Promise<MahUser> {
        console.log("mahUser.findOne... id=", id);
        let mahUser = await MahUser.findOne(id);
        console.log("mahUser.findOne mahUser =", mahUser);
        return mahUser;
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete one MahUser"})
    async remove(@Param("id") id: string): Promise<void> {
        console.log("mahUser.delete... id=", id);
        const mahRepository = this.connection.getRepository(MahUser);
        const delResult = await mahRepository.delete(id);
        console.log("mahUser.delete, mahUser =", delResult.raw);
        return;
    }
}
