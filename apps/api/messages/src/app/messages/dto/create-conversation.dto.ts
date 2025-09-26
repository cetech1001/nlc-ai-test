import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsEnum, IsOptional, IsString} from "class-validator";
import {UserType} from "@nlc-ai/api-types";

export class CreateConversationDto {
  @ApiProperty({ enum: ['direct', 'group'] })
  @IsEnum(['direct', 'group'])
  type: 'direct' | 'group';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  participantIDs: string[];

  @ApiProperty({ enum: UserType, isArray: true })
  @IsArray()
  @IsEnum(UserType, { each: true })
  participantTypes: UserType[];
}
