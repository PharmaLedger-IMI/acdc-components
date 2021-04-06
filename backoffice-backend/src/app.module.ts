import { Module } from '@nestjs/common';
import { AcdcModule } from './acdc/acdc.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AcdcModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
