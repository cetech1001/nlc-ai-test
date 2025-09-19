import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean, IsObject, IsIn } from 'class-validator';

export class ModerationActionDto {
  @ApiProperty({
    enum: ['approve', 'remove', 'dismiss', 'warn', 'suspend', 'ban'],
    description: 'Action to take'
  })
  @IsString()
  @IsIn(['approve', 'remove', 'dismiss', 'warn', 'suspend', 'ban'])
  action: 'approve' | 'remove' | 'dismiss' | 'warn' | 'suspend' | 'ban';

  @ApiProperty({ description: 'Reason for the action' })
  @IsString()
  reason: string;

  @ApiProperty({ required: false, description: 'Duration in seconds for temporary actions' })
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiProperty({ required: false, default: true, description: 'Whether to notify the user' })
  @IsOptional()
  @IsBoolean()
  notifyUser?: boolean;

  @ApiProperty({ required: false, description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
