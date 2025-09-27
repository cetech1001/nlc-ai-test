import { PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';
import { UpdateClient } from '@nlc-ai/types';

export class UpdateClientDto extends PartialType(CreateClientDto) implements UpdateClient {}
