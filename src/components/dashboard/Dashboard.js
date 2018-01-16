import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

import DashboardNav from './DashboardNav';
import FormsContainer from '../../containers/dashboard/FormsContainer';
import NewPersonContainer from '../../containers/person/NewPersonContainer';
import PeopleContainer from '../../containers/people/PeopleContainer';
import PersonDetailsContainer from '../../containers/people/PersonDetailsContainer';
import PSAReview from '../../containers/review/Review';
import * as Routes from '../../core/router/Routes';

const DashboardWrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
`;

const StyledMainWrapper = styled.div`
  height: auto;
  width: 100%;
`;

const Dashboard = () => {
  return (
    <DashboardWrapper>
      <DashboardNav />
      <StyledMainWrapper>
        <Switch>
          <Route path={Routes.CREATE_FORMS} component={FormsContainer} />
          <Route path={Routes.NEW_PERSON} component={NewPersonContainer} />
          <Route path={Routes.PEOPLE} component={PeopleContainer} />
          <Route path={Routes.PERSON_DETAILS} component={PersonDetailsContainer} />
          <Route path={Routes.REVIEW_FORMS} component={PSAReview} />
          <Redirect from={Routes.DASHBOARD} to={Routes.CREATE_FORMS} />
        </Switch>
      </StyledMainWrapper>
    </DashboardWrapper>
  );
};

export default Dashboard;
