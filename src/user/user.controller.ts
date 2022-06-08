import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { AuthGuard } from '../restriction/auth/auth.guard';
import { RoleGuard } from '../restriction/role/role.guard';
import { UtilityService } from '../utils/utility.service';
import { UserDto, IUserParams } from './user.dto';
import { IResponse } from '../main.type';

@Controller('user')
export class UserController {
  private user_details:UserDto;
  constructor(
    private userService: UserService,
    private utilityService: UtilityService,
    ) {
    this.user_details=new UserDto();
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async createUser(@Body() body: UserDto, @Req() req: Request): Promise<IResponse<UserDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    return this.userService.createUser(table_name, {...this.user_details, ...body });
  }

  @Get('/')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async getAllUser(@Req() req: Request): Promise<IResponse<UserDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    return this.userService.getAllUser(table_name);
  }

  @Get('/:user_id')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async getUserById(@Param() params: IUserParams, @Req() req: Request): Promise<IResponse<UserDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    const { user_id = '' } = params;
    const result = await this.userService.getUserById(table_name, user_id);
    const {data}=result
    return result
      ? { success: true, message: 'Fetched record', data }
      : {
          success: false,
          message: 'User does not exist'
        };
  }

  @Put('/:user_id')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async updateUserById(
    @Body() body: Record<string, any>,
    @Param() { user_id }: IUserParams,
    @Req() req: Request,
  ): Promise<IResponse<UserDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    const updated_params = { ...body, updated_date: new Date().getTime() };

    return this.userService.updateUserById(
      table_name,
      user_id,
      updated_params,
    );
  }

  @Delete('/:user_id')
  @UseGuards(AuthGuard)
  @UseGuards(RoleGuard)
  async deleteUserById(@Param() params: IUserParams, @Req() req: Request): Promise<IResponse<UserDto>> {
    const table_name = this.utilityService.getTableNameFromRoute(
      req.route.path,
    );
    const { user_id = '' } = params;
    return this.userService.deleteUserById(table_name, user_id);
  }
}
