/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Link } from 'react-router-dom';
import { AuthUtils } from 'lattice-auth';
import { Button, Select } from 'lattice-ui-kit';

import logo from '../../assets/images/logo.jpg';
import createReport from '../../assets/svg/create-report.svg';
import createReportSelected from '../../assets/svg/create-report-selected.svg';
import downloads from '../../assets/svg/downloads.svg';
import downloadsSelected from '../../assets/svg/downloads-selected.svg';
import NavButton from './NavButton';
import judges from '../../assets/svg/judges.svg';
import judgesSelected from '../../assets/svg/judges-selected.svg';
import managePeople from '../../assets/svg/manage-people.svg';
import managePeopleSelected from '../../assets/svg/manage-people-selected.svg';
import manageCharges from '../../assets/svg/manage-charges.svg';
import manageChargesSelected from '../../assets/svg/manage-charges-selected.svg';
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
`;

const OrgDropDown = styled.div`
  width: 100%;
  margin-right: 10px;
`;

const BrandLink = styled(Link)`
  color: inherit;

  span {
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

const Controls = styled.div`
  width: 50%;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

  renderOrgSelector = () => {
    const {
      organizations,
      selectedOrg,
      switchOrg,
      loading
    } = this.props;

    return (
      <Select
          value={organizations.find((option) => option.value === selectedOrg)}
          isClearable={false}
          isLoading={loading}
          isMulti={false}
          onChange={switchOrg}
          options={organizations.toJS()}
          placeholder="Select..." />
    );
  }

  render() {
    const { logout, pretrialModule } = this.props;
    return (
      <div>
        <AppHeaderWrapper>
          <AppHeaderSubWrapper>
            <BrandLink to={Routes.DASHBOARD}>
              <Logo src={logo} role="presentation" />
              <span>Pretrial Case Management</span>
            </BrandLink>
            <Controls>
              <DisplayName>{this.getDisplayName()}</DisplayName>
              <OrgDropDown>{ this.renderOrgSelector() }</OrgDropDown>
              <Button onClick={logout}>Log Out</Button>
            </Controls>
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
                path={Routes.MANAGE_CHARGES}
                defaultIcon={manageCharges}
                selectedIcon={manageChargesSelected}
                label="Manage Charges" />
            <NavButton
                path={Routes.DOWNLOAD_FORMS}
                defaultIcon={downloads}
                selectedIcon={downloadsSelected}
                label="Downloads" />
            {
              pretrialModule
                ? (
                  <NavButton
                      path={Routes.JUDGE_VIEW}
                      defaultIcon={judges}
                      selectedIcon={judgesSelected}
                      label="Judges" />
                )
                : null
            }
          </StyledNavWrapper>
        </AppHeaderWrapper>
      </div>
    );
  }
}

export default HeaderNav;
