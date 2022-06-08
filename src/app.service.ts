import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from './database.provider';
import { IResponse } from './main.type';
import { UserDto } from './user/user.dto';
const { DATABASE_NAME = 'email_database' } = process.env;

@Injectable()
export class AppService {
  logger: Logger;
  constructor(private databaseService: DatabaseService) {
    this.logger = new Logger('AppService');
  }
  async registerRecord(
    table_name: string,
    params: Record<string, any>,
  ): Promise<IResponse<UserDto>> {
    this.logger.log(params);
    return await this.databaseService.createRecord(
      DATABASE_NAME,
      table_name,
      params,
    );
  }

  async getAllRegisterRecord(table_name: string): Promise<IResponse<UserDto>> {
    return await this.databaseService.getAllRecord(DATABASE_NAME, table_name);
  }

  async checkEmailIfExist(table_name: string, email: string) {
    const {data=[]} = await this.databaseService.getRecordByFilter(
      DATABASE_NAME,
      table_name,
      { email },
    );
    return data;
  }
}
