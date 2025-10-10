import { Module } from "@nestjs/common";
import {ReplicaModule} from "../replica/replica.module";
import {OnboardingHandler} from "./handlers/onboarding.handler";

@Module({
  imports: [ReplicaModule],
  providers: [OnboardingHandler],
})
export class EventsModule {}
