import {BaseClient} from "@nlc-ai/sdk-core";
import {CommunitiesClient} from "./communities.client";
import {PostsClient} from "./posts.client";
import {NLCClientConfig} from "@nlc-ai/sdk-main";

export class CommunityClient extends BaseClient{
  public communities: CommunitiesClient;
  public posts: PostsClient;

  constructor(config: NLCClientConfig) {
    super(config);

    this.communities = new CommunitiesClient({
      ...config,
      baseURL: `${config.baseURL}/communities`,
    });

    this.posts = new PostsClient({
      ...config,
      baseURL: `${config.baseURL}/posts`,
    });
  }

}
