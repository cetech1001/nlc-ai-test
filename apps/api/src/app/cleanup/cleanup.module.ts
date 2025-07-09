import {Module} from "@nestjs/common";
import {CleanupService} from "./cleanup.service";
import {CoachesModule} from "../coaches/coaches.module";

@Module({
  imports: [CoachesModule],
  providers: [CleanupService],
  exports: [CleanupService]
})
export class CleanupModule {}
