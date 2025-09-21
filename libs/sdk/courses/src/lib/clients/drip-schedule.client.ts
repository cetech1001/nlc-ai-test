import { BaseClient } from '@nlc-ai/sdk-core';

export interface LessonDripSetting {
  lessonID: string;
  days: number;
  type: 'course_start' | 'previous_lesson';
}

export interface UpdateLessonDripScheduleRequest {
  lessonSettings: LessonDripSetting[];
}

export interface DripScheduleResponse {
  courseID: string;
  isDripEnabled: boolean;
  dripInterval?: string;
  dripCount?: number;
  schedule: any[];
  lessons?: any[];
}

export interface UpdateDripScheduleRequest {
  isDripEnabled: boolean;
  dripInterval?: string;
  dripCount?: number;
  initialDelay?: number;
  releaseDate?: string;
  autoUnlockChapters?: boolean;
  completionThreshold?: number;
}

export class DripScheduleClient extends BaseClient {
  async getDripSchedule(courseID: string): Promise<DripScheduleResponse> {
    const response = await this.request<DripScheduleResponse>(
      'GET',
      `/${courseID}/drip-schedule`
    );
    return response.data!;
  }

  async updateDripSchedule(courseID: string, data: UpdateDripScheduleRequest): Promise<DripScheduleResponse> {
    const response = await this.request<DripScheduleResponse>(
      'PUT',
      `/${courseID}/drip-schedule`,
      { body: data }
    );
    return response.data!;
  }

  async updateLessonDripSchedule(courseID: string, data: UpdateLessonDripScheduleRequest): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(
      'PUT',
      `/${courseID}/drip-schedule/lessons`,
      { body: data }
    );
    return response.data!;
  }

  async previewDripSchedule(courseID: string, enrollmentID: string): Promise<{
    enrollmentID: string;
    enrollmentDate: Date;
    schedule: any[];
  }> {
    const response = await this.request<{
      enrollmentID: string;
      enrollmentDate: Date;
      schedule: any[];
    }>('GET', `/${courseID}/drip-schedule/preview/${enrollmentID}`);
    return response.data!;
  }
}
