import {ApiProperty} from "@nestjs/swagger";
import {IsEnum, IsObject, IsOptional, IsString, IsUUID} from "class-validator";
import {UserType} from "@nlc-ai/api-types";
import {NotificationPriority} from "./notification-filters.dto";

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  userID: string;

  @ApiProperty({ enum: UserType })
  @IsEnum(UserType)
  userType: UserType;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiProperty({ enum: NotificationPriority, default: NotificationPriority.NORMAL, required: false })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.NORMAL;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
