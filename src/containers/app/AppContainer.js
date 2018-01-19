/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { AuthActionFactory } from 'lattice-auth';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect, Route, Switch, Link } from 'react-router-dom';

import Dashboard from '../../components/dashboard/Dashboard';
import Forms from '../forms/Forms';
import StyledButton from '../../components/buttons/StyledButton';
import logo from '../../assets/images/logo.png';
import * as Routes from '../../core/router/Routes';

const {
  logout
} = AuthActionFactory;

/*
 * styled components
 */

const AppWrapper = styled.div`
  background-color: #f7f8f9;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  width: 100%;
`;

const AppHeaderWrapper = styled.header`
  align-items: center;
  background-color: #fefefe;
  border-bottom: 1px solid rgba(84, 110, 122, 0.2);
  display: flex;
  flex-direction: row;
  min-height: 77px;
  padding: 20px 55px;
  position: relative;
`;

const AppTitle = styled.div`
  font-size: 24px;
`;

const AppBodyWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
`;

const StyledLogoutButton = StyledButton.extend`
  position: absolute;
  right: 50px;
`;

const BrandLink = styled(Link)`
  color: inherit;

  &:hover {
    color: inherit;
    text-decoration: none;
  }

  &:focus {
    color: inherit;
    text-decoration: none;
  }
`;

const Logo = styled.img`
  display: inline-block;
  max-height: 45px;
  margin: -10px 5px -10px 0;
`;

/*
 * types
 */

type Props = {
  actions :{
    logout :() => void;
  };
};

const AppContainer = (props :Props) => (
  <AppWrapper>
    <AppHeaderWrapper>
      <AppTitle>
        <BrandLink to={Routes.DASHBOARD}>
          <Logo src={logo} role="presentation" />
          Pre-Trial Case Management
        </BrandLink>
      </AppTitle>
      <StyledLogoutButton onClick={props.actions.logout}>Logout</StyledLogoutButton>
    </AppHeaderWrapper>
    <AppBodyWrapper>
      <Switch>
        <Route path={Routes.DASHBOARD} component={Dashboard} />
        <Route path={Routes.FORMS} component={Forms} />
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
