import { createAction, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod, HttpHeader, HttpRequest, HttpResponse } from '@activepieces/pieces-common';

import { auth } from '../..';

export const postFile = createAction({
  name: 'chat_post_file',
  displayName: 'Post File',
  description: 'Select file to send and specify channels to share it with.',
  auth,
  props: {
    channels: Property.ShortText({
      required:  true,
      displayName: 'Channels ID',
      description: 'Comma-separated list of channel names or IDs where the file will be shared.'
    }),
    file: Property.File({
      displayName: 'File',
      required: true,
    }),
    title: Property.ShortText({
      required:  false,
      displayName: 'Title',
      description: 'Title of file.'
    }),
    initial_comment: Property.LongText({
      required:  false,
      displayName: 'Text',
      description: 'The message text introducing the file in specified channels.'
    }),
    thread_ts: Property.ShortText({
      required:  false,
      displayName: 'Thread TS',
      description: 'Provide another message\'s ts value to make this message a reply. Avoid using a reply\'s ts value; use its parent instead.'
    })
  },
  async run({ propsValue, auth }) {
    const formData = new FormData();
    formData.append('file', new Blob([propsValue.file.data]));
    formData.append('channels', propsValue.channels);

    if (propsValue.initial_comment) {
      formData.append('initial_comment', propsValue.initial_comment)
    }

    if (propsValue.title) {
      formData.append('title', propsValue.title)
    }

    if (propsValue.thread_ts) {
      formData.append('thread_ts', propsValue.thread_ts)
    }

    const request: HttpRequest = {
      url: `https://slack.com/api/files.upload`,
      method: HttpMethod.POST,
      body: formData,
      headers: {
        [HttpHeader.AUTHORIZATION]: `Bearer ${auth}`,
        [HttpHeader.CONTENT_TYPE]: 'multipart/form-data',
      }
    };

    const response: HttpResponse = await httpClient.sendRequest(request);

    return {
      success: response.body,
      request_body: request.body,
      response_body: response.body,
    };
  },
});
