import {Injectable, NotFoundException} from "@nestjs/common";
import {PrismaService} from "@nlc-ai/api-database";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class TemplateEngineService {
  private readonly variables: Record<string, any>;

  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    this.variables = {
      appName: configService.get('email.appName', 'Next Level Coach AI'),
      currentYear: new Date().getFullYear(),
    }
  }

  processTemplate(template: string, variables: Record<string, any>): string {
    variables = {
      ...this.variables,
      ...variables,
    };

    template = this.processConditionals(template, variables);
    template = this.processLoops(template, variables);
    template = this.processVariables(template, variables);

    return template;
  }

  private processConditionals(template: string, variables: Record<string, any>): string {
    const ifRegex = /\{\{#if\s+(\w+)}}([\s\S]*?)\{\{\/if}}/g;

    template = template.replace(ifRegex, (match, variable, content) => {
      const value = variables[variable];
      if (value !== undefined && value !== null && value !== false && value !== '' && value !== 0) {
        return content;
      }
      return '';
    });

    return template;
  }

  private processLoops(template: string, variables: Record<string, any>): string {
    const eachRegex = /\{\{#each\s+(\w+)}}([\s\S]*?)\{\{\/each}}/g;

    template = template.replace(eachRegex, (match, variable, content) => {
      const array = variables[variable];

      if (!Array.isArray(array)) {
        return '';
      }

      return array.map((item, index) => {
        let itemContent = content;

        itemContent = itemContent.replace(/\{\{this}}/g, String(item));

        itemContent = itemContent.replace(/\{\{@index}}/g, String(index + 1));

        return itemContent;
      }).join('');
    });

    return template;
  }

  processVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)}}/g, (match, variable) => {
      return variables[variable] ?? match;
    });
  }

  async renderEmailFromTemplate(
    templateID: string,
    variables: Record<string, any>,
  ): Promise<{ subject: string; html: string; text?: string }> {
    variables = {
      ...this.variables,
      ...variables,
    };

    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        id: templateID,
        // systemKey: userID ? undefined : templateID,
        // userID,
        isActive: true
      }
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const subject = this.processTemplate(template.subjectTemplate || '', variables);
    const html = this.processTemplate(template.bodyTemplate, variables);

    await this.prisma.emailTemplate.update({
      where: {
        id: template.id
      },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    });

    return { subject, html };
  }
}
