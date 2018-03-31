/* eslint-disable no-underscore-dangle, import/no-extraneous-dependencies, import/extensions */

import Webpack from 'webpack';

import PACKAGE from '../../package.json';

import APP_CONFIG from '../app/app.config.js';
import APP_PATHS from '../app/paths.config.js';

import { ifDev, ifProd, isDev, isProd, isTest } from '../app/env.config.js';
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '../auth/auth0.config.js';

export default function baseWebpackConfig(env) {

  /*
   * constants
   */

  const BASE_PATH = `/${env.basePath || 'psa'}/`;

  /*
   * loaders
   */

  const BABEL_LOADER = {
    test: /\.js$/,
    exclude: /node_modules/,
    include: [
      APP_PATHS.ABS.SOURCE,
      APP_PATHS.ABS.TEST
    ],
    use: ['babel-loader']
  };

  const FILE_LOADER_ASSETS_IMAGES = {
    test: /\.(gif|ico|jpg|jpeg|png|svg|webp)(\?.*)?$/,
    exclude: /node_modules/,
    use: [{
      loader: 'file-loader',
      options: {
        name: `${APP_PATHS.REL.STATIC_ASSETS_IMAGES}/[name].[hash:8].[ext]`
      }
    }]
  };

  /*
   * plugins
   */

  const BANNER_PLUGIN = new Webpack.BannerPlugin({
    banner: APP_CONFIG.BANNER,
    entryOnly: true
  });

  const DEFINE_PLUGIN = new Webpack.DefinePlugin({
    __AUTH0_CLIENT_ID__: JSON.stringify(AUTH0_CLIENT_ID),
    __AUTH0_DOMAIN__: JSON.stringify(AUTH0_DOMAIN),
    __BASE_PATH__: JSON.stringify(BASE_PATH),
    __ENV_DEV__: JSON.stringify(isDev),
    __ENV_PROD__: JSON.stringify(isProd),
    __ENV_TEST__: JSON.stringify(isTest),
    __PACKAGE__: JSON.stringify(PACKAGE.name),
    __VERSION__: JSON.stringify(`v${PACKAGE.version}`)
  });

  /*
   * base webpack config
   */

  return {
    bail: true,
    entry: [
      APP_PATHS.ABS.APP_ENTRY
    ],
    mode: ifDev('development', 'production'),
    module: {
      rules: [
        BABEL_LOADER,
        FILE_LOADER_ASSETS_IMAGES
      ]
    },
    node: {
      net: 'empty'
    },
    optimization: {
      minimize: ifProd(true, false)
    },
    output: {
      path: APP_PATHS.ABS.BUILD,
      publicPath: BASE_PATH
    },
    performance: {
      hints: false // disable performance hints for now
    },
    plugins: [
      DEFINE_PLUGIN,
      BANNER_PLUGIN
    ],
    resolve: {
      extensions: ['.js', '.css'],
      modules: [
        APP_PATHS.ABS.SOURCE,
        APP_PATHS.ABS.NODE
      ]
    }
  };
}
