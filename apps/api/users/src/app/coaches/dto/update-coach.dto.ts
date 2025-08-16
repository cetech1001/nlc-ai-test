import { PartialType } from '@nestjs/mapped-types';
import { CreateCoachDto } from './create-coach.dto';
import { UpdateCoach } from '@nlc-ai/api-types';

export class UpdateCoachDto extends PartialType(CreateCoachDto) implements UpdateCoach {}
