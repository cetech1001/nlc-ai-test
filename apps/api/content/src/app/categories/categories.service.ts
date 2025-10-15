import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existingCategory = await this.prisma.contentCategory.findFirst({
      where: {
        name: createCategoryDto.name,
      }
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    return this.prisma.contentCategory.create({
      data: {
        name: createCategoryDto.name,
        description: createCategoryDto.description,
      },
      include: {
        _count: {
          select: { contentPieces: true }
        }
      }
    });
  }

  async findAll(query: CategoryQueryDto) {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = query;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    };

    return this.prisma.paginate(this.prisma.contentCategory, {
      where,
      page,
      limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: { contentPieces: true }
        }
      }
    });
  }

  async findOne(categoryID: string) {
    const category = await this.prisma.contentCategory.findFirst({
      where: {
        id: categoryID,
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

  async update(categoryID: string, updateCategoryDto: UpdateCategoryDto) {
    const existingCategory = await this.findOne(categoryID);

    if (updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name) {
      const conflictCategory = await this.prisma.contentCategory.findFirst({
        where: {
          name: updateCategoryDto.name,
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

  async remove(categoryID: string) {
    await this.findOne(categoryID);

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
      }
    });

    // If not found, try to find a global category (coachID is null)
    if (!category) {
      category = await this.prisma.contentCategory.findFirst({
        where: {
          name: categoryName,
        }
      });
    }

    // If still not found, create a new category for this coach
    if (!category) {
      category = await this.prisma.contentCategory.create({
        data: {
          name: categoryName,
          description: `Auto-generated category for ${categoryName.toLowerCase()} content`
        }
      });
    }

    return category.id;
  }
}
