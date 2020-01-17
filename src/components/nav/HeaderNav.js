/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { NavLink } from 'react-router-dom';
import { AuthUtils } from 'lattice-auth';
import { AppHeaderWrapper, AppNavigationWrapper } from 'lattice-ui-kit';

import logo from '../../assets/images/logo.jpg';

import * as Routes from '../../core/router/Routes';

const AppHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const StyledAppHeaderWrapper = styled(AppHeaderWrapper)`
  width: 100%;
  padding: 0 Calc((100vw - 960px)/2);
`;

const StyledAppNavigationWrapper = styled(AppNavigationWrapper)`
  width: 100%;
  padding: 0 Calc((100vw - 960px)/2);
`;

type Props = {
  loading :boolean,
  organizations :Map<*, *>,
  selectedOrg :string,
  pretrialModule :boolean,
  logout :() => void,
  switchOrg :(orgId :string) => Object
}

class HeaderNav extends React.Component<Props, *> {

  getDisplayName = () => {
    const userInfo = AuthUtils.getUserInfo();
    return (userInfo.email && userInfo.email.length > 0) ? userInfo.email : '';
  };

  getOrgSelector = () => {
    const {
      organizations,
      selectedOrg,
      switchOrg,
      loading
    } = this.props;
    return {
      onChange: switchOrg,
      organizations,
      selectedOrganizationId: selectedOrg,
      loading,
      isLoading: loading,
    };
  }

  render() {
    const { logout, pretrialModule } = this.props;
    const userIsAdmin = AuthUtils.isAdmin();
    return (
      <div>
        <AppHeader>
          <StyledAppHeaderWrapper
              appIcon={logo}
              appTitle="Pretrial Case Management"
              logout={logout}
              organizationsSelect={this.getOrgSelector()}
              user={this.getDisplayName()} />
          <StyledAppNavigationWrapper>
            <NavLink to={Routes.PEOPLE}>Manage People</NavLink>
            <NavLink to={Routes.CREATE_FORMS}>Create Report</NavLink>
            <NavLink to={Routes.REVIEW_FORMS}>Review Reports</NavLink>
            <NavLink to={Routes.DOWNLOAD_FORMS}>Downloads</NavLink>
            {
              pretrialModule
                ? (
                  <NavLink to={Routes.JUDGE_VIEW}>Judges</NavLink>
                )
                : null
            }
            {
              userIsAdmin
                ? (
                  <NavLink to={Routes.SETTINGS}>Settings</NavLink>
                )
                : null
            }
          </StyledAppNavigationWrapper>
        </AppHeader>
      </div>
    );
  }
}

export default HeaderNav;
