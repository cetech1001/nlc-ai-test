import {Module} from "@nestjs/common";
import {ClientEmailController} from "./client-email.controller";
import {ClientEmailService} from "./client-email.service";
import {CoachReplicaModule} from "../coach-replica/coach-replica.module";

@Module({
  imports: [CoachReplicaModule],
  controllers: [ClientEmailController],
  providers: [ClientEmailService],
})
export class ClientEmailModule {}
