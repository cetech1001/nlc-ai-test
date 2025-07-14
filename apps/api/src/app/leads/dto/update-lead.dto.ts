import {PartialType} from "@nestjs/swagger";
import {CreateLeadDto} from "./create-lead.dto";
import {UpdateLead} from "@nlc-ai/types";

export class UpdateLeadDto extends PartialType(CreateLeadDto) implements UpdateLead{}
