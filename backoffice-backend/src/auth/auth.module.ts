import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AcdcModule } from '../acdc/acdc.module';

@Module({
  imports: [
    AcdcModule,
    PassportModule,
    JwtModule.register({
       secret: 'a-secret-that-should-be-moved-to-a-config-in-db',
       signOptions: { expiresIn: '120s' },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule { }
