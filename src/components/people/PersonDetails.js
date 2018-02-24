/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import { Redirect, Route, Switch } from 'react-router-dom';

import { StyledInnerNav } from '../../utils/Layout';
import { PERSON_FQNS } from '../../utils/consts/Consts';
import * as Routes from '../../core/router/Routes';
import AboutPerson from './AboutPerson';
import InnerNavLink from '../../components/InnerNavLink';
import DashboardMainSection from '../dashboard/DashboardMainSection';

type Props = {
  selectedPersonData :Immutable.Map<*, *>
};

const PersonDetails = ({ selectedPersonData } :Props) => {
  const subjectId = selectedPersonData.get(PERSON_FQNS.SUBJECT_ID);

  const renderAboutPersonComponent = () => {
    return (
      <AboutPerson selectedPersonData={selectedPersonData} />
    );
  };

  return (
    <DashboardMainSection
        header={
          `${selectedPersonData.get(PERSON_FQNS.FIRST_NAME)}
           ${selectedPersonData.get(PERSON_FQNS.LAST_NAME)}`
        }>
      <StyledInnerNav>
        <InnerNavLink
            path={Routes.ABOUT_PERSON}
            name="About_Person"
            label="About" />
      </StyledInnerNav>
      <Switch>
        <Route
            path={`${Routes.PERSON_DETAILS_ROOT}/${subjectId}/${Routes.ABOUT}`}
            render={renderAboutPersonComponent} />
        <Redirect
            from={Routes.PERSON_DETAILS}
            to={`${Routes.PERSON_DETAILS_ROOT}/${subjectId}/${Routes.ABOUT}`} />
      </Switch>
    </DashboardMainSection>
  );
};

export default PersonDetails;
