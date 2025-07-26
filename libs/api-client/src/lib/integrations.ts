import { BaseAPI } from './base';
import { Integration } from '@nlc-ai/types';

export interface SocialIntegrationResponse extends Omit<Integration, 'coach' | 'webhookEvents'> {
  profileData?: {
    username?: string;
    name?: string;
    email?: string;
    profileUrl?: string;
    profilePictureUrl?: string;
    followerCount?: number;
    mediaCount?: number;
    subscriberCount?: number;
  };
}

export interface CourseIntegrationResponse extends Omit<Integration, 'coach' | 'webhookEvents'> {
  courses?: CourseData[];
  students?: StudentData[];
  stats?: {
    totalCourses?: number;
    totalStudents?: number;
    totalEnrollments?: number;
  };
}

export interface CourseData {
  id: string;
  title: string;
  description?: string;
  slug?: string;
  status?: string;
  enrollmentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  enrollments?: EnrollmentData[];
  createdAt?: string;
}

export interface EnrollmentData {
  id: string;
  courseId: string;
  courseName?: string;
  status: string;
  progress?: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface ConnectSocialRequest {
  accessToken: string;
  refreshToken?: string;
  profileData?: any;
  tokenExpiresAt?: string;
}

export interface ConnectCourseRequest {
  apiKey?: string;
  subdomain?: string;
  schoolUrl?: string;
  groupUrl?: string;
  zapierApiKey?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface AuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface TestResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface CoursePlatformInfo {
  name: string;
  authType: 'api_key' | 'oauth' | 'webhook';
  requiredFields: string[];
  description: string;
  setupInstructions: string[];
}

class IntegrationsAPI extends BaseAPI {
  // ==================== GENERAL INTEGRATION METHODS ====================

  /**
   * Get all integrations for the authenticated coach
   */
  async getAllIntegrations(): Promise<(SocialIntegrationResponse | CourseIntegrationResponse)[]> {
    return this.makeRequest('/integrations');
  }

