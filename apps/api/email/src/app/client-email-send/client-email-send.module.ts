import {Module} from "@nestjs/common";
import {ClientEmailSendController} from "./client-email-send.controller";
import {ClientEmailSendService} from "./client-email-send.service";
import {EmailModule} from "../email/email.module";

@Module({
  imports: [EmailModule],
  controllers: [ClientEmailSendController],
  providers: [ClientEmailSendService],
  exports: [ClientEmailSendService],
})
export class ClientEmailSendModule {}
