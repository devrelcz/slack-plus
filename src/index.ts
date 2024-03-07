import { createPiece, PieceAuth } from '@activepieces/pieces-framework';

import { postMessage } from './lib/actions/post-message';
import { postFile } from './lib/actions/post-file';
import { updateHomepage } from './lib/actions/update-homepage';
import { PieceCategory } from '@activepieces/shared';
import { createCustomApiCallAction } from '@activepieces/pieces-common';

export const auth = PieceAuth.SecretText({
  displayName: 'OAuth Token',
  required: true,
  description: 'Use app/bot/user OAtuh token to authenticate with Slack.',
});

export const slackPostMessage = createPiece({
  displayName: 'Slack Plus',
  description: 'Provides advanced utils to work with Slack with a specified token, like a bot.',
  auth,
  minimumSupportedRelease: '0.20.0',
  logoUrl: 'https://raw.githubusercontent.com/devrelcz/slack-plus/master/src/images/slack-plus-logo.png',
  categories: [PieceCategory.COMMUNICATION],
  authors: [
    '@devrelcz'
  ],
  actions: [
    postMessage,
    postFile,
    updateHomepage,
    createCustomApiCallAction({
      baseUrl: () => {
        return 'https://slack.com/api';
      },
      auth,
      authMapping: (auth) => {
        return {
          Authorization: `Bearer ${(auth as string)}`,
        };
      },
    }),
  ],
  triggers: [],
});
