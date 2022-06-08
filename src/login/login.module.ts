import { Module } from '@nestjs/common';
import { LoginController } from './login.controllers';
import { LoginService } from './login.service';
import { DatabaseService } from '../database.provider';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [LoginController],
  providers: [LoginService, DatabaseService],
  exports: [LoginService],
})
export class LoginModule {}
