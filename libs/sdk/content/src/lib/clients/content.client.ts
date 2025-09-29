import {ServiceClientConfig} from "@nlc-ai/sdk-core";
import { CategoriesClient } from "./categories.client";
import { ContentPiecesClient } from "./content-pieces.client";

export class ContentClient {
  public categories: CategoriesClient;
  public contentPieces: ContentPiecesClient;

  constructor(config: ServiceClientConfig) {
    this.categories = new CategoriesClient({
      ...config,
      baseURL: `${config.baseURL}/categories`,
    });

    this.contentPieces = new ContentPiecesClient({
      ...config,
      baseURL: `${config.baseURL}/pieces`,
    });
  }

  updateApiKey(apiKey: string | null) {
    const services = [
      this.categories, this.contentPieces
    ];

    services.forEach(service => {
      service.updateApiKey(apiKey);
    });
  }
}
