import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class CancelSubscriptionDto {
  @ApiProperty({ example: 'Customer requested cancellation', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ example: false, required: false, description: 'Cancel immediately or at period end' })
  @IsOptional()
  @IsBoolean()
  immediateCancel?: boolean;
}
