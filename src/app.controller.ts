import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './database.provider';
import { IResponse } from './main.type';
import { UserDto } from './user/user.dto';

const {
  DATABASE_NAME = 'email_database',
  TABLE_NAMES = 'user,user_role,message',
} = process.env;
const tables = TABLE_NAMES.split(',');

@Controller('/register')
export class AppController {
  constructor(
    private appService: AppService,
    private databaseService: DatabaseService,
  ) {}

  async onModuleInit() {
    const initialized_role = {
      id: '703f3215-e3ef-43a9-b8c2-2929721022a0',
      role: 'super_admin',
      priviledges: {
        has_read_access: true,
        has_add_access: true,
        has_edit_access: true,
        has_delete_access: true,
      },
      created_date: new Date().getTime(),
      updated_date: new Date().getTime(),
    };
    await this.databaseService.createDatabase(DATABASE_NAME);
    await this.databaseService.createTable(DATABASE_NAME, tables);
    await this.databaseService.createRecord(
      DATABASE_NAME,
      'user_role',
      initialized_role,
    );
  }
  @Post('/user')
  async registerUser(@Body() body: UserDto): Promise<IResponse<UserDto>> {
    const { email } = body;
    const existing_emails = await this.appService.checkEmailIfExist(
      'user',
      email,
    );
    if (existing_emails.length) {
      return { success: false, message: 'Email already exist!' };
    }
    return this.appService.registerRecord('user', body);
  }
  @Get('/users')
  async getAllRegisterUser(): Promise<IResponse<UserDto>> {
    return this.appService.getAllRegisterRecord('user');
  }

  @Post('/user_role')
  async registerUserRole(@Body() body: any): Promise<IResponse<UserDto>> {
    return this.appService.registerRecord('user_role', body);
  }
}
