/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone } from '@fortawesome/pro-light-svg-icons';
import { faGavel, faBell } from '@fortawesome/pro-light-svg-icons';

import { getEntityProperties } from '../../utils/DataUtils';
import { formatPersonName } from '../../utils/PeopleUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const { PEOPLE, OUTCOMES } = APP_TYPES;

const {
  FIRST_NAME,
  MIDDLE_NAME,
  MUGSHOT,
  LAST_NAME,
  PICTURE
} = PROPERTY_TYPES;

const ListItem = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 44px 271px;
`;

const Picture = styled.img`
  width: 100%
`

type Props = {
  hearingNeighbors :Map<*, *>
};

const ManageHearingsListItem = ({
  hearingNeighbors,
  lastEditDate,
  hasOpenPSA,
  isReceivingReminders,
  hasMultipleOpenPSAs
} :Props) => {
  const person = hearingNeighbors.get(PEOPLE, Map());

  if (!person.size) return null;
  const mugshot = person.getIn([MUGSHOT, 0], person.getIn([PICTURE, 0]));
  const outcome = hearingNeighbors.get(OUTCOMES, Map());
  const {
    [FIRST_NAME]: firstName,
    [MIDDLE_NAME]: middleName,
    [LAST_NAME]: lastName
  } = getEntityProperties(person, [FIRST_NAME, MIDDLE_NAME, LAST_NAME]);
  const { lastFirstMid } = formatPersonName(firstName, middleName, lastName);

  return (
    <ListItem>
      <Picture src={mugshot} alt="" />
    </ListItem>
  )
};

export default ManageHearingsListItem;
