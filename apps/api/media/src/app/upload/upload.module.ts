import {Module} from "@nestjs/common";
import {MediaModule} from "../media/media.module";
import {UploadController} from "./upload.controller";

@Module({
  imports: [MediaModule],
  controllers: [UploadController],
})
export class UploadModule {}
