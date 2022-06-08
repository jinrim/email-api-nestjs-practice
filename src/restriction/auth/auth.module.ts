import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RoleService } from '../role/role.service';
import { RoleModule } from '../role/role.module';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseService } from '../../database.provider';

@Module({
  imports: [
    RoleModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, AuthGuard, RoleService, DatabaseService],
  exports: [AuthService, RoleService],
})
export class AuthModule {}
