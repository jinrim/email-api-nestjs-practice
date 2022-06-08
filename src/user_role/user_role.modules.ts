import { Module } from '@nestjs/common';
import { UserRoleController } from './user_role.controllers';
import { UserRoleService } from './user_role.service';
import { DatabaseService } from '../database.provider';
import { UtilityService } from '../utils/utility.service';
import { UtilityModule } from '../utils/utility.module';
import { AuthModule } from '../restriction/auth/auth.module';
import { RoleModule } from '../restriction/role/role.module';

@Module({
  imports: [AuthModule, RoleModule, UtilityModule],
  controllers: [UserRoleController],
  providers: [UserRoleService, DatabaseService, UtilityService],
  exports: [UserRoleService, DatabaseService],
})
export class UserRoleModule {}
