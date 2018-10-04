/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';

import HearingSummary from '../hearings/HearingSummary';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { formatDateTime } from '../../utils/FormattingUtils';

const NoResults = styled.div`
  margin: 0 -30px 30px;
  font-size: 18px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 100%;
`;

const { OPENLATTICE_ID_FQN } = Constants;

const ReleaseConditionsSummary = ({ completedHearings, hearingNeighborsById }) => {
  const HearingSummaries = completedHearings.map((hearing) => {
    const entityKeyId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
    const hearingNeighbors = hearingNeighborsById.get(entityKeyId);
    const dateTime = formatDateTime(hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')).split(' ');
    const date = dateTime[0];
    const time = dateTime[1];
    const courtroom = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');
    // const judge = ''; // TODO: Add judge to hearing object
    const hearingOutcome = hearingNeighbors.getIn([ENTITY_SETS.OUTCOMES, PSA_NEIGHBOR.DETAILS]);
    const hearingBond = hearingNeighbors.getIn([ENTITY_SETS.BONDS, PSA_NEIGHBOR.DETAILS]);
    const hearingConditions = hearingNeighbors.get(ENTITY_SETS.RELEASE_CONDITIONS);
    const component = 'RELEASE_CONDTIONS_SUMMARY';

    const hearingObj = {
      date,
      time,
      courtroom,
      hearingOutcome,
      hearingBond,
      hearingConditions,
      component
    };

    return <HearingSummary hearing={hearingObj} />;
  });

  if (!completedHearings.size) {
    return (
      <NoResults>No outcomes have been submitted for hearings assosiated with this PSA.</NoResults>
    );
  }

  return (
    <div>{HearingSummaries}</div>
  );

};

export default ReleaseConditionsSummary;
