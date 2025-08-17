import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto, UpdateAdminDto, AdminQueryDto } from './dto';
import { JwtAuthGuard, UserTypesGuard, UserTypes, Public } from '@nlc-ai/api-auth';
import { UserType } from '@nlc-ai/api-types';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.admin)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all administrators' })
  @ApiResponse({ status: 200, description: 'Administrators retrieved successfully' })
  findAll(@Query() query: AdminQueryDto) {
    return this.adminService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific administrator by ID' })
  @ApiResponse({ status: 200, description: 'Administrator retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Administrator not found' })
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new administrator' })
  @ApiResponse({ status: 201, description: 'Administrator created successfully' })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an administrator' })
  @ApiResponse({ status: 200, description: 'Administrator updated successfully' })
  @ApiResponse({ status: 404, description: 'Administrator not found' })
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(id, updateAdminDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle administrator active status' })
  @ApiResponse({ status: 200, description: 'Administrator status toggled successfully' })
  toggleStatus(@Param('id') id: string) {
    return this.adminService.toggleStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an administrator' })
  @ApiResponse({ status: 200, description: 'Administrator deleted successfully' })
  @ApiResponse({ status: 404, description: 'Administrator not found' })
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }
}
