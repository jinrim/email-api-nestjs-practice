import {
  Controller,
  Get,
  Param,
  Put,
  Delete,
  Request,
  Body,
  UseGuards,
  Post,
} from '@nestjs/common';
import { MenuService } from './menu.services';
import { AuthGuard } from '../restriction/auth/auth.guard';
import { RoleGuard } from '../restriction/role/role.guard';
import { MenuParamsDto, EMenuTypes, MenuBodyDto } from './menu.dto';
import { EMessageStatuses, MessageDto } from '../messages/message.dto';
import { DatabaseService } from '../database.provider';
import { IResponse } from '../main.type';

const { DATABASE_NAME = 'email_database' } = process.env;

@Controller('menu')
export class MenuController {
  private table_name: string;
  private message_details: MessageDto;
  constructor(
    private menuService: MenuService,
    private databaseService: DatabaseService,
  ) {
    this.table_name = 'message';
    this.message_details = new MessageDto();
  }

  @Get('/')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async getAllMenu(
    @Request() request: any,
  ): Promise<IResponse<Record<string,any>>> {
    const { email } = await this.menuService.getLoggedinUser(
      request.cookies.access_token,
    );
    const menu_types = EMenuTypes;
    return this.menuService.groupMessagesByMenu(
      this.table_name,
      Object.values(menu_types),
      email,
    );
  }

  @Get('/:menu_type')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async getMessagesByMenuType(
    @Param() params: MenuParamsDto,
    @Request() request: any,
  ):Promise<IResponse<MessageDto>> {
    const { menu_type } = params;
    const { email } = await this.menuService.getLoggedinUser(
      request.cookies.access_token,
    );
    return this.menuService.getUserMessagesByMenuType({
      table_name: this.table_name,
      menu_type,
      user_email: email,
    });
  }

  @Get('/:menu_type/:message_id')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async getMessageInAMenuById(
    @Param() params: MenuParamsDto,
    @Request() request: any,
  ): Promise<IResponse<MessageDto>> {
    const { message_id = '', menu_type = '' } = params;
    const { email } = await this.menuService.getLoggedinUser(
      request.cookies.access_token,
    );
    const result = await this.menuService.getMessageByMenuType(
      this.table_name,
      menu_type,
      email,
      message_id,
    );
    const {success} = result
    if (!success) {
      return {
        success: false,
        message: `Message does not exist on Menu type ${menu_type}`,
        data:[]
      };
    }
    return result;
  }

  @Post('/:menu_type/:message_id')
  async replyMessageByMessageId(
    @Param() params: MenuParamsDto,
    @Body() body: MessageDto,
    @Request() request: any,
  ): Promise<IResponse<MessageDto>> {
    const { message_id = '', menu_type = '' } = params;
    const { email } = await this.menuService.getLoggedinUser(
      request.cookies.access_token,
    );
    const record = await this.menuService.getMessageByMenuType(
      this.table_name,
      menu_type,
      email,
      message_id,
    );
    if (!record.success) {
      return {
        success: false,
        message: `Message does not exist in Menu type ${menu_type}`,
        data:[]
      };
    }
    const [{ sender }] = record.data??[]
    const { message } = body;
    const reply_message = {
      ...this.message_details,
      ...body,
      message,
      sender: email,
      recipient: sender,
      replied_message_id: message_id,
    };
    const { success, data } = await this.menuService.createReplyMessage(
      this.table_name,
      reply_message,
      );
    if (success) {
      return { success: true, message: 'Reply Sent!', data };
    }
      return { success: false, message: 'Reply failed to sent!', data };
    
  }

  @Put('/:menu_type/:message_id')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async updateMessageStatusById(
    @Body() body: MenuBodyDto,
    @Param() params: MenuParamsDto,
    @Request() request: any,
  ): Promise<IResponse<MessageDto>> {
    const { email } = await this.menuService.getLoggedinUser(
      request.cookies.access_token,
    );
    const { menu_type, message_id } = params;
    const { status } = body;
    const updated_params = { status, updated_date: new Date().getTime() };
    switch (menu_type) {
      case 'inbox':
        if (
          status === EMessageStatuses.UNREAD ||
          status === EMessageStatuses.DRAFT
        ) {
          return {
            success: false,
            message: 'Cannot Update an inbox message status to unread or draft',
            data:[]
          };
        }
        return this.menuService.updateInboxMessageStatus({
          message_id,
          table_name: this.table_name,
          user_email: email,
          updated_params,
        });
      case 'sent':
        if (
          status === EMessageStatuses.UNREAD ||
          status === EMessageStatuses.READ ||
          status === EMessageStatuses.DRAFT
        ) {
          return {
            success: false,
            message:
              'Cannot Update sent message status to unread, read or draft',
              data:[]
          };
        }
        return this.menuService.updateSentMessageStatus({
          message_id,
          table_name: this.table_name,
          updated_params,
          user_email: email,
        });
      case 'draft':
        if (
          status === EMessageStatuses.UNREAD ||
          status === EMessageStatuses.READ
        ) {
          return {
            success: false,
            message: 'Cannot Update draft message status to unread, read',
            data:[]
          };
        }
        return this.menuService.updateDraftMessageStatus({
          message_id,
          table_name: this.table_name,
          updated_params,
          user_email: email,
        });
      default:
        return this.menuService.updateStarredOrImportantMessageStatus({
          message_id,
          table_name: this.table_name,
          updated_params,
          user_email: email,
          menu_type,
        });
    }
  }

  @Delete('/:menu_type/:message_id')
  @UseGuards(AuthGuard)
  async deleteMessageByMenuType(
    @Param() params: MenuParamsDto,
    @Request() request: any,
  ): Promise<IResponse<MessageDto>> {
    const { email } = await this.menuService.getLoggedinUser(
      request.cookies.access_token,
    );
    const { message_id = '', menu_type } = params;
    const record = await this.menuService.getMessageByMenuType(
      this.table_name,
      menu_type,
      email,
      message_id,
    );
    const {data}= record
    if (!record) {
      return {
        success: false,
        message: `Message does not exist in ${menu_type}`,
        data
      };
    }
    return this.databaseService.deleteRecordById(
      DATABASE_NAME,
      this.table_name,
      message_id,
    );
  }
}
