import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class ConnectPlatformDto {
  @ApiProperty({ example: 'your-api-key-here' })
  @IsString()
  apiKey?: string;

  @ApiProperty({ example: 'oauth-access-token' })
  @IsString()
  accessToken?: string;

  @ApiProperty({ example: 'oauth-refresh-token' })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiProperty({ example: 'webhook-secret' })
  @IsOptional()
  @IsString()
  webhookSecret?: string;

  @ApiProperty({ example: {} })
  @IsOptional()
  @IsObject()
  config?: any;
}

export class LoadCalendlyEventsDto {
  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @IsString()
  startDate: string;

  @ApiProperty({ example: '2024-01-31T23:59:59Z' })
  @IsString()
  endDate: string;
}

export class ToggleEmailSyncDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  syncEnabled: boolean;
}

export class EmailAccountStatsQueryDto {
  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsString()
  days?: string;
}
