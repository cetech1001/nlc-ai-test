import {Module} from "@nestjs/common";
import {DripScheduleController} from "./drip-schedule.controller";
import {DripScheduleService} from "./drip-schedule.service";

@Module({
  controllers: [DripScheduleController],
  providers: [DripScheduleService],
  exports: [DripScheduleService],
})
export class DripScheduleModule {}
