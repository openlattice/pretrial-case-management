/* eslint-disable import/extensions */

import devWebpackConfig from './webpack.config.dev.js';
import prodWebpackConfig from './webpack.config.prod.js';

import { isDev, isProd } from '../app/env.config.js';

module.exports = (env) => {

  const appWebpackConfig = {};
  const webpackEnvironment = env || {};

  if (isProd) {
    Object.assign(appWebpackConfig, prodWebpackConfig(webpackEnvironment));
  }
  else if (isDev) {
    Object.assign(appWebpackConfig, devWebpackConfig(webpackEnvironment));
  }

  return appWebpackConfig;
};
