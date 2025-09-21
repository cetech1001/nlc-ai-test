import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsUUID} from "class-validator";

export class MarkAsReadDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  messageIDs: string[];
}
