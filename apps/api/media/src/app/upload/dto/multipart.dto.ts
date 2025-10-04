import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsArray, IsObject } from 'class-validator';

export class InitMultipartDto {
  @ApiProperty() @IsString() filename!: string;
  @ApiProperty() @IsNumber() size!: number; // bytes
  @ApiProperty({ required: false }) @IsOptional() @IsString() folder?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() tags?: string[];
  @ApiProperty({ required: false }) @IsOptional() @IsObject() metadata?: Record<string, any>;
}

export class GetPartUrlDto {
  @ApiProperty() @IsString() uploadId!: string;
  @ApiProperty() @IsString() key!: string;      // s3 object key
  @ApiProperty() @IsNumber() partNumber!: number;
}

export class CompleteMultipartDto {
  @ApiProperty() @IsString() uploadId!: string;
  @ApiProperty() @IsString() key!: string;
  @ApiProperty({ type: [Object] })
  @IsArray()
  parts!: { ETag: string; PartNumber: number }[];
}
