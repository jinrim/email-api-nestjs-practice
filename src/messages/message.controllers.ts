import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { MessageService } from './message.service';
import {
  EMessageStatuses,
  MessageDto,
  IUpdateMessageBody,
  IMessageParams,
} from './message.dto';
import { UtilityService } from '../utils/utility.service';
import { RoleService } from '../restriction/role/role.service';
import { AuthGuard } from '../restriction/auth/auth.guard';
import { IResponse } from '../main.type';

@Controller('message')
export class MessageController {
  private message_details: MessageDto;
  constructor(
    private messageService: MessageService,
    private utilityService: UtilityService,
    private roleService: RoleService,
  ) {
    this.message_details = new MessageDto();
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  async createMessage(@Req() req: Request, @Body() body: MessageDto): Promise<IResponse<MessageDto>> {
    const { email } = await this.roleService.getLoggedinUser(
      req.cookies.access_token,
    );
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    const params = { ...this.message_details, ...body, sender: email };
    return this.messageService.createMessage(table_name, params);
  }

  @Get('/')
  @UseGuards(AuthGuard)
  async getAllMessage(@Req() req: Request): Promise<IResponse<MessageDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    return this.messageService.getAllMessage(table_name);
  }

  @Get('/:message_id')
  @UseGuards(AuthGuard)
  async getMessageById(@Param() params: IMessageParams, @Req() req: Request): Promise<IResponse<MessageDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    const { message_id = '' } = params;
    return this.messageService.getMessageById(
      table_name,
      message_id,
    );
  }

  @Put('/:message_id')
  @UseGuards(AuthGuard)
  async updateMessageById(
    @Body() body: IUpdateMessageBody,
    @Param() params: IMessageParams,
    @Req() req: Request,
  ): Promise<IResponse<MessageDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    const { message } = body;
    const updated_params = { message, updated_date: new Date().getTime() };
    const { message_id = '' } = params;
    const { data=[] } = await this.messageService.getMessageById(
      table_name,
      message_id,
    );
    const [{status}]= data
    if (status === EMessageStatuses.DRAFT) {
      return this.messageService.updateMessageById(
        table_name,
        message_id,
        updated_params,
      );
    } else {
      return { success: false, message: 'Only Draft messages can be edited.', data:[] };
    }
  }
}
