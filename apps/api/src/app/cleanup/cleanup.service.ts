import { Cron, CronExpression } from '@nestjs/schedule';
import {Injectable} from "@nestjs/common";
import {CoachesService} from "../coaches/coaches.service";

@Injectable()
export class CleanupService {
  constructor(private coachesService: CoachesService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredCoachCleanup() {
    const result = await this.coachesService.permanentDeleteExpired();
    console.log(`Cleaned up ${result.deletedCount} expired coach records`);
  }
}
