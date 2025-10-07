import {Module} from "@nestjs/common";
import {PublicChatController} from "./public-chat.controller";
import {ReplicaModule} from "../replica/replica.module";

@Module({
  imports: [ReplicaModule],
  controllers: [PublicChatController],
})
export class PublicChatModule {}
