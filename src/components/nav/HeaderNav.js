/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Link, NavLink } from 'react-router-dom';
import { AuthUtils } from 'lattice-auth';

import BasicButton from '../buttons/BasicButton';
import logo from '../../assets/images/logo.jpg';
import createReport from '../../assets/svg/create-report.svg';
import createReportSelected from '../../assets/svg/create-report-selected.svg';
import dashboard from '../../assets/svg/dashboard.svg';
import dashboardSelected from '../../assets/svg/dashboard-selected.svg';
import downloads from '../../assets/svg/downloads.svg';
import downloadsSelected from '../../assets/svg/downloads-selected.svg';
import judges from '../../assets/svg/judges.svg';
import judgesSelected from '../../assets/svg/judges-selected.svg';
import managePeople from '../../assets/svg/manage-people.svg';
import managePeopleSelected from '../../assets/svg/manage-people-selected.svg';
import newPerson from '../../assets/svg/new-person.svg';
import newPersonSelected from '../../assets/svg/new-person-selected.svg';
import reviewReports from '../../assets/svg/review-reports.svg';
import reviewReportsSelected from '../../assets/svg/review-reports-selected.svg';
import { OL } from '../../utils/consts/Colors';

import * as Routes from '../../core/router/Routes';

const AppHeaderWrapper = styled.header`
  align-items: center;
  justify-content: space-between;
  padding: 13px 170px;
  background-color: ${OL.GREY16};
  border-bottom: 1px solid ${OL.GREY29};
  display: flex;
  flex-direction: row;
  position: relative;
`;

const AppHeaderSubWrapper = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  align-self: flex-start;
  justify-content: space-between;
`

const BrandLink = styled(Link)`
  color: inherit;

  span {
    font-family: Chivo;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: ${OL.GREY15};
    margin-left: 10px;
  }

  &:hover {
    color: inherit;
    text-decoration: none;
  }

  &:focus {
    color: inherit;
    text-decoration: none;
  }
`;

const DisplayName = styled.span`
  margin-right: 10px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  color: ${OL.GREY15};
`;

const Logo = styled.img`
  display: inline-block;
  max-height: 29px;
`;

const StyledNavWrapper = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  align-self: flex-start;
  justify-content: space-between;
`;

const StyledNavLink = styled(NavLink).attrs({
  activeStyle: {
    color: OL.PURPLE02,
    borderBottom: `3px solid ${OL.PURPLE02}`
  }
})`
  width: auto;
  height: auto;
  padding-bottom: 10px;
  margin-bottom: -13px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: normal;
  color: ${OL.GREY02};
  display: flex;
  align-items: center;


  &:hover {
    color: ${OL.PURPLE02};
    text-decoration: none;

    svg {
      g {
        fill: ${OL.PURPLE02};
      }
    }
  }

  &:active {
    color: ${OL.PURPLE01};

    svg {
      g {
        fill: ${OL.PURPLE01};
      }
    }
  }

  &:focus {
    outline: none;
    text-decoration: none;
    svg {
      g {
        fill: ${OL.PURPLE02};
      }
    }

  }
`;

const StyledIcon = styled.div`
  margin-right: 10px;
  height: 16px;
  width: 16px;
  display: inline-block;
`;

const LogoutButton = styled(BasicButton)`
  width: 108px;
  height: 29px;
  font-size: 11px;
  padding: 0;
`;

const NavButton = ({
  path,
  defaultIcon,
  selectedIcon,
  label
}) => {
  const url = window.location.hash.includes(path) ? selectedIcon : defaultIcon;
  const ButtonWrapper = styled(StyledNavLink).attrs({
    to: path,
    name: path
  })`
    div {
      background: url("${url}");
    }
    &:hover {
      div {
        background: url("${selectedIcon}");
      }
    }
  `;

  return (
    <ButtonWrapper to={path} name={path}>
      <StyledIcon />
      <span>{label}</span>
    </ButtonWrapper>
  );
};

type Props = {
  logout :() => void
}

const getDisplayName = () => {
  const userInfo = AuthUtils.getUserInfo();
  return (userInfo.email && userInfo.email.length > 0) ? userInfo.email : '';
};

const HeaderNav = ({ logout } :Props) => (
  <div>
    <AppHeaderWrapper>
      <AppHeaderSubWrapper>
        <BrandLink to={Routes.DASHBOARD}>
          <Logo src={logo} role="presentation" />
          <span>Pretrial Case Management</span>
        </BrandLink>
        <div>
          <DisplayName>{getDisplayName()}</DisplayName>
          <LogoutButton onClick={logout}>Log Out</LogoutButton>
        </div>
      </AppHeaderSubWrapper>
    </AppHeaderWrapper>
    <AppHeaderWrapper>
      <StyledNavWrapper>
        <NavButton
            path={Routes.PEOPLE}
            defaultIcon={managePeople}
            selectedIcon={managePeopleSelected}
            label="Manage People" />
        <NavButton
            path={Routes.CREATE_FORMS}
            defaultIcon={createReport}
            selectedIcon={createReportSelected}
            label="Create Report" />
        <NavButton
            path={Routes.REVIEW_FORMS}
            defaultIcon={reviewReports}
            selectedIcon={reviewReportsSelected}
            label="Review Reports" />
        <NavButton
            path={Routes.NEW_PERSON}
            defaultIcon={newPerson}
            selectedIcon={newPersonSelected}
            label="New Person" />
        <NavButton
            path={Routes.JUDGE_VIEW}
            defaultIcon={judges}
            selectedIcon={judgesSelected}
            label="Judges" />
        <NavButton
            path={Routes.DOWNLOAD_FORMS}
            defaultIcon={downloads}
            selectedIcon={downloadsSelected}
            label="Downloads" />
        <NavButton
            path={Routes.VISUALIZE_DASHBOARD}
            defaultIcon={dashboard}
            selectedIcon={dashboardSelected}
            label="Dashboard" />
      </StyledNavWrapper>
    </AppHeaderWrapper>
  </div>
);

export default HeaderNav;
