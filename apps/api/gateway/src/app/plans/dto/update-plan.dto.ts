import { PartialType } from '@nestjs/swagger';
import { CreatePlanDto } from './create-plan.dto';
import {UpdatePlanRequest} from "@nlc-ai/types";

export class UpdatePlanDto extends PartialType(CreatePlanDto) implements UpdatePlanRequest{}
