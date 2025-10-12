import {Module} from "@nestjs/common";
import {AuthHandler, UsersHandler, BillingHandler, LeadsHandler} from "./handlers";
import {TransactionalModule} from "../transactional/transactional.module";

@Module({
  imports: [TransactionalModule],
  providers: [
    AuthHandler,
    BillingHandler,
    LeadsHandler,
    UsersHandler,
  ],
})
export class EventsModule {}
