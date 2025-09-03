import {CourseStructureClient} from "./course-structure.client";
import {NLCClientConfig} from "@nlc-ai/sdk-main";

export class AgentsClient {
  public courseStructure: CourseStructureClient;

  constructor(props: NLCClientConfig) {
    this.courseStructure = new CourseStructureClient({
      ...props,
      baseURL: `${props.baseURL}/course-structure`,
    });
  }
}
