import { BaseClient } from "@nlc-ai/sdk-core";
import { NLCClientConfig } from "@nlc-ai/sdk-main";
import { CategoriesClient } from "./categories.client";
import { ContentPiecesClient } from "./content-pieces.client";

export class ContentClient extends BaseClient {
  public categories: CategoriesClient;
  public contentPieces: ContentPiecesClient;

  constructor(config: NLCClientConfig) {
    super(config);

    this.categories = new CategoriesClient({
      ...config,
      baseURL: `${config.baseURL}/categories`,
    });

    this.contentPieces = new ContentPiecesClient({
      ...config,
      baseURL: `${config.baseURL}/pieces`,
    });
  }
}
