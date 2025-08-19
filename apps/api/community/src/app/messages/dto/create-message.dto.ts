import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsUrl, IsUUID, IsNumber, MaxLength } from 'class-validator';
import { MessageType } from '@nlc-ai/api-types';

export class CreateMessageDto {
  @ApiProperty({ enum: MessageType, required: false })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ description: 'Media URLs', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @ApiProperty({ description: 'File URL', required: false })
  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @ApiProperty({ description: 'File name', required: false })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({ description: 'File size in bytes', required: false })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiProperty({ description: 'Reply to message ID', required: false })
  @IsOptional()
  @IsUUID()
  replyToMessageID?: string;
}
