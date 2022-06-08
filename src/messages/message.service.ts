import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.provider';
import { IResponse } from '../main.type';
import { MessageDto } from './message.dto';

const { DATABASE_NAME = 'email_database' } = process.env;

@Injectable()
export class MessageService {
  constructor(private databaseService: DatabaseService) {}

  async createMessage(table_name: string, params: Record<string, any>): Promise<IResponse<MessageDto>> {
    return this.databaseService.createRecord(
      DATABASE_NAME,
      table_name,
      params,
    );
  }

  async getAllMessage(table_name: string): Promise<IResponse<MessageDto>> {
    return this.databaseService.getAllRecord(DATABASE_NAME, table_name);
  }

  async getMessageById(table_name: string, id: string): Promise<IResponse<MessageDto>> {
    return this.databaseService.getRecordById(
      DATABASE_NAME,
      table_name,
      id,
    );
  }

  async updateMessageById(
    table_name: string,
    id: string,
    params: Record<string, any>,
  ): Promise<IResponse<MessageDto>> {
    return this.databaseService.updateRecordById(
      DATABASE_NAME,
      table_name,
      id,
      params,
    );
  }
}
