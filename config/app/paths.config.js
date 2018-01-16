/* eslint-disable import/extensions */

import path from 'path';

import APP_CONFIG from './app.config.js';

/*
 * absolute paths
 */

const ROOT = path.resolve(__dirname, '../..');

const BUILD = path.resolve(ROOT, 'build');
const NODE = path.resolve(ROOT, 'node_modules');
const SOURCE = path.resolve(ROOT, 'src');
const TEST = path.resolve(ROOT, 'test');

const APP_ENTRY = path.resolve(SOURCE, APP_CONFIG.APP_JS);
const BUILD_STATIC = path.resolve(BUILD, 'static');
const BUILD_STATIC_ASSETS = path.resolve(BUILD_STATIC, 'assets');
const BUILD_STATIC_CSS = path.resolve(BUILD_STATIC, 'css');
const BUILD_STATIC_JS = path.resolve(BUILD_STATIC, 'js');

const SOURCE_ASSETS_IMAGES = path.resolve(SOURCE, 'assets/images');

/*
 * relative paths
 */

const STATIC = 'static';
const STATIC_ASSETS = path.join(STATIC, 'assets');
const STATIC_ASSETS_IMAGES = path.join(STATIC_ASSETS, 'images');
const STATIC_CSS = path.join(STATIC, 'css');
const STATIC_JS = path.join(STATIC, 'js');

export default {
  ABS: {
    APP_ENTRY,
    BUILD,
    BUILD_STATIC,
    BUILD_STATIC_ASSETS,
    BUILD_STATIC_CSS,
    BUILD_STATIC_JS,
    NODE,
    ROOT,
    SOURCE,
    SOURCE_ASSETS_IMAGES,
    TEST
  },
  REL: {
    STATIC_ASSETS_IMAGES,
    STATIC_CSS,
    STATIC_JS
  }
};
