/*
 * @flow
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

import CourtContainer from '../../containers/court/CourtContainer';
import FormsContainer from '../../containers/forms/FormsContainer';
import ManageChargesContainer from '../../containers/charges/ChargesContainer';
import NewPersonContainer from '../../containers/person/NewPersonContainer';
import PeopleContainer from '../../containers/people/PeopleContainer';
import ManageHearingsContainer from '../../containers/hearings/ManageHearingsContainer';
import PersonDetailsContainer from '../../containers/people/PersonDetailsContainer';
import DownloadPSA from '../../containers/download/DownloadPSA';
import ReviewPSA from '../../containers/review/ReviewPSA';
import EnrollVoice from '../../containers/enroll/EnrollVoice';
import StaffDashboardContainer from '../../containers/dashboard/StaffDashboardContainer';
import * as Routes from '../../core/router/Routes';

const DashboardWrapper = styled.div`
  width: 960px;
  display: flex;
  flex: 1 1 auto;
`;

const StyledMainWrapper = styled.div`
  height: auto;
  width: 100%;
`;

const Dashboard = () => (
  <DashboardWrapper>
    <StyledMainWrapper>
      <Switch>
        <Route path={Routes.CREATE_FORMS} component={FormsContainer} />
        <Route path={Routes.NEW_PERSON} component={NewPersonContainer} />
        <Route path={Routes.MANAGE_CHARGES} component={ManageChargesContainer} />
        <Route path={Routes.PEOPLE} component={PeopleContainer} />
        <Route path={Routes.PERSON_DETAILS} component={PersonDetailsContainer} />
        <Route path={Routes.DOWNLOAD_FORMS} component={DownloadPSA} />
        <Route path={Routes.JUDGE_VIEW} component={CourtContainer} />
        <Route path={Routes.REVIEW_FORMS} component={ReviewPSA} />
        <Route path={Routes.VOICE_ENROLLMENT} component={EnrollVoice} />
        <Route path={Routes.STAFF_DASHBOARD} component={StaffDashboardContainer} />
        <Redirect from={Routes.DASHBOARD} to={Routes.CREATE_FORMS} />
      </Switch>
    </StyledMainWrapper>
  </DashboardWrapper>
);

export default Dashboard;
