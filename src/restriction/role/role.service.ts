import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database.provider';
import { IResponse } from '../../main.type';
import { UserDto } from '../../user/user.dto';
import { UserRoleDto } from '../../user_role/user_role.dto';

const { DATABASE_NAME = 'email_database' } = process.env;

@Injectable({})
export class RoleService {
  constructor(
    private jwtService: JwtService,
    private databaseService: DatabaseService,
  ) {}

  async getLoggedinUser(access_token: string): Promise<UserDto> {
    const decoded = this.jwtService.decode(access_token ?? '') as Record<
      string,
      any
    >;
    const { data = [] } = await this.databaseService.getRecordByFilter(
      DATABASE_NAME,
      'user',
      {
        username: decoded?.username,
        password: decoded?.password,
      },
    );
    const [user] = data as UserDto[];
    return user;
  }

  async getLoggedinUserRole(role_id: string): Promise<IResponse<UserRoleDto>> {
    const result = await this.databaseService.getRecordById(
      DATABASE_NAME,
      'user_role',
      role_id,
    );
    if (result) return result;
    else
      return { success: false, message: 'User role does not exist.', data: [] };
  }
  async getLoggedinUserPriviledges({
    method,
    priviledges,
  }: Record<string, any>): Promise<boolean> {
    const {
      has_read_access = false,
      has_add_access = false,
      has_delete_access = false,
      has_edit_access = false,
    } = priviledges;

    switch (method) {
      case 'GET':
        return has_read_access;
      case 'POST':
        return has_add_access;
      case 'PUT':
        return has_edit_access;
      case 'DELETE':
        return has_delete_access;
      default:
        return false;
    }
  }
}
