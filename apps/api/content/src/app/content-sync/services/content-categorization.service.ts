import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nlc-ai/api-database';

interface VideoAnalysis {
  title: string;
  description?: string;
  tags?: string[];
}

export interface CategoryResult {
  categoryID: string;
  categoryName: string;
  confidence: number;
}

@Injectable()
export class ContentCategorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async categorizeVideo(videoData: VideoAnalysis): Promise<CategoryResult> {
    const { title, description = '', tags = [] } = videoData;

    // Simple keyword-based categorization logic
    const content = `${title} ${description} ${tags.join(' ')}`.toLowerCase();

    const categoryScores = {
      'Controversial': this.calculateControversialScore(content),
      'Informative': this.calculateInformativeScore(content),
      'Entertainment': this.calculateEntertainmentScore(content),
      'Conversational': this.calculateConversationalScore(content),
      'Case Studies': this.calculateCaseStudyScore(content)
    };

    // Find the category with highest score
    const bestCategory = Object.entries(categoryScores)
      .reduce((best, [category, score]) =>
          score > best.score ? { category, score } : best,
        { category: 'Informative', score: 0 }
      );

    return {
      categoryID: '', // Will be set by calling service
      categoryName: bestCategory.category,
      confidence: bestCategory.score
    };
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

  private calculateControversialScore(content: string): number {
    const controversialKeywords = [
      'controversy', 'debate', 'argument', 'conflict', 'dispute',
      'scandal', 'exposed', 'truth', 'shocking', 'controversial',
      'drama', 'fight', 'vs', 'against', 'criticism'
    ];

    return this.calculateKeywordScore(content, controversialKeywords);
  }

  private calculateInformativeScore(content: string): number {
    const informativeKeywords = [
      'how to', 'tutorial', 'guide', 'learn', 'education',
      'tips', 'advice', 'strategy', 'method', 'technique',
      'explain', 'analysis', 'review', 'breakdown', 'lesson',
      'training', 'course', 'step by step', 'instruction'
    ];

    return this.calculateKeywordScore(content, informativeKeywords);
  }

  private calculateEntertainmentScore(content: string): number {
    const entertainmentKeywords = [
      'funny', 'comedy', 'entertainment', 'fun', 'hilarious',
      'joke', 'laugh', 'amusing', 'viral', 'trending',
      'reaction', 'challenge', 'prank', 'meme', 'blooper',
      'compilation', 'highlights', 'best of'
    ];

    return this.calculateKeywordScore(content, entertainmentKeywords);
  }

  private calculateConversationalScore(content: string): number {
    const conversationalKeywords = [
      'interview', 'conversation', 'discussion', 'talk',
      'chat', 'dialogue', 'q&a', 'questions', 'answers',
      'podcast', 'speaking', 'thoughts', 'opinion',
      'perspective', 'view', 'belief', 'experience'
    ];

    return this.calculateKeywordScore(content, conversationalKeywords);
  }

  private calculateCaseStudyScore(content: string): number {
    const caseStudyKeywords = [
      'case study', 'success story', 'example', 'real world',
      'client', 'customer', 'results', 'outcome', 'before after',
      'transformation', 'journey', 'experience', 'testimonial',
      'study', 'research', 'analysis', 'data', 'evidence'
    ];

    return this.calculateKeywordScore(content, caseStudyKeywords);
  }

  private calculateKeywordScore(content: string, keywords: string[]): number {
    let score = 0;
    const contentLength = content.split(' ').length;

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        // Score based on frequency and keyword importance
        score += matches.length * (keyword.length > 5 ? 2 : 1);
      }
    });

    // Normalize by content length to prevent bias towards longer content
    return Math.min(contentLength > 0 ? (score / contentLength) * 100 : 0, 100);
  }
}
