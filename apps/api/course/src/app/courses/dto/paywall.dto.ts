import { IsBoolean, IsOptional, IsString, IsNumber, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PricingType } from './create-course.dto';

export class PreviewContentDto {
  @ApiProperty({ description: 'Chapter IDs that are free preview' })
  @IsArray()
  @IsString({ each: true })
  freeChapterIds: string[];

  @ApiProperty({ description: 'Lesson IDs that are free preview' })
  @IsArray()
  @IsString({ each: true })
  freeLessonIds: string[];

  @ApiPropertyOptional({ description: 'Preview message to display' })
  @IsOptional()
  @IsString()
  previewMessage?: string;
}

export class PaymentOptionDto {
  @ApiProperty({ description: 'Payment option type', enum: PricingType })
  @IsEnum(PricingType)
  type: PricingType;

  @ApiProperty({ description: 'Price in cents' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Display label for this option' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ description: 'Payment installment count' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  installmentCount?: number;
}

export class UpdatePaywallSettingsDto {
  @ApiProperty({ description: 'Enable paywall for this course' })
  @IsBoolean()
  isEnabled: boolean;

  @ApiPropertyOptional({ description: 'Free preview content settings' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PreviewContentDto)
  previewContent?: PreviewContentDto;

  @ApiPropertyOptional({ description: 'Available payment options' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentOptionDto)
  paymentOptions?: PaymentOptionDto[];

  @ApiPropertyOptional({ description: 'Custom paywall message' })
  @IsOptional()
  @IsString()
  paywallMessage?: string;

  @ApiPropertyOptional({ description: 'Redirect URL after successful payment' })
  @IsOptional()
  @IsString()
  successRedirectUrl?: string;
}

export class CreatePaymentLinkDto {
  @ApiProperty({ description: 'Payment option type', enum: PricingType })
  @IsEnum(PricingType)
  paymentType: PricingType;

  @ApiPropertyOptional({ description: 'Custom amount in cents (overrides course price)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customAmount?: number;

  @ApiPropertyOptional({ description: 'Expiry date for payment link' })
  @IsOptional()
  @IsString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Custom success URL' })
  @IsOptional()
  @IsString()
  successUrl?: string;
}
