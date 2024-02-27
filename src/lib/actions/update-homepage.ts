import { createAction, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod, HttpHeader } from '@activepieces/pieces-common';

import { auth } from '../..';

import { user } from '../../utils/props';

export const updateHomepage = createAction({
  name: 'update_homepage',
  displayName: 'Update Homepage',
  description: '',
  auth,
  props: {
    user,
    user_id: Property.ShortText({
      required:  false,
      displayName: 'or enter user ID',
      description: 'You can also set user ID manually if you want to.'
    }),
    blocks: Property.Json({
      displayName: 'Blocks',
      description: 'A JSON-based array of structured blocks that displays as homepage of your app.',
      required: false,
      defaultValue: []
    })
  },
  async run({ propsValue, auth }) {
    const body: any = {
      user_id: propsValue.user || propsValue.user_id,
      view: {
        type: 'home',
        blocks: propsValue.blocks
      }
    };

    const request = {
      method: HttpMethod.POST,
      url: 'https://slack.com/api/views.publish',
      headers: {
        [HttpHeader.AUTHORIZATION]: `Bearer ${auth}`,
        [HttpHeader.CONTENT_TYPE]: 'application/json;charset=utf-8',
      },
      body,
    }

    const response = await httpClient.sendRequest<string[]>(request);

    return {
      success: response.body,
      request_body: request.body,
      response_body: response.body,
    };
  },
});
