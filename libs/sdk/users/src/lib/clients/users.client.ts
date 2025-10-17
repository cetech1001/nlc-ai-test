import {CoachesClient} from "./coaches.client";
import {ServiceClientConfig} from "@nlc-ai/sdk-core";
import {ClientsClient} from "./clients.client";
import { ProfilesClient } from "./profiles.client";
import {OnboardingClient} from "./onboarding.client";
import {ChatbotCustomizationClient} from "./chatbot-customization.client";

export class UsersClient{
  public coaches: CoachesClient;
  public clients: ClientsClient;
  public profiles: ProfilesClient;
  public onboarding: OnboardingClient;
  public chatbotCustomization: ChatbotCustomizationClient;

  constructor(config: ServiceClientConfig) {
    this.coaches = new CoachesClient({
      ...config,
      baseURL: `${config.baseURL}/coaches`,
    });

    this.clients = new ClientsClient({
      ...config,
      baseURL: `${config.baseURL}/clients`,
    });

    this.profiles = new ProfilesClient({
      ...config,
      baseURL: `${config.baseURL}/profiles`,
    });

    this.onboarding = new OnboardingClient({
      ...config,
      baseURL: `${config.baseURL}/onboarding`,
    });

    this.chatbotCustomization = new ChatbotCustomizationClient({
      ...config,
      baseURL: `${config.baseURL}/chatbot-customization`,
    });
  }

  updateApiKey(apiKey: string | null) {
    const services = [
      this.coaches, this.clients, this.profiles,
      this.onboarding, this.chatbotCustomization
    ];

    services.forEach(service => {
      service.updateApiKey(apiKey);
    });
  }
}

export { ChatbotCustomizationClient } from './chatbot-customization.client';
