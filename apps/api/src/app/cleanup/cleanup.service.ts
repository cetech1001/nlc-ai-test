import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CoachesService } from '../coaches/coaches.service';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly coachesService: CoachesService,
    private readonly plansService: PlansService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredDeletionsCleanup() {
    this.logger.log('Starting daily cleanup of expired deletions...');

    try {
      // Cleanup expired coaches
      const coachResult = await this.coachesService.permanentDeleteExpired();
      this.logger.log(`Cleaned up ${coachResult.deletedCount} expired coach records`);

      // Cleanup expired plans
      const planResult = await this.plansService.permanentDeleteExpired();
      this.logger.log(`Cleaned up ${planResult.deletedCount} expired plan records`);

      this.logger.log('Daily cleanup completed successfully');
    } catch (error) {
      this.logger.error('Error during daily cleanup:', error);
    }
  }

  // Manual cleanup endpoints
  async cleanupExpiredCoaches() {
    this.logger.log('Manual cleanup of expired coaches requested');
    return this.coachesService.permanentDeleteExpired();
  }

  async cleanupExpiredPlans() {
    this.logger.log('Manual cleanup of expired plans requested');
    return this.plansService.permanentDeleteExpired();
  }

  async cleanupAll() {
    this.logger.log('Manual cleanup of all expired records requested');

    const [coachResult, planResult] = await Promise.all([
      this.coachesService.permanentDeleteExpired(),
      this.plansService.permanentDeleteExpired(),
    ]);

    return {
      coaches: coachResult.deletedCount,
      plans: planResult.deletedCount,
      total: coachResult.deletedCount + planResult.deletedCount,
    };
  }
}
