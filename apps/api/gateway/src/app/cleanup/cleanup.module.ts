import {Module} from "@nestjs/common";
import {CleanupService} from "./cleanup.service";
import {CoachesModule} from "../coaches/coaches.module";
import {CleanupController} from "./cleanup.controller";
import {PlansModule} from "../plans/plans.module";

@Module({
  controllers: [CleanupController],
  imports: [
    CoachesModule,
    PlansModule,
  ],
  providers: [CleanupService],
  exports: [CleanupService]
})
export class CleanupModule {}
