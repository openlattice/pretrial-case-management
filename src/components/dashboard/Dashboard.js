/*
 * @flow
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

import DashboardNav from './DashboardNav';
import DashboardContainer from '../../containers/dashboard/DashboardContainer';
import FormsContainer from '../../containers/forms/FormsContainer';
import NewPersonContainer from '../../containers/person/NewPersonContainer';
import PeopleContainer from '../../containers/people/PeopleContainer';
import PersonDetailsContainer from '../../containers/people/PersonDetailsContainer';
import DownloadPSA from '../../containers/download/DownloadPSA';
import ReviewPSA from '../../containers/review/ReviewPSA';
import JudgeContainer from '../../containers/judge/JudgeContainer';
import EnrollVoice from '../../containers/enroll/EnrollVoice';
import * as Routes from '../../core/router/Routes';

const DashboardWrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
`;

const StyledMainWrapper = styled.div`
  height: auto;
  width: 100%;
`;

const Dashboard = () => (
  <DashboardWrapper>
    <DashboardNav />
    <StyledMainWrapper>
      <Switch>
        <Route path={Routes.CREATE_FORMS} component={FormsContainer} />
        <Route path={Routes.NEW_PERSON} component={NewPersonContainer} />
        <Route path={Routes.PEOPLE} component={PeopleContainer} />
        <Route path={Routes.PERSON_DETAILS} component={PersonDetailsContainer} />
        <Route path={Routes.DOWNLOAD_FORMS} component={DownloadPSA} />
        <Route path={Routes.JUDGE_VIEW} component={JudgeContainer} />
        <Route path={Routes.REVIEW_FORMS} component={ReviewPSA} />
        <Route path={Routes.VOICE_ENROLLMENT} component={EnrollVoice} />
        <Route path={Routes.VISUALIZE_DASHBOARD} component={DashboardContainer} />
        <Redirect from={Routes.DASHBOARD} to={Routes.CREATE_FORMS} />
      </Switch>
    </StyledMainWrapper>
  </DashboardWrapper>
);

export default Dashboard;
