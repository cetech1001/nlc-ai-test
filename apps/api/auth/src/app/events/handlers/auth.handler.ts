import {Injectable, Logger} from "@nestjs/common";
import {EventBusService} from "@nlc-ai/api-messaging";
import {AuthService} from "../../auth/auth.service";

@Injectable()
export class AuthHandler {
  private readonly logger = new Logger(AuthHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly auth: AuthService,
  ) {
    this.subscribeToEvents();
  }

  async subscribeToEvents() {
    await this.eventBus.subscribe(
      'auth.auth',
      [
        'auth.password_reset.request'
      ],
      this.handleResetPassword.bind(this)
    );
  }

  private async handleResetPassword(event: any) {
    const { email, userType } = event.payload;
    try {
      await this.auth.forgotPassword({ email }, userType);
      this.logger.log(`Triggered password reset for ${userType}`);
    } catch (e) {
      this.logger.error(`Failed to trigger password reset for ${userType}: `, e);
    }
  }
}
