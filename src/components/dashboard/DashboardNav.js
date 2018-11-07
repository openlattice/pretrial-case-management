/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

import UserInfoBlock from './UserInfoBlock';
import { OL } from '../../utils/consts/Colors';

import * as Routes from '../../core/router/Routes';

const DashboardNavWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: white;
`;

const StyledNavWrapper = styled.div`
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

const linkStyle = `
  border-top: 1px solid rgba(84,110,122,0.2);
  color: inherit;
  font-size: 18px;
  font-weight: medium;
  outline: none;
  padding: 12px 0;
  text-align: center;

  &:hover {
    color: ${OL.BLUE09};
    text-decoration: none;
  }

  &:focus {
    outline: none;
    text-decoration: none;
  }
`;

const StyledNavLink = styled(NavLink).attrs({
  activeStyle: {
    fontWeight: 'bold',
    color: OL.BLUE09
  }
})`${linkStyle}`;

const StyledLink = styled.a`${linkStyle}`;

const DashboardNav = () => (
  <DashboardNavWrapper>
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
        <StyledNavLink
            to={Routes.PEOPLE}
            name={Routes.PEOPLE}>
          Manage People
        </StyledNavLink>
        <StyledNavLink
            to={Routes.JUDGE_VIEW}
            name={Routes.JUDGE_VIEW}>
          Judges
        </StyledNavLink>
        <StyledNavLink
            to={Routes.VISUALIZE_DASHBOARD}
            name={Routes.VISUALIZE_DASHBOARD}>
          Dashboard
        </StyledNavLink>
      </StyledLinksWrapper>
    </StyledNavWrapper>
    <StyledNavWrapper>
      <StyledLink href="https://support.openlattice.com/servicedesk/customer/portal/1">Contact Support</StyledLink>
    </StyledNavWrapper>
  </DashboardNavWrapper>
);

export default DashboardNav;
