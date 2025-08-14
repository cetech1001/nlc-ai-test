import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';

@Injectable()
export class EmailTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getTemplates(coachID: string, filters: TemplateFilters) {
    const {
      category,
      search,
      tags,
      isAiGenerated,
      isActive = true,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {
      coachID,
      isActive,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { subjectTemplate: { contains: search, mode: 'insensitive' } },
        { bodyTemplate: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (typeof isAiGenerated === 'boolean') {
      where.isAiGenerated = isAiGenerated;
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [templates, totalCount] = await Promise.all([
      this.prisma.emailTemplate.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          category: true,
          description: true,
          subjectTemplate: true,
          bodyTemplate: true,
          tags: true,
          isAiGenerated: true,
          usageCount: true,
          lastUsedAt: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.emailTemplate.count({ where }),
    ]);

    return {
      templates,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };
  }

  async getTemplateCategories(coachID: string) {
    const categories = await this.prisma.emailTemplate.groupBy({
      by: ['category'],
      where: {
        coachID,
        isActive: true,
      },
      _count: {
        category: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return {
      categories: categories.map(cat => ({
        name: cat.category,
        count: cat._count.category,
      })),
    };
  }

  async getTemplate(coachID: string, templateID: string) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        id: templateID,
        coachID,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return { template };
  }

  async createTemplate(coachID: string, createRequest: CreateTemplateRequest) {
    const {
      name,
      category,
      subjectTemplate,
      bodyTemplate,
      description,
      tags,
      isAiGenerated = false,
      generationPrompt,
    } = createRequest;

    // Check for duplicate names within the coach's templates
    const existingTemplate = await this.prisma.emailTemplate.findFirst({
      where: {
        coachID,
        name,
        isActive: true,
      },
    });

    if (existingTemplate) {
      throw new BadRequestException('Template with this name already exists');
    }

    const template = await this.prisma.emailTemplate.create({
      data: {
        coachID,
        name: name.trim(),
        category: category.trim(),
        subjectTemplate: subjectTemplate.trim(),
        bodyTemplate: bodyTemplate.trim(),
        description: description?.trim(),
        tags: tags || [],
        isAiGenerated,
        generationPrompt,
        isActive: true,
        usageCount: 0,
      },
    });

    return {
      message: 'Template created successfully',
      template,
    };
  }

  async updateTemplate(coachID: string, templateID: string, updateRequest: UpdateTemplateRequest) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        id: templateID,
        coachID,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Check for duplicate names if name is being changed
    if (updateRequest.name && updateRequest.name !== template.name) {
      const existingTemplate = await this.prisma.emailTemplate.findFirst({
        where: {
          coachID,
          name: updateRequest.name,
          isActive: true,
          id: { not: templateID },
        },
      });

      if (existingTemplate) {
        throw new BadRequestException('Template with this name already exists');
      }
    }

    const updatedTemplate = await this.prisma.emailTemplate.update({
      where: { id: templateID },
      data: {
        ...updateRequest,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Template updated successfully',
      template: updatedTemplate,
    };
  }

  async deleteTemplate(coachID: string, templateID: string) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        id: templateID,
        coachID,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Soft delete by setting isActive to false
    await this.prisma.emailTemplate.update({
      where: { id: templateID },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Template deleted successfully',
    };
  }

  async duplicateTemplate(
    coachID: string,
    templateID: string,
    options: { name?: string; category?: string }
  ) {
    const originalTemplate = await this.prisma.emailTemplate.findFirst({
      where: {
        id: templateID,
        coachID,
      },
    });

    if (!originalTemplate) {
      throw new NotFoundException('Template not found');
    }

    const newName = options.name || `${originalTemplate.name} (Copy)`;
    const newCategory = options.category || originalTemplate.category;

    // Check for duplicate names
    const existingTemplate = await this.prisma.emailTemplate.findFirst({
      where: {
        coachID,
        name: newName,
        isActive: true,
      },
    });

    if (existingTemplate) {
      throw new BadRequestException('Template with this name already exists');
    }

    const duplicatedTemplate = await this.prisma.emailTemplate.create({
      data: {
        coachID,
        name: newName,
        category: newCategory,
        description: originalTemplate.description,
        subjectTemplate: originalTemplate.subjectTemplate,
        bodyTemplate: originalTemplate.bodyTemplate,
        tags: originalTemplate.tags,
        isAiGenerated: originalTemplate.isAiGenerated,
        generationPrompt: originalTemplate.generationPrompt,
        isActive: true,
        usageCount: 0,
      },
    });

    return {
      message: 'Template duplicated successfully',
      template: duplicatedTemplate,
    };
  }

  async previewTemplate(coachID: string, templateID: string, previewData: Record<string, any>) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        id: templateID,
        coachID,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Simple template variable replacement
    const processTemplate = (templateString: string, data: Record<string, any>): string => {
      return templateString.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
        return data[variable] || match;
      });
    };

    const previewSubject = processTemplate(template.subjectTemplate, previewData);
    const previewBody = processTemplate(template.bodyTemplate, previewData);

    // Extract variables used in template
    const extractVariables = (templateString: string): string[] => {
      const matches = templateString.match(/\{\{(\w+)\}\}/g);
      return matches ? matches.map(match => match.replace(/[{}]/g, '')) : [];
    };

    const subjectVariables = extractVariables(template.subjectTemplate);
    const bodyVariables = extractVariables(template.bodyTemplate);
    const allVariables = [...new Set([...subjectVariables, ...bodyVariables])];

    return {
      preview: {
        subject: previewSubject,
        body: previewBody,
      },
      variables: allVariables,
      sampleData: previewData,
    };
  }

  async getTemplateUsageStats(coachID: string, templateID: string, days: number = 30) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        id: templateID,
        coachID,
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // This is a simplified version - you'd need to track template usage in scheduled emails
    // For now, we'll return the basic usage count from the template itself
    const recentUsage = await this.prisma.scheduledEmail.count({
      where: {
        coachID,
        createdAt: { gte: startDate },
        // You'd need to add a templateID field to scheduledEmail to track this properly
        // templateID: templateID,
      },
    });

    return {
      templateID,
      totalUsage: template.usageCount,
      recentUsage: 0, // Would be recentUsage if templateID was tracked in scheduledEmail
      lastUsedAt: template.lastUsedAt,
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
    };
  }

  async incrementTemplateUsage(templateID: string) {
    await this.prisma.emailTemplate.update({
      where: { id: templateID },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
  }

  // Bulk operations
  async bulkUpdateTemplates(
    coachID: string,
    templateIDs: string[],
    updates: Partial<UpdateTemplateRequest>
  ) {
    const result = await this.prisma.emailTemplate.updateMany({
      where: {
        id: { in: templateIDs },
        coachID,
      },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    return {
      message: `${result.count} templates updated successfully`,
      updatedCount: result.count,
    };
  }

  async bulkDeleteTemplates(coachID: string, templateIDs: string[]) {
    const result = await this.prisma.emailTemplate.updateMany({
      where: {
        id: { in: templateIDs },
        coachID,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return {
      message: `${result.count} templates deleted successfully`,
      deletedCount: result.count,
    };
  }

  // Import/Export functionality
  async exportTemplates(coachID: string, templateIDs?: string[]) {
    const where: any = {
      coachID,
      isActive: true,
    };

    if (templateIDs && templateIDs.length > 0) {
      where.id = { in: templateIDs };
    }

    const templates = await this.prisma.emailTemplate.findMany({
      where,
      select: {
        name: true,
        category: true,
        description: true,
        subjectTemplate: true,
        bodyTemplate: true,
        tags: true,
        isAiGenerated: true,
        generationPrompt: true,
      },
    });

    return {
      templates,
      exportedAt: new Date(),
      count: templates.length,
    };
  }

  async importTemplates(coachID: string, templates: any[], options: { overwrite?: boolean } = {}) {
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const templateData of templates) {
      try {
        const existingTemplate = await this.prisma.emailTemplate.findFirst({
          where: {
            coachID,
            name: templateData.name,
            isActive: true,
          },
        });

        if (existingTemplate && !options.overwrite) {
          results.skipped++;
          continue;
        }

        if (existingTemplate && options.overwrite) {
          await this.prisma.emailTemplate.update({
            where: { id: existingTemplate.id },
            data: {
              ...templateData,
              updatedAt: new Date(),
            },
          });
        } else {
          await this.prisma.emailTemplate.create({
            data: {
              coachID,
              ...templateData,
              usageCount: 0,
              isActive: true,
            },
          });
        }

        results.imported++;
      } catch (error) {
        results.errors.push(`Failed to import template "${templateData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      message: `Import completed: ${results.imported} imported, ${results.skipped} skipped, ${results.errors.length} errors`,
      results,
    };
  }
}
