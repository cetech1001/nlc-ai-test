import { BaseClient, SearchQuery, Paginated, FilterValues } from '@nlc-ai/sdk-core';
import {
  ExtendedCourse,
  CreateCourse,
  UpdateCourse,
  CourseStats,
  CourseQueryParams,
} from '../types';
import { ChaptersClient } from "./chapters.client";
import { LessonsClient } from "./lessons.client";
import { DripScheduleClient } from "./drip-schedule.client";
import { PaywallClient } from "./paywall.client";
import {NLCClientConfig} from "@nlc-ai/sdk-main";

export class CoursesClient extends BaseClient {
  public chapters: ChaptersClient;
  public lessons: LessonsClient;
  public dripSchedule: DripScheduleClient;
  public paywall: PaywallClient;

  constructor(config: NLCClientConfig) {
    super(config);

    this.chapters = new ChaptersClient(config);
    this.lessons = new LessonsClient(config);
    this.dripSchedule = new DripScheduleClient(config);
    this.paywall = new PaywallClient(config);
  }

  override updateApiKey(apiKey: string | null) {
    const services = [
      this.chapters, this.lessons, this.dripSchedule, this.paywall
    ];

    services.forEach(service => {
      service.updateApiKey(apiKey);
    });
  }

  async getCourses(searchOptions: SearchQuery = {}, filters: FilterValues = {}): Promise<Paginated<ExtendedCourse>> {
    const params = new URLSearchParams();
    const { page = 1, limit = 10, search } = searchOptions;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await this.request<Paginated<ExtendedCourse>>(
      'GET',
      `?${params.toString()}`
    );
    return response.data!;
  }

  async getCourse(courseID: string): Promise<ExtendedCourse> {
    const response = await this.request<ExtendedCourse>('GET', `/${courseID}`);
    return response.data!;
  }

  async createCourse(data: CreateCourse): Promise<ExtendedCourse> {
    const response = await this.request<ExtendedCourse>('POST', '', { body: data });
    return response.data!;
  }

  async updateCourse(courseID: string, data: UpdateCourse): Promise<ExtendedCourse> {
    const response = await this.request<ExtendedCourse>('PUT', `/${courseID}`, { body: data });
    return response.data!;
  }

  async deleteCourse(courseID: string): Promise<void> {
    await this.request('DELETE', `/${courseID}`);
  }

  async publishCourse(courseID: string): Promise<ExtendedCourse> {
    const response = await this.request<ExtendedCourse>('POST', `/${courseID}/publish`);
    return response.data!;
  }

  async unpublishCourse(courseID: string): Promise<ExtendedCourse> {
    const response = await this.request<ExtendedCourse>('POST', `/${courseID}/unpublish`);
    return response.data!;
  }

  async getCourseStats(courseID: string): Promise<CourseStats> {
    const response = await this.request<CourseStats>('GET', `/${courseID}/stats`);
    return response.data!;
  }

  async getCoursesByCoach(coachID: string, query: CourseQueryParams = {}): Promise<Paginated<ExtendedCourse>> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await this.request<Paginated<ExtendedCourse>>(
      'GET',
      `/coach/${coachID}?${params.toString()}`
    );
    return response.data!;
  }
}
