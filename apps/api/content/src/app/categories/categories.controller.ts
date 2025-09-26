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
  ParseUUIDPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, UserTypes, UserTypesGuard, CurrentUser } from '@nlc-ai/api-auth';
import { UserType, type AuthUser } from '@nlc-ai/api-types';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, UserTypesGuard)
@UserTypes(UserType.coach, UserType.admin)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new content category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Category with this name already exists' })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createCategoryDto: CreateCategoryDto
  ) {
    return this.categoriesService.create(user.id, user.type, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: CategoryQueryDto
  ) {
    return this.categoriesService.findAll(user.id, user.type, query);
  }

  @Get('defaults')
  @ApiOperation({ summary: 'Get default category names' })
  @ApiResponse({ status: 200, description: 'Default categories retrieved successfully' })
  async getDefaults() {
    const categories = await this.categoriesService.getDefaultCategories();
    return { categories };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) categoryID: string
  ) {
    return this.categoriesService.findOne(user.id, user.type, categoryID);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category name conflict' })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) categoryID: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoriesService.update(user.id, user.type, categoryID, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete category with content' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) categoryID: string
  ) {
    return this.categoriesService.remove(user.id, user.type, categoryID);
  }
}
