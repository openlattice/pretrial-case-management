/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import { Redirect, Route, Switch } from 'react-router-dom';

import { StyledInnerNav } from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatValue } from '../../utils/Utils';
import * as Routes from '../../core/router/Routes';
import AboutPerson from './AboutPerson';
import InnerNavLink from '../../components/InnerNavLink';
import DashboardMainSection from '../dashboard/DashboardMainSection';

type Props = {
  selectedPersonId :string,
  selectedPersonData :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>
};

const PersonDetails = ({ selectedPersonId, selectedPersonData, neighbors } :Props) => {

  const renderAboutPersonComponent = () => {
    return (
      <AboutPerson selectedPersonData={selectedPersonData} neighbors={neighbors} />
    );
  };

  return (
    <DashboardMainSection
        header={
          `${formatValue(selectedPersonData.get(PROPERTY_TYPES.FIRST_NAME))}
           ${formatValue(selectedPersonData.get(PROPERTY_TYPES.LAST_NAME))}`
        }>
      <StyledInnerNav>
        <InnerNavLink
            path={`${Routes.ABOUT_PERSON}`}
            name="About_Person"
            label="About" />
      </StyledInnerNav>
      <Switch>
        <Route
            path={`${Routes.PERSON_DETAILS_ROOT}/${selectedPersonId}/${Routes.ABOUT}`}
            render={renderAboutPersonComponent} />
        <Redirect
            from={Routes.PERSON_DETAILS}
            to={`${Routes.PERSON_DETAILS_ROOT}/${selectedPersonId}/${Routes.ABOUT}`} />
      </Switch>
    </DashboardMainSection>
  );
};

export default PersonDetails;
