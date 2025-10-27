import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import {ActivityHelperService} from "../helpers/activity-helper.service";

@Module({
  controllers: [PostsController],
  providers: [PostsService, ActivityHelperService],
  exports: [PostsService],
})
export class PostsModule {}
