import { PartialType } from '@nestjs/mapped-types';
import { CreateCoachDto } from './create-coach.dto';
import {UpdateCoach} from "@nlc-ai/types";

export class UpdateCoachDto extends PartialType(CreateCoachDto) implements UpdateCoach{}
