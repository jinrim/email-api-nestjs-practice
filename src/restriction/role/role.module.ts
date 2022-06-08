import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { JwtModule } from '@nestjs/jwt';
import { RoleGuard } from './role.guard';
import { DatabaseService } from '../../database.provider';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [RoleService, RoleGuard, DatabaseService],
  exports: [RoleService],
})
export class RoleModule {}
