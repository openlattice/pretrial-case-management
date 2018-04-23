/*
 * @flow
 */

import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import LatticeAuth from 'lattice-auth';
import { normalize } from 'polished';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { injectGlobal } from 'styled-components';

// import importEntitySets from '../importEntitySets';
import AppContainer from './containers/app/AppContainer';
import initializeReduxStore from './core/redux/ReduxStore';
import initializeRouterHistory from './core/router/RouterHistory';
import { globals } from './utils/styleoverrides/ReactBootstrapOverrides';
import * as Routes from './core/router/Routes';

// injected by Webpack.DefinePlugin
declare var __AUTH0_CLIENT_ID__ :string;
declare var __AUTH0_DOMAIN__ :string;
declare var __ENV_DEV__ :boolean;

const {
  AuthRoute,
  AuthUtils
} = LatticeAuth;

/* eslint-disable */
injectGlobal`${normalize()}`;

injectGlobal`
  html,
  body {
    height: 100%;
    width: 100%;
    font-family: 'Open Sans', sans-serif;
  }

  #app {
    height: 100%;
    width: 100%;
  }

  ${globals}
`;
/* eslint-enable */

/*
 * // !!! MUST HAPPEN FIRST !!!
 */

let baseUrl = 'localhost';
if (!__ENV_DEV__) {
  baseUrl = window.location.host.startsWith('staging') ? 'staging' : 'production';
}

LatticeAuth.configure({
  auth0ClientId: __AUTH0_CLIENT_ID__,
  auth0Domain: __AUTH0_DOMAIN__,
  authToken: AuthUtils.getAuthToken(),
  baseUrl
});

/*
 * // !!! MUST HAPPEN FIRST !!!
 */

const routerHistory = initializeRouterHistory();
const reduxStore = initializeReduxStore(routerHistory);

// importEntitySets();
ReactDOM.render(
  <Provider store={reduxStore}>
    <ConnectedRouter history={routerHistory}>
      <AuthRoute path={Routes.ROOT} component={AppContainer} redirectToLogin />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('app')
);
