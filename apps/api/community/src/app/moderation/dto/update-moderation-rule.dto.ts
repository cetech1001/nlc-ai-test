import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class UpdateModerationRuleDto {
  @ApiProperty({ required: false, description: 'Name of the moderation rule' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: 'Description of what the rule does' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, description: 'Conditions that trigger the rule' })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;

  @ApiProperty({ required: false, description: 'Actions to take when rule is triggered' })
  @IsOptional()
  @IsObject()
  actions?: {
    autoFlag?: boolean;
    autoRemove?: boolean;
    requireReview?: boolean;
    notifyModerators?: boolean;
  };

  @ApiProperty({ required: false, description: 'Whether the rule is enabled' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
