/*
 * @flow
 */

import React from 'react';

import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AuthActionFactory } from 'lattice-auth';

const {
  logout
} = AuthActionFactory;

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

const LogoutButton = ({ actions }) => {
  return (
    <StyledLogoutButton onClick={actions.logout}>Logout</StyledLogoutButton>
  );
};

LogoutButton.propTypes = {
  actions: PropTypes.shape({
    logout: PropTypes.func.isRequired
  }).isRequired
};

export default connect(null, mapDispatchToProps)(LogoutButton);
