import moment from 'moment';
import PACKAGE from '../../package.json';

const BANNER = `
${PACKAGE.name} - v${PACKAGE.version}
${PACKAGE.description}
${PACKAGE.homepage}

Copyright (c) 2017-${moment().year()}, OpenLattice, Inc. All rights reserved.
`;

const APP_INDEX_HTML = 'index.html';
const APP_JS = 'index.js';
const APP_CSS = 'index.css';

export default {
  BANNER,
  APP_INDEX_HTML,
  APP_JS,
  APP_CSS
};
