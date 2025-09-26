import { BaseClient, SearchQuery, Paginated } from "@nlc-ai/sdk-core";
import {
  Category,
  CreateCategory,
  UpdateCategory,
  CategoryQueryOptions
} from "../types";

export class CategoriesClient extends BaseClient {
  async getCategories(searchOptions: SearchQuery = {}, queryOptions: CategoryQueryOptions = {}): Promise<Paginated<Category>> {
    const params = new URLSearchParams();
    const { page = 1, limit = 20, search } = searchOptions;
    const { sortBy = 'name', sortOrder = 'asc' } = queryOptions;

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);

    const response = await this.request<Paginated<Category>>(
      'GET',
      `?${params.toString()}`
    );
    return response.data!;
  }

  async getDefaultCategories(): Promise<{ categories: string[] }> {
    const response = await this.request<{ categories: string[] }>('GET', '/defaults');
    return response.data!;
  }

  async getCategory(categoryID: string): Promise<Category> {
    const response = await this.request<Category>('GET', `/${categoryID}`);
    return response.data!;
  }

  async createCategory(data: CreateCategory): Promise<Category> {
    const response = await this.request<Category>('POST', '', { body: data });
    return response.data!;
  }

  async updateCategory(categoryID: string, data: UpdateCategory): Promise<Category> {
    const response = await this.request<Category>('PATCH', `/${categoryID}`, { body: data });
    return response.data!;
  }

  async deleteCategory(categoryID: string): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('DELETE', `/${categoryID}`);
    return response.data!;
  }
}
