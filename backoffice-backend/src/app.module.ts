import { Module } from '@nestjs/common';
import { AcdcModule } from './acdc/acdc.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from './auth/auth.module';
import {ScanModule} from "./scan/scan.module";

@Module({
  imports: [TypeOrmModule.forRoot(), AcdcModule, AuthModule, ScanModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
