import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsBoolean } from 'class-validator';

export class LoadCalendlyEventsDto {
  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: 'Start date in ISO 8601 format'
  })
  @IsISO8601({ strict: true })
  start: string;

  @ApiProperty({
    example: '2025-01-31T23:59:59.999Z',
    description: 'End date in ISO 8601 format'
  })
  @IsISO8601({ strict: true })
  end: string;
}

export class ToggleProfileVisibilityDto {
  @ApiProperty({ example: true, description: 'Show this integration on public profile' })
  @IsBoolean()
  showOnProfile: boolean;
}
