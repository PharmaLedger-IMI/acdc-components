import {Connection, Like} from "typeorm";
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Locale } from './locale.entity';

@ApiTags('Locale')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('/acdc/locale')
export class LocaleController {
    constructor(private connection: Connection) {}
    
    @Get()
    @ApiOperation({ summary: 'All Locales' })
    async findAll(): Promise<Locale[]> {
	    let locCollection = await Locale.find({ order: { code: "ASC" } });
	    console.log("DB connection closed, locColletion =", locCollection);
        return locCollection;
    }

    @Get("search")
    @ApiOperation({ summary: 'Search Locales' })
    async search(@Req() params): Promise<Locale[]> {
        const code = params.query['code'];
        console.log("locale.search ... code=", code);
        let locales: Locale[] = await Locale.find({
            where: {code: Like(`%${code}%`)},
            take: 5,
            order: {code: "ASC"}
        });
        console.log("local.search, code=" + code + " found: ", locales);
        return locales;
    }

    @Get(":code")
    async findOne(@Param() params): Promise<Locale> {
        const code = params.code;
        console.log("locale.findOne... code=", code);
        let locale = await Locale.findOne(code);
        console.log("locale.findOne, code=" + code + " found: ", locale);
        return locale;
    }

    @Put() // update all fields ???
    async update(@Body() locale : Locale): Promise<Locale> {
        console.log("locale.update... locale=", locale);
        // jpsl: Could not do arc.save(). Using repository.
        const arcRepository = this.connection.getRepository(Locale);
        await arcRepository.save(locale); // autocommit is good enough ?
        console.log("locale.update DB, locale =", locale, " found:", locale);
        return locale;
    }

    @Post()
    async add(@Body() locale : Locale): Promise<Locale> {
        console.log("locale.add locale=", locale);
        const localeRepository = this.connection.getRepository(Locale);
        await localeRepository.save(locale);
        console.log("locale.add, locale =", locale);
        return locale;
    }

    @Delete(":code")
    async deleteOne(@Param() params): Promise<void> {
        const code = params.code
        console.log("locale.deleteOne ... code=", code);
        await Locale.delete(code);
        console.log("arc.deleteOne code=" + code);
    }
}

