import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseService } from '../database.provider';
import { AuthModule } from '../restriction/auth/auth.module';
import { RoleModule } from '../restriction/role/role.module';
import { UtilityModule } from '../utils/utility.module';
import { UtilityService } from '../utils/utility.service';

@Module({
  imports: [AuthModule, RoleModule, UtilityModule],
  controllers: [UserController],
  providers: [UserService, DatabaseService, UtilityService],
  exports: [UserService, DatabaseService],
})
export class UserModule {}
