import { Module } from "@nestjs/common";
import { ContentSuggestionController } from "./content-suggestion.controller";
import { ContentSuggestionService } from "./content-suggestion.service";
import { CoachReplicaModule } from "../coach-replica/coach-replica.module";

@Module({
  imports: [CoachReplicaModule],
  controllers: [ContentSuggestionController],
  providers: [ContentSuggestionService],
  exports: [ContentSuggestionService],
})
export class ContentSuggestionModule {}
