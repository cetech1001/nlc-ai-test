import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { UserType } from '@nlc-ai/api-types';

export class CreateConversationDto {
  @ApiProperty({ enum: ['direct', 'group'] })
  @IsEnum(['direct', 'group'])
  type: 'direct' | 'group';

  @ApiProperty({ description: 'Conversation name (required for group chats)', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Participant user IDs', type: [String] })
  @IsArray()
  @IsUUID(4, { each: true })
  participantIDs: string[];

  @ApiProperty({ description: 'Participant user types', enum: UserType, isArray: true })
  @IsArray()
  @IsEnum(UserType, { each: true })
  participantTypes: UserType[];
}
