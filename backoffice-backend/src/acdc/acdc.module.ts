import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppResourceController} from './appresource.controller';
import {LocaleController} from './locale.controller';
import {EventController} from "./event.controller";
import {EventRepository} from "./event.repository";
import {EventInputRepository} from "./eventinput.repository";
import {EventOutputRepository} from "./eventoutput.repository";
import {AcdcUserService} from "./acdcuser.service";
import { EventService } from './event.service';


@Module({
    imports: [TypeOrmModule.forRoot()],
    controllers: [AppResourceController, LocaleController, EventController],
    providers: [EventRepository, EventInputRepository, EventOutputRepository, EventService, AcdcUserService],
    exports: [EventRepository, EventInputRepository, EventOutputRepository, AcdcUserService],
})
export class AcdcModule {
}
