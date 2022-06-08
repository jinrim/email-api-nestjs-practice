import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { MenuController } from './menu.controllers';
import { MenuService } from './menu.services';
import { DatabaseService } from '../database.provider';
import { UtilityService } from '../utils/utility.service';
import { RoleService } from '../restriction/role/role.service';
import { AuthModule } from '../restriction/auth/auth.module';
import { RoleModule } from '../restriction/role/role.module';

@Module({
  imports: [
    AuthModule,
    RoleModule,
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [MenuController],
  providers: [MenuService, DatabaseService, UtilityService, RoleService],
  exports: [MenuService],
})
export class MenuModule {}
