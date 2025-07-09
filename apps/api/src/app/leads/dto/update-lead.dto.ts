import {ApiProperty} from "@nestjs/swagger";
import {IsEnum} from "class-validator";
import {LeadStatus} from "./create-lead.dto";

export class UpdateLeadStatusDto {
  @ApiProperty({ enum: LeadStatus, example: LeadStatus.CONVERTED })
  @IsEnum(LeadStatus)
  status: LeadStatus;
}
