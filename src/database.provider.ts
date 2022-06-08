import { Injectable, Logger } from '@nestjs/common';
import rethinkdbdash from 'rethinkdbdash';
import Bluebird from 'bluebird';
import { UserDto } from './user/user.dto';
import { IResponse} from './main.type';
const { HOST = 'localhost', PORT = '28015' } = process.env;

@Injectable()
export class DatabaseService {
  private client: any;
  private logger: any;
  constructor() {
    const config = {
      host: HOST,
      port: Number(PORT),
    };
    this.client = rethinkdbdash(config);
    this.logger = new Logger('DATABASE PROVIDER');
  }
  async createDatabase(database_name: string) {
    try {
      await this.client.dbCreate(database_name).run();
    } catch (error: any) {
      this.logger.warn(error.message);
    }
  }
  async createTable(database_name: string, tables: string[]) {
    await Bluebird.each(tables, async (table_name) => {
      try {
        await this.client.db(database_name).tableCreate(table_name).run();
      } catch (error: any) {
        this.logger.warn(error.message);
      }
    });
  }

  async login(
    database_name: string,
    table_name: string,
    params: Record<string, any>,
  ): Promise<IResponse<UserDto>> {
    const [user] = await this.client.db(database_name).table(table_name).filter(params).run();
    if(!user){return{success:false, message:'User does not exist.', data:[]}}
    return {success:true, message:'User successfully fetch', data:[user]}
  }

  async createRecord(
    database_name: string,
    table_name: string,
    params: Record<string, any>,
  ): Promise<IResponse<any>> {
    const { id = '' } = params;
    const { success, data: record } = await this.getRecordById(
      database_name,
      table_name,
      id,
    );
    if (!success) {
      const {inserted, generated_keys} = await this.client
      .db(database_name)
      .table(table_name)
      .insert(params)
      .run();
      const [inserted_id] = generated_keys ?? []
      if (inserted) {
        const { data } = await this.getRecordById(
          database_name,
          table_name,
          inserted_id,
        );
        return { success: true, message: 'Inserted successfully', data };
      }
      return { success: false, message: 'Failed to insert.', data: [] };
    }

    return { success: false, message: 'Record already existed', data: record };
  }

  async getRecordById(
    database_name: string,
    table_name: string,
    id: string,
  ): Promise<IResponse<any>> {
    const result = await this.client
      .db(database_name)
      .table(table_name)
      .get(id);
    if (!result) {
      return { success: false, message: 'Failed to fetch record', data: [] };
    }
    return {
      success: true,
      message: 'Fetched record successfully',
      data: [result],
    };
  }
  async getRecordByFilter(
    database_name: string,
    table_name: string,
    params: any,
  ): Promise<IResponse<any>> {
    const result = await this.client
      .db(database_name)
      .table(table_name)
      .filter(params)
      .run();
    if (!result.length) {
      return { success: false, message: 'Failed to fetch record', data: [] };
    }
    return {
      success: true,
      message: 'Fetched record successfully',
      data: result,
    };
  }
  async getAllRecord(
    database_name: string,
    table_name: string,
  ): Promise<IResponse<any>> {
    const result = await this.client.db(database_name).table(table_name).run();
    if (!result.length) {
      return { success: false, message: 'Failed to fetch record', data: [] };
    }
    return {
      success: true,
      message: 'Fetched record successfully',
      data: result,
    };
  }
  async updateRecordById(
    database_name: string,
    table_name: string,
    id: string,
    params: Record<string, any>,
  ): Promise<IResponse<any>> {
    const { replaced } = await this.client
      .db(database_name)
      .table(table_name)
      .get(id)
      .update(params)
      .run();
    const { data } = await this.getRecordById(database_name, table_name, id);
    return replaced
      ? { success: true, message: 'Updated successfully', data }
      : { success: false, message: 'Fail to update record' };
  }

  async deleteRecordById(
    database_name: string,
    table_name: string,
    id: string,
  ): Promise<IResponse<any>> {
    const { deleted } = await this.client
      .db(database_name)
      .table(table_name)
      .get(id)
      .delete()
      .run();
    return deleted
      ? { success: true, message: 'Deleted successfully' }
      : { success: false, message: 'Record does not exist' };
  }
}
