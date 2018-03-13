import Webpack from 'webpack';

import APP_PATHS from '../app/paths.config';
import PACKAGE from '../../package.json';

import {
  isDev,
  isProd
} from '../app/env.config';

import {
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID
} from '../auth/auth0.config';

const BABEL_LOADER = {
  test: /\.js$/,
  exclude: /node_modules/,
  include: [
    APP_PATHS.ABS.SOURCE,
    APP_PATHS.ABS.TEST
  ],
  use: ['babel-loader']
};

export const JSON_LOADER = {
  test: /\.json$/,
  exclude: /node_modules/,
  use: ['json-loader']
};

export const DEFINE_PLUGIN = new Webpack.DefinePlugin({
  __DEV__: JSON.stringify(isDev),
  __PROD__: JSON.stringify(isProd),
  __VERSION__: JSON.stringify(`v${PACKAGE.version}`),
  __AUTH0_CLIENT_ID__: JSON.stringify(AUTH0_CLIENT_ID),
  __AUTH0_DOMAIN__: JSON.stringify(AUTH0_DOMAIN)
});

export default {
  module: {
    rules: [
      BABEL_LOADER,
      JSON_LOADER
    ]
  },
  plugins: [
    DEFINE_PLUGIN
  ],
  // devtool: 'inline-source-map',
  devtool: false,
  externals: {
    'react/addons': true,
    'react/lib/ExecutionEnvironment': true,
    'react/lib/ReactContext': true
  }
};
