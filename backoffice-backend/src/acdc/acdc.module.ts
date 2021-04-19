import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppResourceController } from './appresource.controller';
import { LocaleController } from './locale.controller';
import { AppUserService } from './appuser.service';
import { AcdcUserController } from "./acdcuser.controller";
import { MahController } from "./mah.controller";
import { MahUserController } from "./mahuser.controller";
import { EventController } from "./event.controller";


@Module({
  imports: [TypeOrmModule.forRoot()],
  controllers: [AppResourceController, LocaleController, AcdcUserController, MahController, MahUserController, EventController],
  providers: [AppUserService],
  exports: [AppUserService],
})
export class AcdcModule {
}