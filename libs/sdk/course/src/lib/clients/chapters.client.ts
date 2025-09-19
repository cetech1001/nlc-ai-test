import { BaseClient } from '@nlc-ai/sdk-core';
import { CreateCourseChapter, UpdateCourseChapter, CourseChapterWithDetails } from '../types';

export interface ReorderChaptersRequest {
  chapterIDs: string[];
}

export class ChaptersClient extends BaseClient {
  async createChapter(courseID: string, data: CreateCourseChapter): Promise<CourseChapterWithDetails> {
    const response = await this.request<CourseChapterWithDetails>(
      'POST',
      `/${courseID}/chapters`,
      { body: data }
    );
    return response.data!;
  }

  async getChapters(courseID: string): Promise<CourseChapterWithDetails[]> {
    const response = await this.request<CourseChapterWithDetails[]>(
      'GET',
      `/${courseID}/chapters`
    );
    return response.data!;
  }

  async getChapter(courseID: string, chapterID: string): Promise<CourseChapterWithDetails> {
    const response = await this.request<CourseChapterWithDetails>(
      'GET',
      `/${courseID}/chapters/${chapterID}`
    );
    return response.data!;
  }

  async updateChapter(courseID: string, chapterID: string, data: UpdateCourseChapter): Promise<CourseChapterWithDetails> {
    const response = await this.request<CourseChapterWithDetails>(
      'PUT',
      `/${courseID}/chapters/${chapterID}`,
      { body: data }
    );
    return response.data!;
  }

  async deleteChapter(courseID: string, chapterID: string): Promise<void> {
    await this.request('DELETE', `/${courseID}/chapters/${chapterID}`);
  }

  async reorderChapters(courseID: string, chapterIDs: string[]): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      'PUT',
      `/${courseID}/chapters/reorder`,
      { body: { chapterIDs } }
    );
    return response.data!;
  }
}
