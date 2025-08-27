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
  UpdateMessageDto,
  MessageFiltersDto,
  ConversationFiltersDto,
  MarkAsReadDto,
} from './dto';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin, UserType.client)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Conversations endpoints
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
    @Query() filters: ConversationFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.getConversations(filters, user.id, user.type);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a specific conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Conversation retrieved successfully' })
  async getConversation(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.getConversation(id, user.id, user.type);
  }

  // Messages endpoints
  @Post('conversations/:conversationID/messages')
  @ApiOperation({ summary: 'Send a message in conversation' })
  @ApiParam({ name: 'conversationID', description: 'Conversation ID' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  async sendMessage(
    @Param('conversationID') conversationID: string,
    @Body() createDto: CreateMessageDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.sendMessage(conversationID, createDto, user.id, user.type);
  }

  @Get('conversations/:conversationID/messages')
  @ApiOperation({ summary: 'Get messages in conversation' })
  @ApiParam({ name: 'conversationID', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getMessages(
    @Param('conversationID') conversationID: string,
    @Query() filters: MessageFiltersDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.getMessages(conversationID, filters, user.id, user.type);
  }

  @Put('messages/:id')
  @ApiOperation({ summary: 'Edit a message' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message updated successfully' })
  async editMessage(
    @Param('id') id: string,
    @Body() updateDto: UpdateMessageDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.editMessage(id, updateDto, user.id, user.type);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  async deleteMessage(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.deleteMessage(id, user.id, user.type);
  }

  @Post('messages/mark-read')
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  async markAsRead(
    @Body() markAsReadDto: MarkAsReadDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.markAsRead(markAsReadDto.messageIDs, user.id, user.type);
  }

  @Get('conversations/:conversationID/unread-count')
  @ApiOperation({ summary: 'Get unread message count for conversation' })
  @ApiParam({ name: 'conversationID', description: 'Conversation ID' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(
    @Param('conversationID') conversationID: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.messagesService.getUnreadCount(conversationID, user.id, user.type);
  }

  // Admin support conversation
  @Post('support/conversation')
  @ApiOperation({ summary: 'Create or get conversation with admin' })
  @ApiResponse({ status: 201, description: 'Support conversation ready' })
  @UserTypes(UserType.coach)
  async createSupportConversation(@CurrentUser() user: AuthUser) {
    return this.messagesService.createSupportConversation(user.id);
  }
}
