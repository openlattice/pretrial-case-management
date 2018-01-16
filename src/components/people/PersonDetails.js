import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Redirect, Route, Switch } from 'react-router-dom';

import { StyledInnerNav } from '../../utils/Layout';
import { PERSON_FQNS } from '../../utils/Consts';
import * as Routes from '../../core/router/Routes';
import AboutPerson from './AboutPerson';
import InnerNavLink from '../../components/InnerNavLink';
import DashboardMainSection from '../dashboard/DashboardMainSection';


const PersonDetails = ({ selectedPersonData }) => {
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

PersonDetails.propTypes = {
  selectedPersonData: ImmutablePropTypes.mapContains({
    [PERSON_FQNS.ID]: PropTypes.arrayOf(PropTypes.string),
    [PERSON_FQNS.DOB]: PropTypes.arrayOf(PropTypes.string),
    [PERSON_FQNS.FIRST_NAME]: PropTypes.arrayOf(PropTypes.string),
    [PERSON_FQNS.LAST_NAME]: PropTypes.arrayOf(PropTypes.string),
    [PERSON_FQNS.SSN]: PropTypes.arrayOf(PropTypes.string),
    [PERSON_FQNS.SUBJECT_ID]: PropTypes.arrayOf(PropTypes.string),
    [PERSON_FQNS.PHOTO]: PropTypes.arrayOf(PropTypes.string),
    [PERSON_FQNS.SEX]: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default PersonDetails;
