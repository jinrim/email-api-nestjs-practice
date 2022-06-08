import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MessageController } from './message.controllers';
import { MessageService } from './message.service';
import { DatabaseService } from '../database.provider';
import { UtilityModule } from '../utils/utility.module';
import { UtilityService } from '../utils/utility.service';
import { RoleService } from '../restriction/role/role.service';
import { RoleModule } from '../restriction/role/role.module';
import { AuthModule } from '../restriction/auth/auth.module';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    UtilityModule,
    RoleModule,
    AuthModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, DatabaseService, UtilityService, RoleService],
  exports: [MessageService, DatabaseService, UtilityService, RoleService],
})
export class MessageModule {}
