import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUrl, IsObject } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiProperty({ required: false, description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiProperty({ required: false, description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiProperty({ required: false, description: 'Webhook URL for notification delivery' })
  @IsOptional()
  @IsUrl()
  webhookUrl?: string;

  @ApiProperty({
    required: false,
    description: 'Additional notification preferences',
    example: {
      digestFrequency: 'daily',
      quietHours: { start: '22:00', end: '08:00' },
      categories: { billing: true, system: false }
    }
  })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}
