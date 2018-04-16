/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

import * as Routes from '../../core/router/Routes';
import UserInfoBlock from './UserInfoBlock';

const StyledNavWrapper = styled.div`
  background: white;
  display: flex;
  flex-direction: column;
  height: auto;
  padding: 60px 30px 30px 30px;
  width: 220px;
`;

const StyledLinksWrapper = styled.div`
  display: flex;
  flex-direction: column;
  overflow: auto;
  width: 140px;

  &:last-child {
    border-bottom: 1px solid rgba(84,110,122,0.2);
  }
`;

const StyledNavLink = styled(NavLink).attrs({
  activeStyle: {
    fontWeight: 'bold',
    color: '#5bc0de'
  }
})`
  border-top: 1px solid rgba(84,110,122,0.2);
  color: inherit;
  font-size: 18px;
  font-weight: medium;
  outline: none;
  padding: 12px 0;
  text-align: center;

  &:hover {
    color: #5bc0de;
    text-decoration: none;
  }

  &:focus {
    outline: none;
    text-decoration: none;
  }
`;

const DashboardNav = () => (
  <StyledNavWrapper>
    <UserInfoBlock />
    <StyledLinksWrapper>
      <StyledNavLink
          to={Routes.CREATE_FORMS}
          name={Routes.CREATE_FORMS}>
        Create Report
      </StyledNavLink>
      <StyledNavLink
          to={Routes.REVIEW_FORMS}
          name={Routes.REVIEW_FORMS}>
        Review Report
      </StyledNavLink>
      <StyledNavLink
          to={Routes.DOWNLOAD_FORMS}
          name={Routes.DOWNLOAD_FORMS}>
        Downloads
      </StyledNavLink>
      <StyledNavLink
          to={Routes.NEW_PERSON}
          name={Routes.NEW_PERSON}>
        New Person
      </StyledNavLink>
    </StyledLinksWrapper>
  </StyledNavWrapper>
);

export default DashboardNav;
