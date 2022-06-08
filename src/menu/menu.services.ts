import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database.provider';
import { RoleService } from '../restriction/role/role.service';
import { EMenuTypes } from './menu.dto';
import { EMessageStatuses, MessageDto } from '../messages/message.dto';
import { reduce } from 'bluebird';
import { IResponse } from '../main.type';
import { UserDto } from '../user/user.dto';

const { DATABASE_NAME = 'email_database' } = process.env;

@Injectable()
export class MenuService {
  private roleService: RoleService;
  constructor(private databaseService: DatabaseService) {
    this.roleService = new RoleService(new JwtService(), this.databaseService);
  }
  async getLoggedinUser(access_token: string): Promise<UserDto> {
    return this.roleService.getLoggedinUser(access_token);
  }
  async getUserMessagesByMenuType({
    table_name,
    menu_type,
    user_email,
  }: Record<string, any>): Promise<IResponse<MessageDto>> {
    switch (menu_type) {
      case EMenuTypes.STARRED:
        return this.databaseService.getRecordByFilter(
          DATABASE_NAME,
          table_name,
          (message: any) => {
            return message('sender')
              .eq(user_email)
              .or(message('recipient').eq(user_email))
              .and(message('status').eq(EMessageStatuses.STARRED));
          },
        );
      case EMenuTypes.IMPORTANT:
        return await this.databaseService.getRecordByFilter(
          DATABASE_NAME,
          table_name,
          (message: any) => {
            return message('sender')
              .eq(user_email)
              .or(message('recipient').eq(user_email))
              .and(message('status').eq(EMessageStatuses.IMPORTANT));
          },
        );
      case EMenuTypes.INBOX:
        return await this.databaseService.getRecordByFilter(
          DATABASE_NAME,
          table_name,
          (message: any) => {
            return message('recipient')
              .eq(user_email)
              .and(message('status').ne(EMessageStatuses.DRAFT));
          },
        );
      case EMenuTypes.SENT:
        return await this.databaseService.getRecordByFilter(
          DATABASE_NAME,
          table_name,
          (message: any) => {
            return message('sender')
              .eq(user_email)
              .and(message('status').ne(EMessageStatuses.DRAFT));
          },
        );
      case EMenuTypes.DRAFT:
        return await this.databaseService.getRecordByFilter(
          DATABASE_NAME,
          table_name,
          {
            sender: user_email,
            status: EMessageStatuses.DRAFT,
          },
        );
      default:
        return { success: true, message: 'No record exist', data: [] };
    }
  }

  async getMessageById(
    table_name: string,
    id: string,
  ): Promise<IResponse<MessageDto>> {
    return this.databaseService.getRecordById(
      DATABASE_NAME,
      table_name,
      id,
    ) as Promise<IResponse<MessageDto>>;
  }

  async createReplyMessage(
    table_name: string,
    params: Record<string, any>,
  ): Promise<IResponse<MessageDto>> {
    return this.databaseService.createRecord(
      DATABASE_NAME,
      table_name,
      params,
    ) as Promise<IResponse<MessageDto>>;
  }

  async updateInboxMessageStatus({
    message_id,
    table_name,
    updated_params,
    user_email,
  }: Record<string, any>): Promise<IResponse<MessageDto>> {
    const { data = [] }: IResponse<MessageDto> = await this.getMessageById(
      table_name,
      message_id,
    );
    const [{ recipient, status: record_status }] = data;
    const { status } = updated_params;
    if (
      status !== record_status &&
      recipient === user_email &&
      record_status !== EMessageStatuses.DRAFT
    ) {
      const response = (await this.databaseService.updateRecordById(
        DATABASE_NAME,
        table_name,
        message_id,
        updated_params,
      )) as IResponse<MessageDto>;
      return response;
    }
    return {
      success: false,
      message: 'Message does not exist in Inbox.',
      data: [],
    };
  }

