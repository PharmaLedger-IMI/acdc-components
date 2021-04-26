import {Module} from '@nestjs/common';
import {ScanController} from './scan.controller';
import {ScanService} from "./scan.service";
import {AcdcModule} from "../acdc/acdc.module";
import {EventRepository} from "../acdc/event.repository";
import {EventInputRepository} from "../acdc/eventinput.repository";
import {EventOutputRepository} from "../acdc/eventoutput.repository";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([EventRepository, EventInputRepository, EventOutputRepository]), AcdcModule],
    controllers: [ScanController],
    providers: [ScanService],
})
export class ScanModule {
}
