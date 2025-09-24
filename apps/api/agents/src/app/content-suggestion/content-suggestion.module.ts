import { Module } from "@nestjs/common";
import { ContentSuggestionController } from "./content-suggestion.controller";
import { ContentSuggestionService } from "./content-suggestion.service";
import { ContentSuggestionConversationController } from "./content-suggestion-conversation.controller";
import { ContentSuggestionConversationService } from "./content-suggestion-conversation.service";
import { CoachReplicaModule } from "../coach-replica/coach-replica.module";
import { AgentConversationService } from "../agent-conversation/agent-conversation.service";

@Module({
  imports: [CoachReplicaModule],
  controllers: [
    ContentSuggestionController,
    ContentSuggestionConversationController
  ],
  providers: [
    ContentSuggestionService,
    ContentSuggestionConversationService,
    AgentConversationService
  ],
  exports: [
    ContentSuggestionService,
    ContentSuggestionConversationService,
    AgentConversationService
  ],
})
export class ContentSuggestionModule {}
