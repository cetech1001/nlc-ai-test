import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import {ConfigModule} from "@nestjs/config";
import { CoachesModule } from './coaches/coaches.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CoachesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
