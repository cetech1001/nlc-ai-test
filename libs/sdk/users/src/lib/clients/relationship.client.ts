import {BaseClient} from "@nlc-ai/sdk-core";

export class RelationshipClient extends BaseClient{
  async connectClientToCoach(clientID: string, coachID: string, notes?: string) {
    const response = await this.request('POST', '/relationships', {
      body: { clientID, coachID, notes }
    });
    return response.data!;
  }

  async inviteClient(email: string, coachID?: string, message?: string) {
    const response = await this.request('POST', '/invites', {
      body: { email, coachID, message }
    });
    return response.data!;
  }
}
