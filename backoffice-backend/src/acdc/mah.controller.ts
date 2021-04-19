import {Connection} from "typeorm";
import {Body, Controller, Delete, Get, Param, Post, Put, Query} from "@nestjs/common";
import {ApiOperation, ApiTags} from "@nestjs/swagger";
import {Mah} from "./mah.entity";

@ApiTags("Mah")
@Controller("/acdc/mah")
export class MahController {
    constructor(private connection: Connection) {
    }

    @Get()
    @ApiOperation({summary: "Get all Mah's"})
    async findAll(@Query() query: Mah): Promise<Mah[]> {
        let mahCollection = await Mah.find({order: {mahid: "ASC"}});
        console.log("mah.findAll, mahColletion =", mahCollection);
        return mahCollection;
    }

    @Put(":id")
    @ApiOperation({summary: "Update one Mah"})
    async update(@Param("id") id: string, @Body() mah: Mah): Promise<Mah> {
        console.log("mah.update... id=", id, "mah=", mah);
        const mahRepository = this.connection.getRepository(Mah);
        await mahRepository.save(mah);
        console.log("mah.update, mah =", mah);
        return mah;
    }

    @Post()
    @ApiOperation({summary: "Create one Mah"})
    async create(@Body() mah: Mah): Promise<Mah> {
        console.log("mah.create... mah=", mah);
        const mahRepository = this.connection.getRepository(Mah);
        await mahRepository.save(mah);
        console.log("mah.create, mah =", mah);
        return mah;
    }

    @Get(":id")
    @ApiOperation({summary: "Get one Mah"})
    async findOne(@Param("id") id: string): Promise<Mah> {
        console.log("mah.findOne... id=", id);
        let mah = await Mah.findOne(id);
        console.log("mah.findOne mah =", mah);
        return mah;
    }

    @Delete(":id")
    @ApiOperation({summary: "Delete one Mah"})
    async remove(@Param("id") id: string): Promise<void> {
        console.log("mah.delete... id=", id);
        const mahRepository = this.connection.getRepository(Mah);
        const delResult = await mahRepository.delete(id);
        console.log("mah.delete, mah =", delResult.raw);
        return;
    }
}
