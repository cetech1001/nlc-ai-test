import {CoursesClient} from "./courses.client";
import {NLCClientConfig} from "@nlc-ai/sdk-main";

export class CourseClient {
  public courses: CoursesClient;

  constructor(props: NLCClientConfig) {
    this.courses = new CoursesClient({
      ...props,
      baseURL: `${props.baseURL}/courses`,
    });
  }

}
