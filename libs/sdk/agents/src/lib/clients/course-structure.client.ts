import { BaseClient } from '@nlc-ai/sdk-core';
import { CourseStructureRequest, CourseStructureSuggestion } from '../types';

export class CourseStructureClient extends BaseClient {
  async generateCourseStructure(request: CourseStructureRequest): Promise<CourseStructureSuggestion> {
    const response = await this.request<CourseStructureSuggestion>(
      'POST',
      '/suggest',
      { body: request }
    );
    return response.data!;
  }
}
