import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { UserType } from '@nlc-ai/api-types';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userID: string, userType: UserType, createCategoryDto: CreateCategoryDto) {
    // Check if category with same name already exists for this coach
    const existingCategory = await this.prisma.contentCategory.findFirst({
      where: {
        name: createCategoryDto.name,
        coachID: userID
      }
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.contentCategory.create({
      data: {
        name: createCategoryDto.name,
        description: createCategoryDto.description,
        coachID: userID,
      },
      include: {
        _count: {
          select: { contentPieces: true }
        }
      }
    });
  }

  async findAll(userID: string, userType: UserType, query: CategoryQueryDto) {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    const where = {
      coachID: userID,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    };

    const [categories, total] = await Promise.all([
      this.prisma.contentCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { contentPieces: true }
          }
        }
      }),
      this.prisma.contentCategory.count({ where })
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(userID: string, userType: UserType, categoryID: string) {
    const category = await this.prisma.contentCategory.findFirst({
      where: {
        id: categoryID,
        coachID: userID
      },
      include: {
        _count: {
          select: { contentPieces: true }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(userID: string, userType: UserType, categoryID: string, updateCategoryDto: UpdateCategoryDto) {
    // Check if category exists and belongs to user
    const existingCategory = await this.findOne(userID, userType, categoryID);

    // If updating name, check for conflicts
    if (updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name) {
      const conflictCategory = await this.prisma.contentCategory.findFirst({
        where: {
          name: updateCategoryDto.name,
          coachID: userID,
          id: { not: categoryID }
        }
      });

      if (conflictCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    return this.prisma.contentCategory.update({
      where: { id: categoryID },
      data: updateCategoryDto,
      include: {
        _count: {
          select: { contentPieces: true }
        }
      }
    });
  }

  async remove(userID: string, userType: UserType, categoryID: string) {
    // Check if category exists and belongs to user
    await this.findOne(userID, userType, categoryID);

    // Check if category has content pieces
    const contentCount = await this.prisma.contentPiece.count({
      where: { categoryID }
    });

    if (contentCount > 0) {
      throw new ConflictException('Cannot delete category that contains content pieces');
    }

    await this.prisma.contentCategory.delete({
      where: { id: categoryID }
    });

    return { message: 'Category deleted successfully' };
  }

  async getDefaultCategories(): Promise<string[]> {
    return [
      'Controversial',
      'Informative',
      'Entertainment',
      'Conversational',
      'Case Studies'
    ];
  }

  async ensureCategoryExists(coachID: string, categoryName: string): Promise<string> {
    // First try to find existing category for this coach
    let category = await this.prisma.contentCategory.findFirst({
      where: {
        name: categoryName,
        coachID: coachID
      }
    });

    // If not found, try to find a global category (coachID is null)
    if (!category) {
      category = await this.prisma.contentCategory.findFirst({
        where: {
          name: categoryName,
          coachID: null
        }
      });
    }

    // If still not found, create a new category for this coach
    if (!category) {
      category = await this.prisma.contentCategory.create({
        data: {
          name: categoryName,
          coachID: coachID,
          description: `Auto-generated category for ${categoryName.toLowerCase()} content`
        }
      });
    }

    return category.id;
  }
}
