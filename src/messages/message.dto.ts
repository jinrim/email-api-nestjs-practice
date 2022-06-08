import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';

export enum EMessageStatuses {
  IMPORTANT = 'Important',
  STARRED = 'Starred',
  READ = 'Read',
  DRAFT = 'Draft',
  UNREAD = 'Unread',
}

export class MessageDto {
  constructor() {
    this.recipient = '';
    this.subject = '';
    this.message = '';
    this.sender = '';
    this.status = EMessageStatuses.UNREAD;
    this.created_date = new Date().getTime();
    this.updated_date = new Date().getTime();
  }
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  sender?: string;

  @IsEnum(EMessageStatuses, {
    message: `Message must be a valid enum value [${Object.values(
      EMessageStatuses,
    )}]`,
  })
  @IsNotEmpty()
  status: EMessageStatuses;

  @IsNumber()
  created_date: number;

  @IsNumber()
  updated_date: number;
}
export interface IUpdateMessageBody {
  message: string;
}
export interface IMessageParams {
  message_id: string;
}
