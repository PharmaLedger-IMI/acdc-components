import { Connection, Like } from "typeorm";
import { Controller, Req, Delete, Get, Put, Param, Body, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AppResource } from './appresource.entity';

@ApiTags('AppResource')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('/acdc/appresource')
export class AppResourceController {
    constructor(private connection: Connection) {}

    @Get()
    @ApiOperation({ summary: 'All Appresources' })
    async findAll(@Req() req): Promise<AppResource[]> {
        let aTerm = req.query.term;
        console.log("arc.findAll ... term=" + aTerm); //jpsl: How do I know that req has .query has .params ????
        let whereOpts = [];
        if (req.query.term) {
            whereOpts = [
                { key: Like("%" + aTerm + "%") },
                { value: Like("%" + aTerm + "%") },
                { help: Like("%" + aTerm + "%") }
            ];
        }
        let arcCollection = await AppResource.find({ where: whereOpts, order: { id: "ASC" } });
        console.log("arc.findAll, arcColletion =", arcCollection);
        return arcCollection;
    }

    @Get(":id")
    @ApiOperation({ summary: 'Get one Appresources' })
    async findOne(@Param() params): Promise<AppResource> {
        console.log("arc.findOne... id=", params.id);
        let arc = await AppResource.findOne(+params.id);
        console.log("arc.findOne arc =", arc);
        return arc;
    }

    @Put() // update all fields ???
    @ApiOperation({ summary: 'Create/Update one AppResource' })
    async update(@Body() arc: AppResource): Promise<AppResource> {
        console.log("arc.update... arc=", arc);
        // jpsl: Could not do arc.save(). Using repository.
        const arcRepository = this.connection.getRepository(AppResource);
        await arcRepository.save(arc); // autocommit is good enough ?
        console.log("arc.update DB connection closed, arc =", arc);
        return arc;
    }

    @Post() // update all fields ???
    @ApiOperation({ summary: 'Create/Update one AppResource' })
    async add(@Body() arc: AppResource): Promise<AppResource> {
        console.log("arc.add... arc=", arc);
        // jpsl: Could not do arc.save(). Using repository.
        const arcRepository = this.connection.getRepository(AppResource);
        await arcRepository.save(arc); // autocommit is good enough ?
        console.log("arc.add, arc =", arc);
        return arc;
    }


    @Delete(":id")
    @ApiOperation({ summary: 'Delete one AppResource' })
    async delete(@Param() params): Promise<void> {
        console.log("arc.delete... id=", params.id);
        const arcRepository = this.connection.getRepository(AppResource);
        const delResult = await arcRepository.delete(params.id); // autocommit is good enough ?
        console.log("arc.delete, arc =", delResult.raw);
        return;
    }
}

