export class IntegrationError extends Error {
  constructor(
    message: string,
    public platform: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}
