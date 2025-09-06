import { ClientEmailClient } from "./client-email.client";
import {CourseStructureClient} from "./course-structure.client";
import {NLCClientConfig} from "@nlc-ai/sdk-main";

export class AgentsClient {
  public courseStructure: CourseStructureClient;
  public clientEmail: ClientEmailClient;

  constructor(props: NLCClientConfig) {
    this.courseStructure = new CourseStructureClient({
      ...props,
      baseURL: `${props.baseURL}/course-structure`,
    });

    this.clientEmail = new ClientEmailClient({
      ...props,
      baseURL: `${props.baseURL}/client-email`,
    });
  }
}
