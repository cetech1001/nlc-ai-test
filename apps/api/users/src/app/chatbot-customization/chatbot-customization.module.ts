import { Module } from '@nestjs/common';
import { ChatbotCustomizationController } from './chatbot-customization.controller';
import { ChatbotCustomizationService } from './chatbot-customization.service';

@Module({
  controllers: [ChatbotCustomizationController],
  providers: [ChatbotCustomizationService],
  exports: [ChatbotCustomizationService],
})
export class ChatbotCustomizationModule {}
