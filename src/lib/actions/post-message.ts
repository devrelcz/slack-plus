import { createAction, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod, HttpHeader, HttpRequest, AuthenticationType } from '@activepieces/pieces-common';

import { auth } from '../..';

export const channel = Property.Dropdown({
  displayName: 'Channel',
  description: 'Channel, private group, or IM channel to send message to.',
  required: true,
  refreshers: [],
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
      url: `https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=1000`,
      authentication: {
        type: AuthenticationType.BEARER_TOKEN,
        token: authentication
      },
    };

    const response = await httpClient.sendRequest<{
      ok: boolean;
      channels: { id: string; name: string }[];
    }>(request);

    if (!response.body.ok) {
      return {
        disabled: true,
        placeholder: 'There are no channels.',
        options: [],
      };
    }

    return {
      disabled: false,
      placeholder: 'Select channel',
      options: response.body.channels.map((ch) => {
        return {
          label: ch.name,
          value: ch.id,
        };
      }),
    };
  },
});

export const postMessage = createAction({
  name: 'chat_post_message',
  displayName: 'Post Message',
  description: '',
  auth,
  props: {
    // channel: Property.ShortText({
    //   required:  true,
    //   displayName: 'Channel',
    //   description: 'Channel, private group, or IM channel to send message to.'
    // }),
    channel,
    username: Property.ShortText({
      required:  false,
      displayName: 'Username',
      description: 'Set your bot\'s user name.'
    }),
    icon_url: Property.ShortText({
      required:  false,
      displayName: 'Icon URL',
      description: 'URL to an image to use as the icon for this message.'
    }),
    icon_emoji: Property.ShortText({
      required:  false,
      displayName: 'Icon emoji',
      description: 'Emoji to use as the icon for this message. Overrides icon_url.'
    }),
    text: Property.LongText({
      required:  false,
      displayName: 'Text',
      description: 'Text to send as message. Or you can use "blocks" param to get more powerful message. Note: "Text" overrides "blocks".'
    }),
    blocks: Property.Json({
      displayName: 'Blocks',
      description: 'A JSON-based array of structured blocks, presented as a URL-encoded string.',
      required: false,
      defaultValue: []
    }),
    thread_ts: Property.ShortText({
      required:  false,
      displayName: 'Thread TS',
      description: 'Provide another message\'s ts value to make this message a reply. Avoid using a reply\'s ts value; use its parent instead.'
    }),
  },
  async run({ propsValue, auth }) {
    const body: any = {
      channel: propsValue.channel,
      text: propsValue.text
    };

    if (propsValue.username) body.username = propsValue.username;
    if (propsValue.icon_url) body.icon_url = propsValue.icon_url;
    if (propsValue.icon_emoji) body.icon_emoji = propsValue.icon_emoji;
    if (propsValue.thread_ts) body.thread_ts = propsValue.thread_ts;
    if (propsValue.blocks) body.blocks = propsValue.blocks;

    if (body.text) {
      delete body.blocks
    }

    const request = {
      method: HttpMethod.POST,
      url: 'https://slack.com/api/chat.postMessage',
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
