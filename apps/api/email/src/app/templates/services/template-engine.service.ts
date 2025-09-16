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
    return template.replace(/\{\{(\w+)}}/g, (match, variable) => {
      return variables[variable] ?? match;
    });
  }

  extractVariables(template: string): string[] {
    const matches = template.match(/\{\{(\w+)\}\}/g);
    return matches ? [...new Set(matches.map(match => match.replace(/[{}]/g, '')))] : [];
  }

  async renderEmailFromTemplate(
    templateID: string,
    variables: Record<string, any>,
    userID?: string
  ): Promise<{ subject: string; html: string; text?: string }> {
    variables = {
      ...this.variables,
      ...variables,
    };

    const template = await this.prisma.emailTemplate.findFirst({
      where: {
        id: userID ? templateID : undefined,
        systemKey: userID ? undefined : templateID,
        userID,
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
        id: userID ? templateID : undefined,
        systemKey: userID ? undefined : templateID,
      },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    });

    return { subject, html };
  }
}
