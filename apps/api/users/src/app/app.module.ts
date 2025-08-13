import { Module } from '@nestjs/common';
import {DatabaseModule} from "@nlc-ai/api-database";
import {ClientsModule} from "./clients/clients.module";
import {CoachesModule} from "./coaches/coaches.module";

@Module({
  imports: [
    DatabaseModule.forFeature(),
    ClientsModule,
    CoachesModule,
  ],
})
export class AppModule {}
