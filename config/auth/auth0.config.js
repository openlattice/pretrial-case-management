/* eslint-disable import/extensions */

import { isProd } from '../app/env.config.js';

export const AUTH0_CLIENT_ID =
  isProd
    ? 'o8Y2U2zb5Iwo01jdxMN1W2aiN8PxwVjh'
    : 'KTzgyxs6KBcJHB872eSMe2cpTHzhxS99';

export const AUTH0_DOMAIN = 'openlattice.auth0.com';
