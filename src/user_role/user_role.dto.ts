import { IsNotEmpty, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export enum EUserRoles {
  SUPER_ADMIN = 'super_admin',
  NORMAL_USER = 'normal_user',
}

export class PriviledgesDto {
  constructor() {
    this.has_read_access = false;
    this.has_add_access = false;
    this.has_edit_access = false;
    this.has_delete_access = false;
  }
  @IsBoolean()
  @IsNotEmpty()
  has_read_access: boolean;

  @IsBoolean()
  @IsNotEmpty()
  has_add_access: boolean;

  @IsBoolean()
  @IsNotEmpty()
  has_edit_access: boolean;

  @IsBoolean()
  @IsNotEmpty()
  has_delete_access: boolean;
}

export class UserRoleDto {
  constructor() {
    this.priviledges = new PriviledgesDto();
    this.role = EUserRoles.NORMAL_USER;
    this.created_date = new Date().getTime();
    this.updated_date = new Date().getTime();
  }

  @IsEnum(EUserRoles, {
    message: `Role must be a valid enum value [${Object.values(EUserRoles)}]`,
  })
  @IsNotEmpty()
  role: EUserRoles;

  @Type(() => PriviledgesDto)
  priviledges: PriviledgesDto;

  @IsNumber()
  created_date: number;

  @IsNumber()
  updated_date: number;
}

export interface IUserRoleParams {
  user_role_id: string;
}
