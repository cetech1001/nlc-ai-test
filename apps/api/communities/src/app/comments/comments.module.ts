import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import {ActivityHelperService} from "../helpers/activity-helper.service";

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, ActivityHelperService],
  exports: [CommentsService],
})
export class CommentsModule {}
