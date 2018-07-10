/* eslint-disable import/no-extraneous-dependencies, import/extensions */

import Webpack from 'webpack';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';

import APP_CONFIG from '../app/app.config.js';
import APP_PATHS from '../app/paths.config.js';

import baseWebpackConfig from './webpack.config.base.js';

export default function prodWebpackConfig(env :Object) {

  const baseConfig :Object = baseWebpackConfig(env);

  const output = Object.assign({}, baseConfig.output, {
    filename: `${APP_PATHS.REL.STATIC_JS}/app.[hash:8].js`,
    chunkFilename: `${APP_PATHS.REL.STATIC_JS}/app.chunk.[id].[chunkhash:8].js`
  });

  const plugins = [
    // https://facebook.github.io/react/docs/optimizing-performance.html#use-the-production-build
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new Webpack.optimize.OccurrenceOrderPlugin(),
    new HtmlWebpackPlugin({
      favicon: `${APP_PATHS.ABS.SOURCE_ASSETS_IMAGES}/ol_favicon.png`,
      inject: true,
      template: `${APP_PATHS.ABS.SOURCE}/${APP_CONFIG.APP_INDEX_HTML}`
    }),
    new UglifyJsPlugin(),
    ...baseConfig.plugins
  ];

  return Object.assign({}, baseConfig, {
    output,
    plugins,
    devtool: false
  });
}
