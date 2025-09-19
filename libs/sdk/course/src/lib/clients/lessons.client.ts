import { BaseClient } from '@nlc-ai/sdk-core';
import { CreateCourseLesson, UpdateCourseLesson, CourseLessonWithDetails } from '../types';

export interface ReorderLessonsRequest {
  lessonIDs: string[];
}

export class LessonsClient extends BaseClient {
  async createLesson(courseID: string, chapterID: string, data: CreateCourseLesson): Promise<CourseLessonWithDetails> {
    const response = await this.request<CourseLessonWithDetails>(
      'POST',
      `/${courseID}/chapters/${chapterID}/lessons`,
      { body: data }
    );
    return response.data!;
  }

  async getLessons(courseID: string, chapterID: string): Promise<CourseLessonWithDetails[]> {
    const response = await this.request<CourseLessonWithDetails[]>(
      'GET',
      `/${courseID}/chapters/${chapterID}/lessons`
    );
    return response.data!;
  }

  async getLesson(courseID: string, chapterID: string, lessonID: string): Promise<CourseLessonWithDetails> {
    const response = await this.request<CourseLessonWithDetails>(
      'GET',
      `/${courseID}/chapters/${chapterID}/lessons/${lessonID}`
    );
    return response.data!;
  }

  async updateLesson(courseID: string, chapterID: string, lessonID: string, data: UpdateCourseLesson): Promise<CourseLessonWithDetails> {
    const response = await this.request<CourseLessonWithDetails>(
      'PUT',
      `/${courseID}/chapters/${chapterID}/lessons/${lessonID}`,
      { body: data }
    );
    return response.data!;
  }

  async deleteLesson(courseID: string, chapterID: string, lessonID: string): Promise<void> {
    await this.request('DELETE', `/${courseID}/chapters/${chapterID}/lessons/${lessonID}`);
  }

  async reorderLessons(courseID: string, chapterID: string, lessonIDs: string[]): Promise<{ success: boolean }> {
    const response = await this.request<{ success: boolean }>(
      'PUT',
      `/${courseID}/chapters/${chapterID}/lessons/reorder`,
      { body: { lessonIDs } }
    );
    return response.data!;
  }
}
