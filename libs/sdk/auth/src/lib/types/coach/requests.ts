import {UpdateProfileRequest} from "../common";

export interface UpdateCoachProfileRequest extends UpdateProfileRequest{
  bio: string;
  website: string;
  url: string;
}
