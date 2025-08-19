import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class EditMessageDto {
  @ApiProperty({ description: 'Updated message content' })
  @IsString()
  @MaxLength(2000)
  content: string;
}
