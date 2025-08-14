import { IsString, IsNumber, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MailgunSignatureDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  timestamp: string;

  @ApiProperty()
  @IsString()
  signature: string;
}

export class MailgunMessageHeadersDto {
  @ApiProperty({ name: 'message-id' })
  @IsString()
  'message-id': string;
}

export class MailgunMessageDto {
  @ApiProperty({ type: MailgunMessageHeadersDto })
  @ValidateNested()
  @Type(() => MailgunMessageHeadersDto)
  headers: MailgunMessageHeadersDto;
}

export class MailgunClientInfoDto {
  @ApiProperty({ required: false, name: 'client-name' })
  @IsOptional()
  @IsString()
  'client-name'?: string;

  @ApiProperty({ required: false, name: 'client-os' })
  @IsOptional()
  @IsString()
  'client-os'?: string;

  @ApiProperty({ required: false, name: 'device-type' })
  @IsOptional()
  @IsString()
  'device-type'?: string;

  @ApiProperty({ required: false, name: 'user-agent' })
  @IsOptional()
  @IsString()
  'user-agent'?: string;
}

export class MailgunGeolocationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string;
}

export class MailgunEventDataDto {
  @ApiProperty()
  @IsString()
  event: string;

  @ApiProperty({ type: MailgunMessageDto })
  @ValidateNested()
  @Type(() => MailgunMessageDto)
  message: MailgunMessageDto;

  @ApiProperty()
  @IsString()
  recipient: string;

  @ApiProperty()
  @IsNumber()
  timestamp: number;

  @ApiProperty({ required: false, name: 'user-variables' })
  @IsOptional()
  @IsObject()
  'user-variables'?: Record<string, any>;

  @ApiProperty({ required: false, name: 'client-info', type: MailgunClientInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MailgunClientInfoDto)
  'client-info'?: MailgunClientInfoDto;

  @ApiProperty({ required: false, type: MailgunGeolocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MailgunGeolocationDto)
  geolocation?: MailgunGeolocationDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  severity?: string;
}

export class MailgunWebhookDto {
  @ApiProperty({ type: MailgunSignatureDto })
  @ValidateNested()
  @Type(() => MailgunSignatureDto)
  signature: MailgunSignatureDto;

  @ApiProperty({ name: 'event-data', type: MailgunEventDataDto })
  @ValidateNested()
  @Type(() => MailgunEventDataDto)
  'event-data': MailgunEventDataDto;
}
