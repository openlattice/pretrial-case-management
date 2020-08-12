/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Tooltip } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone, faGavel, faBell } from '@fortawesome/pro-solid-svg-icons';

import { OL } from '../../utils/consts/Colors';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';

const { PRETRIAL_CASES, PEOPLE, OUTCOMES } = APP_TYPES;

const { CASE_ID } = PROPERTY_TYPES;

const ListItemWrapper = styled.div`
  display: block;
  width: 100%;
`;
const ListItem = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 44px 271px;
  border-bottom: 1px solid ${OL.GREY11};
  background: ${(props :Object) => (props.selected ? OL.GREY11 : 'none')};
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
  color: ${(props :Object) => (props.hasOpenPSA ? OL.PURPLE02 : OL.GREY02)};
`;

const IconContainer = styled.div`
  position: relative;
  svg {
    font-size: 16px;
    padding-right: 5px;
  }
`;

const IconsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`;

type Props = {
  hearingNeighbors :Map<*, *>,
  hearingEKID :string,
  hasMultipleOpenPSAs :boolean,
  isReceivingReminders :boolean,
  lastEditDate :string,
  selectedHearingEKID :string,
  selectHearing :(hearingEKID :UUID) => void
};

const getIcon = (icon, text) => (
  <IconContainer>
    <FontAwesomeIcon color={OL.GREY03} icon={icon} />
    <Tooltip arrow position="top" title={text}>
      <FontAwesomeIcon color={OL.GREY03} icon={icon} />
      <div>{text}</div>
    </Tooltip>
  </IconContainer>
);

const ManageHearingsListItem = ({
  hearingNeighbors,
  hearingEKID,
  lastEditDate,
  isReceivingReminders,
  hasMultipleOpenPSAs,
  selectHearing,
  selectedHearingEKID
} :Props) => {
  const person = hearingNeighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
  const hearingCase = hearingNeighbors.getIn([PRETRIAL_CASES, 0], Map());

  if (!person.size) return null;

  const outcome = hearingNeighbors.get(OUTCOMES, Map());
  const multiplePSAsIcon = hasMultipleOpenPSAs
    ? getIcon(faClone, 'Person has multiple open PSAs') : null;
  const isReceivingRemindersIcon = isReceivingReminders
    ? getIcon(faBell, 'Person is receiving reminders') : null;
  const hasOutcomeIcon = outcome.size
    ? getIcon(faGavel, 'Hearing has outcome') : null;

  const editDateText :string = lastEditDate || 'NO PSA';
  const {
    [CASE_ID]: caseID,
  } = getEntityProperties(hearingCase, [CASE_ID]);
  const {
    photo,
    lastFirstMid
  } = formatPeopleInfo(person);
  const psaInfo :string = caseID.length ? `${editDateText} | Case: ${caseID}` : editDateText;

  return (
    <ListItemWrapper onClick={() => selectHearing(hearingEKID)}>
      <ListItem selected={selectedHearingEKID === hearingEKID}>
        <Picture src={photo} alt="" />
        <ListItemInfo>
          <PSAInfo hasOpenPSA={lastEditDate}>{ psaInfo }</PSAInfo>
          <IconsContainer>
            { hasOutcomeIcon }
            { multiplePSAsIcon }
            { isReceivingRemindersIcon }
          </IconsContainer>
          <PersonName>{ lastFirstMid }</PersonName>
        </ListItemInfo>
      </ListItem>
    </ListItemWrapper>
  );
};

export default ManageHearingsListItem;
