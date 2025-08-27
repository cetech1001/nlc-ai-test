import {PaginationDto} from "@nlc-ai/api-dto";
import {ApiProperty} from "@nestjs/swagger";
import {IsEnum, IsOptional, IsString, IsUUID} from "class-validator";
import {MessageType} from "@nlc-ai/api-types";

export class MessageFiltersDto extends PaginationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  conversationID?: string;

  @ApiProperty({ enum: MessageType, required: false })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  before?: string; // ISO date string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  after?: string; // ISO date string
}
