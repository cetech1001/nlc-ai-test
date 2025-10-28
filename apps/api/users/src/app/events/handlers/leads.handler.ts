import {Injectable, Logger, OnApplicationBootstrap} from "@nestjs/common";
import {EventBusService} from "@nlc-ai/api-messaging";
import {CoachesService} from "../../coaches/coaches.service";
import {PrismaService} from "@nlc-ai/api-database";

@Injectable()
export class LeadsHandler implements OnApplicationBootstrap{
  private readonly logger = new Logger(LeadsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly coaches: CoachesService,
    private readonly prisma: PrismaService,
  ) {}

  onApplicationBootstrap() {
    this.subscribeToEvents();
  }

  async subscribeToEvents() {
    await this.eventBus.subscribe(
      'users.leads',
      ['lead.deleted'],
      this.handleLeadDeleted.bind(this),
    )
  }

  private async handleLeadDeleted(event: any) {
    const { email } = event.payload;

    const coach = await this.prisma.coach.findUnique({
      where: { email },
    });

    if (coach) {
      await this.coaches.remove(coach.id);

      this.logger.log('Deleted associated coach');
    }
  }
}
