/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { List, Map } from 'immutable';
import { Constants } from 'lattice';
import { Tooltip } from 'lattice-ui-kit';

import { APP_TYPES, PROPERTY_TYPES } from './consts/DataModelConsts';
import { PERSON_INFO_DATA } from './consts/Consts';
import { PSA_NEIGHBOR } from './consts/FrontEndStateConsts';
import { formatDOB } from './Helpers';
import { getFirstNeighborValue } from './DataUtils';

const { OPENLATTICE_ID_FQN } = Constants;
const { HAS_OPEN_PSA, HAS_MULTIPLE_OPEN_PSAS, IS_RECEIVING_REMINDERS } = PERSON_INFO_DATA;
const { PSA_SCORES } = APP_TYPES;
const {
  DOB,
  FIRST_NAME,
  LAST_NAME,
  MIDDLE_NAME,
  MUGSHOT,
  PERSON_ID,
  PICTURE
} = PROPERTY_TYPES;

const NameContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  font-size: ${(props :Object) => (props.fontSize || 12)}px;
  white-space: pre-wrap;
`;

const NameSpan = styled.span`
  display: block;
`;

export const getNameTooltip = (nameList :List, includeSpace ?:boolean) => (
  <Tooltip arrow placement="top" title={nameList.join(', ')}>
    <NameSpan>{`${includeSpace ? ' ' : ''}${nameList.first()}`}</NameSpan>
  </Tooltip>
);

export const formatPersonName = (firstName :List, middleName :List, lastName :List, fontSize ?:number) => {

  const lastFirstMid = (
    <NameContainer fontSize={fontSize}>
      { lastName.size && getNameTooltip(lastName) }
      {','}
      { firstName.size && getNameTooltip(firstName, true) }
      { middleName.size && getNameTooltip(middleName, true)}
    </NameContainer>
  );
  const firstMidLast = (
    <NameContainer fontSize={fontSize}>
      { firstName.size && getNameTooltip(firstName) }
      { middleName.size && getNameTooltip(middleName, true)}
      { lastName.size && getNameTooltip(lastName, true) }
    </NameContainer>
  );

  return { firstMidLast, lastFirstMid };
};

export const formatPeopleInfo = (person :Map) => {
  const personEntityKeyId = getFirstNeighborValue(person, OPENLATTICE_ID_FQN);
  const personId = getFirstNeighborValue(person, PERSON_ID);
  const dob = formatDOB(getFirstNeighborValue(person, DOB));
  const firstName = person.get(FIRST_NAME, person.getIn([PSA_NEIGHBOR.DETAILS, FIRST_NAME], List()));
  const middleName = person.get(MIDDLE_NAME, person.getIn([PSA_NEIGHBOR.DETAILS, MIDDLE_NAME], List()));
  const lastName = person.get(LAST_NAME, person.getIn([PSA_NEIGHBOR.DETAILS, LAST_NAME], List()));
  const photo = getFirstNeighborValue(person, PICTURE, getFirstNeighborValue(person, MUGSHOT));
  const { firstMidLast, lastFirstMid } = formatPersonName(firstName, middleName, lastName);
  const hasOpenPSA = person.get(HAS_OPEN_PSA, false);
  const multipleOpenPSAs = person.get(HAS_MULTIPLE_OPEN_PSAS, false);
  const isReceivingReminders = person.get(IS_RECEIVING_REMINDERS, false);
  let lastFirstMidString = lastName.get(0, '').concat(`, ${firstName.get(0, '')}`);
  if (middleName.size) lastFirstMidString = lastFirstMidString.concat(middleName.get(0));
  return {
    personEntityKeyId,
    personId,
    firstName,
    middleName,
    lastName,
    dob,
    photo,
    firstMidLast,
    lastFirstMid,
    lastFirstMidString,
    hasOpenPSA,
    multipleOpenPSAs,
    isReceivingReminders
  };
};

export const sortPeopleByName = (p1 :Map, p2 :Map) => {
  const p1Last = p1.getIn([LAST_NAME, 0], '').toLowerCase();
  const p2Last = p2.getIn([LAST_NAME, 0], '').toLowerCase();
  if (p1Last !== p2Last) return p1Last < p2Last ? -1 : 1;

  const p1First = p1.getIn([FIRST_NAME, 0], '').toLowerCase();
  const p2First = p2.getIn([FIRST_NAME, 0], '').toLowerCase();
  if (p1First !== p2First) return p1First < p2First ? -1 : 1;

  const p1Dob = DateTime.fromISO(p1.getIn([DOB, 0], ''));
  const p2Dob = DateTime.fromISO(p2.getIn([DOB, 0], ''));
  if (p1Dob.isValid && p2Dob.isValid) return p1Dob < p2Dob ? -1 : 1;

  return 0;
};

export const getFormattedPeople = (peopleList :List) => (
  peopleList.sort(sortPeopleByName).map((person) => formatPeopleInfo(person))
);

// Get PSA Ids from person Neighbors
export const getPSAIdsFromNeighbors = (peopleNeighbors :Map) => (
  peopleNeighbors.get(PSA_SCORES, List())
    .map((neighbor) => neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]))
    .filter((id) => !!id)
    .toJS()
);
