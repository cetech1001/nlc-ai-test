import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser, UserTypes, UserTypesGuard } from '@nlc-ai/api-auth';
import { type AuthUser, UserType } from '@nlc-ai/api-types';
import { MessagesService } from './messages.service';
import {
  CreateConversationDto,
  CreateMessageDto,
  MessageFiltersDto,
  EditMessageDto,
} from './dto';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin, UserType.client)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully' })
  async createConversation(
    @Body() createDto: CreateConversationDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.createConversation(createDto, user.id, user.type);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiResponse({ status: 200, description: 'Conversations retrieved successfully' })
  async getConversations(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.getConversations(user.id, user.type, page, limit);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send message in conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(
    @Param('id') conversationID: string,
    @Body() createDto: CreateMessageDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.sendMessage(conversationID, createDto, user.id, user.type);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getMessages(
    @Param('id') conversationID: string,
    @Query() filters: MessageFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.getMessages(conversationID, user.id, user.type, filters);
  }

  @Put('conversations/:id/read')
  @ApiOperation({ summary: 'Mark conversation messages as read' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markAsRead(
    @Param('id') conversationID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.markAsRead(conversationID, user.id, user.type);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@CurrentUser() user: AuthUser) {
    return this.messagesService.getUnreadCount(user.id, user.type);
  }

  @Put('messages/:id')
  @ApiOperation({ summary: 'Edit message' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message updated successfully' })
  async editMessage(
    @Param('id') messageID: string,
    @Body() editDto: EditMessageDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.editMessage(messageID, editDto.content, user.id, user.type);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete message' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  async deleteMessage(
    @Param('id') messageID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.deleteMessage(messageID, user.id, user.type);
  }
}
