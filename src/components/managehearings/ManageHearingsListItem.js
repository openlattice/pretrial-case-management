/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faGavel, faBell } from '@fortawesome/pro-solid-svg-icons';

import defaultProfile from '../../assets/svg/profile-placeholder-rectangle-big.svg';
import { OL } from '../../utils/consts/Colors';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatPersonName } from '../../utils/PeopleUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const { PRETRIAL_CASES, PEOPLE, OUTCOMES } = APP_TYPES;

const {
  CASE_ID,
  FIRST_NAME,
  MIDDLE_NAME,
  MUGSHOT,
  LAST_NAME,
  PICTURE
} = PROPERTY_TYPES;

const ListItemWrapper = styled.div`
  display: block;
  width: 100%;
`;
const ListItem = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 44px 271px;
  border-bottom: 1px solid ${OL.GREY11};
  :hover {
    background: ${OL.GREY11};
  }
`;

const ListItemInfo = styled.div`
  width: 100%;
  display: grid;
  padding: 10px 15px;
  grid-template-columns: auto;
  grid-template-rows: 50% 50%;
`;

const PersonName = styled.div`
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  grid-column-start: 1;
  grid-column-end: 3;
`;

const Picture = styled.img`
  width: 100%;
`;

const PSAInfo = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 11px;
  font-weight: 600;
  color: ${props => (props.hasOpenPSA ? OL.PURPLE02 : OL.GREY02)};
`;
const IconContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  svg {
    font-size: 16px;
    padding-right: 5px;
  }
`;

type Props = {
  hearingNeighbors :Map<*, *>,
  hearingEKID :string,
  lastEditDate :string,
  isReceivingReminders :boolean,
  hasMultipleOpenPSAs :boolean,
  selectHearing :() => void
};

const ManageHearingsListItem = ({
  hearingNeighbors,
  hearingEKID,
  lastEditDate,
  isReceivingReminders,
  hasMultipleOpenPSAs,
  selectHearing
} :Props) => {
  const person = hearingNeighbors.get(PEOPLE, Map());
  const hearingCase = hearingNeighbors.getIn([PRETRIAL_CASES, 0], Map());

  if (!person.size) return null;
  const outcome = hearingNeighbors.get(OUTCOMES, Map());
  const multiplePSAsIcon = hasMultipleOpenPSAs
    ? <FontAwesomeIcon color={OL.GREY03} icon={faClone} /> : null;
  const isReceivingRemindersIcon = isReceivingReminders
    ? <FontAwesomeIcon color={OL.GREY03} icon={faBell} /> : null;
  const hasOutcomeIcon = outcome.size
    ? <FontAwesomeIcon color={OL.GREY03} icon={faGavel} /> : null;
  const editDateText :string = lastEditDate || 'NO PSA';
  const {
    [FIRST_NAME]: firstName,
    [MIDDLE_NAME]: middleName,
    [LAST_NAME]: lastName,
    [MUGSHOT]: personMugshot,
    [PICTURE]: personPhoto
  } = getEntityProperties(person, [FIRST_NAME, MIDDLE_NAME, LAST_NAME, MUGSHOT, PICTURE]);
  const {
    [CASE_ID]: caseID,
  } = getEntityProperties(hearingCase, [CASE_ID]);
  const psaInfo :string = caseID.length ? `${editDateText} | Case: ${caseID}` : editDateText;
  const mugshot :string = personMugshot || personPhoto || defaultProfile;
  const { lastFirstMid } = formatPersonName(firstName, middleName, lastName);

  return (
    <ListItemWrapper onClick={() => selectHearing(hearingEKID)}>
      <ListItem>
        <Picture src={mugshot} alt="" />
        <ListItemInfo>
          <PSAInfo hasOpenPSA={lastEditDate}>{ psaInfo }</PSAInfo>
          <IconContainer>
            { hasOutcomeIcon }
            { multiplePSAsIcon }
            { isReceivingRemindersIcon }
          </IconContainer>
          <PersonName>{ lastFirstMid }</PersonName>
        </ListItemInfo>
      </ListItem>
    </ListItemWrapper>
  );
};

export default ManageHearingsListItem;
