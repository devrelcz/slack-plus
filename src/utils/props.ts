import { AuthenticationType, HttpMethod, HttpRequest, httpClient } from "@activepieces/pieces-common";
import { Property } from "@activepieces/pieces-framework";

export const user = Property.Dropdown({
  displayName: 'Users',
  description: 'Select the user.',
  required: false,
  refreshers: [],
  required: false,
  async options({ auth }) {
    if (!auth) {
      return {
        disabled: true,
        placeholder: 'connect slack account',
        options: [],
      };
    }

    const authentication = auth as string;
    const request: HttpRequest = {
      method: HttpMethod.GET,
      url: `https://slack.com/api/users.list?limit=1000`, // limti set to 1000 due to performance reasons
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: authentication
      },
    };

    type Member = { id: string; real_name: string, is_bot: boolean, is_app_user: boolean, deleted: boolean, is_email_confirmed: boolean }

    const response = await httpClient.sendRequest<{
      ok: boolean;
      members: Member[];
    }>(request);

    if (!response.body.ok) {
      return {
        disabled: true,
        placeholder: 'There are no users to select.',
        options: [],
      };
    }

    response.body.members = response.body.members.filter(u => {
      return u.is_email_confirmed === true
    })

    return {
      disabled: false,
      placeholder: 'Select users',
      options: response.body.members.map((u) => {
        return {
          label: u.real_name,
          value: u.id,
        };
      }),
    };
  },
});