  async updateSentMessageStatus({
    message_id,
    table_name,
    updated_params,
    user_email,
  }: Record<string, any>): Promise<IResponse<MessageDto>> {
    const { data = [] } = await this.getMessageById(table_name, message_id);
    const [{ sender, status: record_status }] = data;
    const { status } = updated_params;
    if (
      status !== record_status &&
      sender === user_email &&
      record_status !== EMessageStatuses.DRAFT
    ) {
      const response = (await this.databaseService.updateRecordById(
        DATABASE_NAME,
        table_name,
        message_id,
        updated_params,
      )) as IResponse<MessageDto>;
      return response;
    }
    return {
      success: false,
      message: 'Message does not exist in Sentbox.',
      data: [],
    };
  }

  async updateDraftMessageStatus({
    message_id,
    table_name,
    updated_params,
    user_email,
  }: Record<string, any>): Promise<IResponse<MessageDto>> {
    const { data = [] } = await this.getMessageById(table_name, message_id);
    const [{ sender, status: record_status }] = data;
    if (sender === user_email && record_status === EMessageStatuses.DRAFT) {
      const response = (await this.databaseService.updateRecordById(
        DATABASE_NAME,
        table_name,
        message_id,
        updated_params,
      )) as IResponse<MessageDto>;
      return response;
    }
    return {
      success: false,
      message: 'Message does not exist in Draft.',
      data: [],
    };
  }

  async updateStarredOrImportantMessageStatus({
    message_id,
    table_name,
    updated_params,
    user_email,
    menu_type,
  }: Record<string, any>): Promise<IResponse<MessageDto>> {
    const { data = [] } = await this.getMessageById(table_name, message_id);
    const [{ sender, recipient }] = data;
    if (sender === user_email || recipient === user_email) {
      const response = (await this.databaseService.updateRecordById(
        DATABASE_NAME,
        table_name,
        message_id,
        updated_params,
      )) as IResponse<MessageDto>;
      return response;
    }
    return {
      success: false,
      message: `Message does not exist in ${menu_type}.`,
      data: [],
    };
  }

  async groupMessagesByMenu(
    table_name: string,
    menu_types: string[],
    email: string,
  ): Promise<IResponse<any>> {
    return reduce(
      menu_types,
      async (acc: any, curr: any) => {
        const { data = [] } = await this.getUserMessagesByMenuType({
          table_name,
          menu_type: curr,
          user_email: email,
        });
        return { ...acc, [curr]: data };
      },
      {},
    );
  }

  async getMessageByMenuType(
    table_name: string,
    menu_type: string,
    user_email: string,
    message_id: string,
  ): Promise<IResponse<MessageDto>> {
    switch (menu_type) {
      case EMenuTypes.DRAFT:
        return this.databaseService.getRecordByFilter(
          DATABASE_NAME,
          table_name,
          {
            status: EMessageStatuses.DRAFT,
            sender: user_email,
            id: message_id,
          },
        );
      case EMenuTypes.IMPORTANT:
        return await this.databaseService.getRecordByFilter(
          DATABASE_NAME,
          table_name,
          (message: any) => {
            return message('status')
              .eq(EMessageStatuses.IMPORTANT)
              .and(message('id').eq(message_id))
              .and(
                message('sender')
                  .eq(user_email)
                  .or(message('recipient').eq(user_email)),
              );
          },
        );
      case EMenuTypes.INBOX:
        return await this.databaseService.getRecordByFilter(
          DATABASE_NAME,
          table_name,
          (message: any) => {
            return message('status')
              .ne(EMessageStatuses.DRAFT)
              .and(message('id').eq(message_id))
              .and(message('recipient').eq(user_email));
          },
        );
      case EMenuTypes.STARRED:
        return await this.databaseService.getRecordByFilter(
          DATABASE_NAME,
          table_name,
          (message: any) => {
            return message('status')
              .eq(EMessageStatuses.STARRED)
              .and(message('id').eq(message_id))
              .and(
                message('sender')
                  .eq(user_email)
                  .or(message('recipient').eq(user_email)),
              );
          },
        );
      case EMenuTypes.SENT:
        return await this.databaseService.getRecordByFilter(
          DATABASE_NAME,
          table_name,
          (message: any) => {
            return message('status')
              .ne(EMessageStatuses.DRAFT)
              .and(message('id').eq(message_id))
              .and(message('sender').eq(user_email));
          },
        );
      default:
        return { success: false, message: 'No record fetchd.', data: [] };
    }
  }
}
