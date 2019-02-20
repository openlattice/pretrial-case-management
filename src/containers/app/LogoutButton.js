/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';

import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AuthActions } from 'lattice-auth';

const {
  logout
} = AuthActions;

const StyledLogoutButton = styled(Button)`
  position: absolute;
  top: 30px;
  right: 60px;
`;

function mapDispatchToProps(dispatch :Function) {

  const actions = {
    logout
  };

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

type Props = {
  actions :{
    logout :() => void
  }
};

const LogoutButton = ({ actions } :Props) => (
  <StyledLogoutButton onClick={actions.logout}>Logout</StyledLogoutButton>
);

export default connect(null, mapDispatchToProps)(LogoutButton);
