import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class WebhookDto {
  @ApiProperty({ example: 'whsec_1234567890abcdef' })
  @IsString()
  signature: string;

  @ApiProperty({ required: false })
  @IsOptional()
  payload?: any;
}
