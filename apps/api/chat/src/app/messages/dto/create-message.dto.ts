import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID} from "class-validator";
import {MessageType} from "@nlc-ai/api-types";

export class CreateMessageDto {
  @ApiProperty({ enum: MessageType, required: false, default: MessageType.TEXT })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  replyToMessageID?: string;
}
