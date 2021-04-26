import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AppResourceController} from './appresource.controller';
import {LocaleController} from './locale.controller';
import {AppUserService} from './appuser.service';
import {EventController} from "./event.controller";
import {EventRepository} from "./event.repository";
import {EventInputRepository} from "./eventinput.repository";
import {EventOutputRepository} from "./eventoutput.repository";
import {AcdcUserService} from "./acdcuser.service";


@Module({
    imports: [TypeOrmModule.forRoot()],
    controllers: [AppResourceController, LocaleController, EventController],
    providers: [AppUserService, EventRepository, EventInputRepository, EventOutputRepository, AcdcUserService],
    exports: [AppUserService, EventRepository, EventInputRepository, EventOutputRepository, AcdcUserService],
})
export class AcdcModule {
}
