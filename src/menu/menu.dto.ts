import { IsEnum, IsString, IsOptional } from 'class-validator';
import { EMessageStatuses } from '../messages/message.dto';

export enum EMenuTypes {
  INBOX = 'inbox',
  STARRED = 'starred',
  IMPORTANT = 'important',
  SENT = 'sent',
  DRAFT = 'draft',
}

export class MenuParamsDto {
  constructor() {
    this.message_id = '';
    this.menu_type = EMenuTypes.SENT;
  }

  @IsString()
  @IsOptional()
  message_id?: string;

  @IsEnum(EMenuTypes, {
    message: `Menu type must be a valid enum value [${Object.values(
      EMenuTypes,
    )}]`,
  })
  menu_type: EMenuTypes;
}

export class MenuBodyDto {
  constructor() {
    this.status = EMessageStatuses.READ;
  }

  @IsEnum(EMessageStatuses, {
    message: `Status must be a valid enum value [${Object.values(
      EMessageStatuses,
    )}]`,
  })
  status: EMessageStatuses;
}
