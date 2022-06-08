import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.provider';
import { IResponse } from '../main.type';
import { UserDto } from './user.dto';

const { DATABASE_NAME = 'email_database' } = process.env;

@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}

  async createUser(table_name: string, params: UserDto): Promise<IResponse<UserDto>> {
    return this.databaseService.createRecord(
      DATABASE_NAME,
      table_name,
      params,
    );
  }

  async getAllUser(table_name: string): Promise<IResponse<UserDto>> {
    return this.databaseService.getAllRecord(DATABASE_NAME, table_name);
  }

  async getUserById(table_name: string, id: string): Promise<IResponse<UserDto>> {
    return this.databaseService.getRecordById(
      DATABASE_NAME,
      table_name,
      id,
    );
  }

  async updateUserById(
    table_name: string,
    id: string,
    params: Record<string, any>,
  ): Promise<IResponse<UserDto>> {
    return this.databaseService.updateRecordById(
      DATABASE_NAME,
      table_name,
      id,
      params,
    );
  }

  async deleteUserById(table_name: string, id: string): Promise<IResponse<UserDto>> {
    return this.databaseService.deleteRecordById(
      DATABASE_NAME,
      table_name,
      id,
    );
  }
}
