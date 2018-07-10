/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { AuthActionFactory } from 'lattice-auth';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import AppConsent from '../../containers/app/AppConsent';
import HeaderNav from '../../components/nav/HeaderNav';
import Dashboard from '../../components/dashboard/Dashboard';
import Forms from '../forms/Forms';
import ContactSupport from '../../components/app/ContactSupport';
import { termsAreAccepted } from '../../utils/AcceptTermsUtils';
import * as Routes from '../../core/router/Routes';

const {
  logout
} = AuthActionFactory;

/*
 * styled components
 */

const AppWrapper = styled.div`
  background-color: #f5f5f8;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
  font-family: 'Open Sans', sans-serif;
`;

const AppBodyWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  padding: 30px 170px;
`;

/*
 * types
 */

type Props = {
  actions :{
    logout :() => void;
  };
};

const renderComponent = (Component, props) => (
  termsAreAccepted()
    ? <Component {...props} />
    : <Redirect to={Routes.TERMS} />
);

const AppContainer = (props :Props) => (
  <AppWrapper>
    <HeaderNav logout={props.actions.logout} />
    <ContactSupport />
    <AppBodyWrapper>
      <Switch>
        <Route path={Routes.TERMS} component={AppConsent} />
        <Route path={Routes.DASHBOARD} render={() => renderComponent(Dashboard)} />
        <Route path={Routes.FORMS} render={() => renderComponent(Forms)} />
        <Redirect to={Routes.DASHBOARD} />
      </Switch>
    </AppBodyWrapper>
  </AppWrapper>
);

function mapDispatchToProps(dispatch :Function) :Object {

  return {
    actions: bindActionCreators({ logout }, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(AppContainer);
