import {Module} from "@nestjs/common";
import {ClientEmailController} from "./client-email.controller";
import {ClientEmailService} from "./client-email.service";

@Module({
  controllers: [ClientEmailController],
  providers: [ClientEmailService],
})
export class ClientEmailModule {}
