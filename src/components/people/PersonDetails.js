/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';

import AboutPerson from './AboutPerson';

type Props = {
  selectedPersonData :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>
};

const PersonDetails = ({ selectedPersonData, neighbors } :Props) => (
  <AboutPerson selectedPersonData={selectedPersonData} neighbors={neighbors} />
);

export default PersonDetails;