  /**
   * Update integration settings
   */
  async updateIntegration(
    integrationId: string,
    updateData: {
      isActive?: boolean;
      syncSettings?: any;
      config?: any;
    }
  ): Promise<SocialIntegrationResponse | CourseIntegrationResponse> {
    return this.makeRequest(`/integrations/${integrationId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Test integration connection
   */
  async testIntegration(integrationId: string): Promise<TestResponse> {
    return this.makeRequest(`/integrations/${integrationId}/test`, {
      method: 'POST',
    });
  }

  /**
   * Disconnect integration
   */
  async disconnectIntegration(integrationId: string): Promise<TestResponse> {
    return this.makeRequest(`/integrations/${integrationId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Manually sync data from platform
   */
  async syncIntegration(integrationId: string): Promise<TestResponse> {
    return this.makeRequest(`/integrations/${integrationId}/sync`, {
      method: 'POST',
    });
  }

  // ==================== SOCIAL MEDIA INTEGRATION METHODS ====================

  /**
   * Get social media integrations only
   */
  async getSocialIntegrations(): Promise<SocialIntegrationResponse[]> {
    return this.makeRequest('/integrations/social');
  }

  /**
   * Get OAuth authorization URL for a social platform
   */
  async getAuthUrl(platform: string): Promise<AuthUrlResponse> {
    return this.makeRequest(`/integrations/auth/${platform}/url`);
  }

  /**
   * Handle OAuth callback from social platform
   */
  async handleOAuthCallback(
    platform: string,
    code: string,
    state?: string,
    error?: string,
    errorDescription?: string): Promise<SocialIntegrationResponse> {
    const params = `code=${code}&state=${state}&error=${error}&errorDescription=${errorDescription}`
    return this.makeRequest(`/oauth/${platform}/callback?${params}`);
  }

  /**
   * Connect a social media platform manually (for testing or direct token input)
   */
  async connectSocialPlatform(platform: string, authData: ConnectSocialRequest): Promise<SocialIntegrationResponse> {
    return this.makeRequest(`/integrations/connect/${platform}`, {
      method: 'POST',
      body: JSON.stringify(authData),
    });
  }

  /**
   * Helper method to initiate OAuth flow for social platforms
   */
  async initiateOAuthFlow(platform: string): Promise<void> {
    try {
      // Open a blank popup immediately during user action to avoid Safari blocking
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      // Create popup window immediately with about:blank
      const authWindow = window.open(
        'about:blank',
        `${platform}_oauth`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      // Check if popup creation failed
      if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
        // Popup was blocked, fallback to new tab
        console.warn('Popup blocked, getting auth URL and opening in new tab');
        const { authUrl, state } = await this.getAuthUrl(platform);

        // Store state in localStorage for verification
        if (typeof window !== 'undefined') {
          localStorage.setItem(`oauth_state_${platform}`, state);
        }

        const newTabWindow = window.open(authUrl, '_blank');

        if (!newTabWindow) {
          throw new Error('Both popup and new tab were blocked. Please allow popups for this site or manually navigate to the authorization URL.');
        }

        // For new tab, we can't reliably detect when OAuth completes
        return Promise.resolve();
      }

      // Get auth URL after popup is created
      const { authUrl, state } = await this.getAuthUrl(platform);

      // Store state in localStorage for verification
      if (typeof window !== 'undefined') {
        localStorage.setItem(`oauth_state_${platform}`, state);
      }

      // Navigate the popup to the auth URL
      authWindow.location.href = authUrl;

      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            // Check if OAuth was successful by looking for integration
            this.getSocialIntegrations()
              .then(integrations => {
                const newIntegration = integrations.find(i => i.platformName === platform);
                if (newIntegration) {
                  resolve();
                } else {
                  reject(new Error('OAuth flow was cancelled or failed'));
                }
              })
              .catch(() => reject(new Error('Failed to verify OAuth completion')));
          }
        }, 1000);

        // Cleanup if window doesn't close within 5 minutes
        setTimeout(() => {
          if (!authWindow?.closed) {
            authWindow?.close();
            clearInterval(checkClosed);
            reject(new Error('OAuth flow timed out'));
          }
        }, 300000);
      });
    } catch (error) {
      throw new Error(`Failed to initiate OAuth flow: ${error}`);
    }
  }

  // ==================== COURSE PLATFORM INTEGRATION METHODS ====================

  /**
   * Get course platform integrations only
   */
  async getCourseIntegrations(): Promise<CourseIntegrationResponse[]> {
    return this.makeRequest('/integrations/courses');
  }

  /**
   * Get available course platforms and their requirements
   */
  async getAvailableCoursePlatforms(): Promise<Record<string, CoursePlatformInfo>> {
    return this.makeRequest('/integrations/courses/platforms');
  }

