import { BaseClient } from '@nlc-ai/sdk-core';

export interface CoachAIInitResponse {
  success: boolean;
  message?: string;
  vectorStoreID: string;
  assistantID: string;
}

export interface FileUploadResponse {
  success: boolean;
  fileID: string;
  filename: string;
  size: number;
}

export interface VectorStoreFileResponse {
  success: boolean;
  vectorStoreFileID?: string;
  status: string;
  message?: string;
}

export interface FileListResponse {
  success: boolean;
  files: Array<{
    id: string;
    filename: string;
    size: number;
    mimeType: string;
    status: string;
    uploadedAt: Date;
    indexedAt?: Date;
  }>;
}

export interface ThreadResponse {
  success: boolean;
  threadID: string;
}

export interface MessageResponse {
  success: boolean;
  messageID: string;
}

export interface RunResponse {
  success: boolean;
  runID: string;
  status: string;
}

export interface RunStatusResponse {
  success: boolean;
  status: string;
  completedAt?: number;
  failedAt?: number;
  lastError?: any;
}

export interface ThreadMessagesResponse {
  success: boolean;
  messages: any[];
}

export interface AssistantInfoResponse {
  success: boolean;
  assistant: {
    id: string;
    name: string;
    model: string;
    instructions: string;
    tools: any[];
  };
}

export interface UpdateInstructionsResponse {
  success: boolean;
  message: string;
}

export class CoachReplicaClient extends BaseClient {
  /**
   * Initialize coach AI assistant with vector store
   */
  async initialize(name?: string): Promise<CoachAIInitResponse> {
    const response = await this.request<CoachAIInitResponse>(
      'POST',
      '/initialize',
      { body: { name } }
    );
    return response.data!;
  }

  /**
   * Upload file to OpenAI
   */
  async uploadFile(file: File | Blob, filename: string, category?: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, filename);
    if (category) {
      formData.append('category', category);
    }

    const response = await this.request<FileUploadResponse>(
      'POST',
      '/files/upload',
      { body: formData, headers: {} }
    );
    return response.data!;
  }

  /**
   * Add uploaded file to vector store
   */
  async addFileToVectorStore(fileID: string): Promise<VectorStoreFileResponse> {
    const response = await this.request<VectorStoreFileResponse>(
      'POST',
      '/vector-store/add-file',
      { body: { fileID } }
    );
    return response.data!;
  }

  /**
   * Remove file from vector store
   */
  async removeFileFromVectorStore(fileID: string): Promise<VectorStoreFileResponse> {
    const response = await this.request<VectorStoreFileResponse>(
      'DELETE',
      `/vector-store/remove-file/${fileID}`
    );
    return response.data!;
  }

  /**
   * List all files in vector store
   */
  async listFiles(): Promise<FileListResponse> {
    const response = await this.request<FileListResponse>(
      'GET',
      '/files'
    );
    return response.data!;
  }

  /**
   * Create new conversation thread
   */
  async createThread(): Promise<ThreadResponse> {
    const response = await this.request<ThreadResponse>(
      'POST',
      '/thread/create'
    );
    return response.data!;
  }

  /**
   * Add message to thread
   */
  async addMessageToThread(threadID: string, message: string): Promise<MessageResponse> {
    const response = await this.request<MessageResponse>(
      'POST',
      `/thread/${threadID}/message`,
      { body: { message } }
    );
    return response.data!;
  }

  /**
   * Run assistant on thread
   */
  async runAssistant(threadID: string): Promise<RunResponse> {
    const response = await this.request<RunResponse>(
      'POST',
      `/thread/${threadID}/run`
    );
    return response.data!;
  }

  /**
   * Get run status
   */
  async getRunStatus(threadID: string, runID: string): Promise<RunStatusResponse> {
    const response = await this.request<RunStatusResponse>(
      'GET',
      `/thread/${threadID}/run/${runID}/status`
    );
    return response.data!;
  }

  /**
   * Get all messages in thread
   */
  async getThreadMessages(threadID: string): Promise<ThreadMessagesResponse> {
    const response = await this.request<ThreadMessagesResponse>(
      'GET',
      `/thread/${threadID}/messages`
    );
    return response.data!;
  }

  /**
   * Stream assistant response (note: requires custom handling for SSE)
   */
  async streamAssistantResponse(threadID: string, message: string): Promise<any> {
    // Note: Streaming requires special handling with EventSource or fetch with ReadableStream
    // This is a placeholder - actual implementation depends on your streaming strategy
    const response = await this.request<any>(
      'POST',
      `/thread/${threadID}/stream`,
      { body: { message } }
    );
    return response.data!;
  }

  /**
   * Get assistant information
   */
  async getAssistantInfo(): Promise<AssistantInfoResponse> {
    const response = await this.request<AssistantInfoResponse>(
      'GET',
      '/assistant/info'
    );
    return response.data!;
  }

  /**
   * Update assistant instructions
   */
  async updateAssistantInstructions(instructions: string): Promise<UpdateInstructionsResponse> {
    const response = await this.request<UpdateInstructionsResponse>(
      'POST',
      '/assistant/update-instructions',
      { body: { instructions } }
    );
    return response.data!;
  }

  /**
   * Complete workflow: Upload file and add to vector store
   */
  async uploadAndIndexFile(file: File | Blob, filename: string): Promise<{
    uploadResponse: FileUploadResponse;
    indexResponse: VectorStoreFileResponse;
  }> {
    const uploadResponse = await this.uploadFile(file, filename);
    const indexResponse = await this.addFileToVectorStore(uploadResponse.fileID);

    return {
      uploadResponse,
      indexResponse
    };
  }

  /**
   * Complete workflow: Create thread, send message, and run assistant
   */
  async chatWithAssistant(message: string, threadID?: string): Promise<{
    threadID: string;
    messageID: string;
    runID: string;
  }> {
    // Create thread if not provided
    let actualThreadID = threadID;
    if (!actualThreadID) {
      const threadResponse = await this.createThread();
      actualThreadID = threadResponse.threadID;
    }

    // Add message
    const messageResponse = await this.addMessageToThread(actualThreadID, message);

    // Run assistant
    const runResponse = await this.runAssistant(actualThreadID);

    return {
      threadID: actualThreadID,
      messageID: messageResponse.messageID,
      runID: runResponse.runID
    };
  }

  /**
   * Poll for run completion and return messages
   */
  async waitForRunCompletion(
    threadID: string,
    runID: string,
    maxAttempts: number = 30,
    pollInterval: number = 1000
  ): Promise<ThreadMessagesResponse> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const statusResponse = await this.getRunStatus(threadID, runID);

      if (statusResponse.status === 'completed') {
        return await this.getThreadMessages(threadID);
      }

      if (statusResponse.status === 'failed' || statusResponse.status === 'cancelled') {
        throw new Error(`Run ${statusResponse.status}: ${statusResponse.lastError?.message || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    throw new Error('Run timed out');
  }
}
