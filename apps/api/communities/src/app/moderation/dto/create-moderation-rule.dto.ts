import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject, IsIn } from 'class-validator';

export class CreateModerationRuleDto {
  @ApiProperty({ description: 'Name of the moderation rule' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of what the rule does' })
  @IsString()
  description: string;

  @ApiProperty({
    enum: ['keyword', 'ai', 'pattern', 'user_reports'],
    description: 'Type of moderation rule'
  })
  @IsString()
  @IsIn(['keyword', 'ai', 'pattern', 'user_reports'])
  type: 'keyword' | 'ai' | 'pattern' | 'user_reports';

  @ApiProperty({ description: 'Conditions that trigger the rule' })
  @IsObject()
  conditions: Record<string, any>;

  @ApiProperty({ description: 'Actions to take when rule is triggered' })
  @IsObject()
  actions: {
    autoFlag?: boolean;
    autoRemove?: boolean;
    requireReview?: boolean;
    notifyModerators?: boolean;
  };

  @ApiProperty({ required: false, default: true, description: 'Whether the rule is enabled' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