  /**
   * Test course platform credentials before connecting
   */
  async testCoursePlatformCredentials(platform: string, credentials: ConnectCourseRequest): Promise<TestResponse> {
    return this.makeRequest(`/integrations/courses/test/${platform}`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Connect a course platform with credentials
   */
  async connectCoursePlatform(platform: string, credentials: ConnectCourseRequest): Promise<CourseIntegrationResponse> {
    return this.makeRequest(`/integrations/courses/connect/${platform}`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Sync course platform data
   */
  async syncCoursePlatformData(integrationId: string): Promise<TestResponse> {
    return this.makeRequest(`/integrations/courses/${integrationId}/sync`, {
      method: 'POST',
    });
  }

  /**
   * Get courses and students data from connected course platform
   */
  async getCoursePlatformData(integrationId: string): Promise<{
    platform: string;
    courses: CourseData[];
    students: StudentData[];
    stats: any;
    lastSync: string;
  }> {
    return this.makeRequest(`/integrations/courses/${integrationId}/data`);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Helper method to get integration by platform
   */
  async getIntegrationByPlatform(platform: string): Promise<SocialIntegrationResponse | CourseIntegrationResponse | null> {
    const integrations = await this.getAllIntegrations();
    return integrations.find(integration => integration.platformName === platform) || null;
  }

  /**
   * Helper method to check if platform is connected
   */
  async isPlatformConnected(platform: string): Promise<boolean> {
    const integration = await this.getIntegrationByPlatform(platform);
    return integration?.isActive === true;
  }

  /**
   * Helper method to get all connected platforms
   */
  async getConnectedPlatforms(): Promise<string[]> {
    const integrations = await this.getAllIntegrations();
    return integrations
      .filter(integration => integration.isActive)
      .map(integration => integration.platformName);
  }

  /**
   * Helper method to get connected social platforms
   */
  async getConnectedSocialPlatforms(): Promise<string[]> {
    const integrations = await this.getSocialIntegrations();
    return integrations
      .filter(integration => integration.isActive)
      .map(integration => integration.platformName);
  }

  /**
   * Helper method to get connected course platforms
   */
  async getConnectedCoursePlatforms(): Promise<string[]> {
    const integrations = await this.getCourseIntegrations();
    return integrations
      .filter(integration => integration.isActive)
      .map(integration => integration.platformName);
  }

  /**
   * Helper method to get course platform by name with data
   */
  async getCoursePlatform(platform: string): Promise<CourseIntegrationResponse | null> {
    const integrations = await this.getCourseIntegrations();
    return integrations.find(integration => integration.platformName === platform) || null;
  }

  /**
   * Helper method to get all courses from all connected platforms
   */
  async getAllCourses(): Promise<Array<CourseData & { platform: string; integrationId: string }>> {
    const courseIntegrations = await this.getCourseIntegrations();
    const allCourses: Array<CourseData & { platform: string; integrationId: string }> = [];

    for (const integration of courseIntegrations) {
      if (integration.isActive && integration.config?.courses) {
        const courses = integration.config.courses.map((course: CourseData) => ({
          ...course,
          platform: integration.platformName,
          integrationId: integration.id,
        }));
        allCourses.push(...courses);
      }
    }

    return allCourses;
  }

  /**
   * Helper method to get all students from all connected platforms
   */
  async getAllStudents(): Promise<Array<StudentData & { platform: string; integrationId: string }>> {
    const courseIntegrations = await this.getCourseIntegrations();
    const allStudents: Array<StudentData & { platform: string; integrationId: string }> = [];

    for (const integration of courseIntegrations) {
      if (integration.isActive && integration.config?.students) {
        const students = integration.config.students.map((student: StudentData) => ({
          ...student,
          platform: integration.platformName,
          integrationId: integration.id,
        }));
        allStudents.push(...students);
      }
    }

    return allStudents;
  }

  /**
   * Helper method to get aggregated stats from all course platforms
   */
  async getCoursePlatformStats(): Promise<{
    totalCourses: number;
    totalStudents: number;
    totalEnrollments: number;
    platformBreakdown: Array<{
      platform: string;
      courses: number;
      students: number;
      lastSync: string;
    }>;
  }> {
    const courseIntegrations = await this.getCourseIntegrations();

    let totalCourses = 0;
    let totalStudents = 0;
    let totalEnrollments = 0;
    const platformBreakdown: Array<{
      platform: string;
      courses: number;
      students: number;
      lastSync: string;
    }> = [];

    for (const integration of courseIntegrations) {
      if (integration.isActive) {
        const stats = integration.config?.stats || {};
        const courses = stats.totalCourses || 0;
        const students = stats.totalStudents || 0;

        totalCourses += courses;
        totalStudents += students;
        totalEnrollments += stats.totalEnrollments || 0;

        platformBreakdown.push({
          platform: integration.platformName,
          courses,
          students,
          lastSync: integration.lastSyncAt?.toLocaleDateString() || '',
        });
      }
    }

    return {
      totalCourses,
      totalStudents,
      totalEnrollments,
      platformBreakdown,
    };
  }
}

export const integrationsAPI = new IntegrationsAPI();
