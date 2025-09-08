import {Module} from "@nestjs/common";
import {CoachReplicaController} from "./coach-replica.controller";
import {CoachReplicaService} from "./coach-replica.service";

@Module({
  imports: [],
  controllers: [CoachReplicaController],
  providers: [CoachReplicaService],
  exports: [CoachReplicaService],
})
export class CoachReplicaModule {}
