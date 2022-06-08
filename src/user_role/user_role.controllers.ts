import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Logger,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { UserRoleService } from './user_role.service';
import { UtilityService } from '../utils/utility.service';
import { AuthGuard } from '../restriction/auth/auth.guard';
import { RoleGuard } from '../restriction/role/role.guard';
import { UserRoleDto, IUserRoleParams } from './user_role.dto';
import { IResponse } from '../main.type';

@Controller('user_role')
export class UserRoleController {
  private logger: any;
  private user_role_details:UserRoleDto;
  constructor(
    private userRoleService: UserRoleService,
    private utilityService: UtilityService,
  ) {
    this.logger = new Logger('USER ROLE');
    this.user_role_details = new UserRoleDto();
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async createUserRole(@Body() body: UserRoleDto, @Req() req: Request):Promise<IResponse<UserRoleDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    return this.userRoleService.createUserRole(table_name, {...this.user_role_details ,...body});
  }

  @Get('/')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async getAllUserRole(@Req() req: Request):Promise<IResponse<UserRoleDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    this.logger.log(this.getAllUserRole);
    return this.userRoleService.getAllUserRole(table_name);
  }

  @Get('/:user_role_id')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async getUserRoleById(@Param() params: IUserRoleParams, @Req() req: Request):Promise<IResponse<UserRoleDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    const { user_role_id = '' } = params;
    const result = await this.userRoleService.getUserRoleById(
      table_name,
      user_role_id,
    );
    const {data}=result
    return result
      ? { success: true, message: 'Fetched record', data }
      : {
          success: false,
          message: 'User role does not exist',
          data:[]
        };
  }

  @Put('/:user_role_id')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async updateUserRoleById(
    @Body() body: Record<string, any>,
    @Param() params: IUserRoleParams,
    @Req() req: Request,
  ):Promise<IResponse<UserRoleDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    const updated_params = { ...body, updated_date: new Date().getTime() };
    const { user_role_id = '' } = params;
    return this.userRoleService.updateUserRoleById(
      table_name,
      user_role_id,
      updated_params,
    );
  }

  @Delete('/:user_role_id')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async deleteUserRoleById(
    @Param() params: IUserRoleParams,
    @Req() req: Request,
  ):Promise<IResponse<UserRoleDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    const { user_role_id = '' } = params;
    return this.userRoleService.deleteUserRoleById(
      table_name,
      user_role_id,
    );
  }
}
