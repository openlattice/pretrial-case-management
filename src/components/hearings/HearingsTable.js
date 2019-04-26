/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import HearingRow from './HearingRow';
import { OL } from '../../utils/consts/Colors';
import { PSA_STATUSES } from '../../utils/consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { sortHearingsByDate, getHearingString } from '../../utils/HearingUtils';
import { getEntityProperties, isUUID, getIdOrValue } from '../../utils/DataUtils';

const { PSA_SCORES } = APP_TYPES;

const Table = styled.div`
  position: relative;
  overflow: hidden;
  margin-bottom: 30px;
  width: 100%;
  border: 1px solid ${OL.GREY11};
`;

const Body = styled.div`
  width: 100%;
  min-height: 200px;
  max-height: ${props => props.maxHeight}px;
  overflow-y: scroll;
  margin-top: 41px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const HeaderRow = styled.div`
  position: absolute;
  display: grid;
  grid-template-columns: 110px 70px 130px 190px 100px 95px 200px;
  background-color: ${OL.GREY08};
  border: 1px solid ${OL.GREY08};
`;

const HeaderElement = styled.div`
  font-size: 11px;
  font-weight: 600;
  font-family: 'Open Sans', sans-serif;
  color: ${OL.GREY02};
  text-transform: uppercase;
  padding: 12px 10px;
`;

const CenteredHeader = styled(HeaderElement)`
  text-align: center;
`;

const Headers = () => (
  <HeaderRow>
    <HeaderElement>Date</HeaderElement>
    <HeaderElement>Time</HeaderElement>
    <HeaderElement>Courtroom</HeaderElement>
    <HeaderElement>Type</HeaderElement>
    <HeaderElement>Case ID</HeaderElement>
    <CenteredHeader>PSA</CenteredHeader>
    <HeaderElement />
  </HeaderRow>
);

type Props = {
  maxHeight :number,
  rows :Map<*, *>,
  hearingsWithOutcomes :Map<*, *>,
  hearingNeighborsById :Map<*, *>,
  cancelFn :(values :{ entityKeyId :string }) => void,
}

const HearingsTable = ({
  maxHeight,
  rows,
  cancelFn,
  hearingsWithOutcomes,
  hearingNeighborsById
} :Props) => {
  let hearingCourtStringsCounts = Map();
  rows.forEach((hearing) => {
    const hearingCourtString = getHearingString(hearing);
    hearingCourtStringsCounts = hearingCourtStringsCounts.set(
      hearingCourtString,
      hearingCourtStringsCounts.get(hearingCourtString, 0) + 1
    );
  });

  return (
    <Table>
      <Headers />
      <Body maxHeight={maxHeight}>
        {rows.sort(sortHearingsByDate).valueSeq().map(((row) => {
          const {
            [PROPERTY_TYPES.CASE_ID]: hearingCaseId,
            [PROPERTY_TYPES.ENTITY_KEY_ID]: hearingEntityKeyId
          } = getEntityProperties(row, [
            PROPERTY_TYPES.CASE_ID,
            PROPERTY_TYPES.ENTITY_KEY_ID
          ]);
          const hearingCourtString = getHearingString(row);

          const hearingIsADuplicate = (hearingCourtStringsCounts.get(hearingCourtString) > 1);
          const hearingWasCreatedManually = isUUID(hearingCaseId);
          const hearingHasOutcome = hearingsWithOutcomes.includes(hearingEntityKeyId);
          const disabled = hearingHasOutcome || !hearingWasCreatedManually;
          const hearingHasOpenPSA = getIdOrValue(hearingNeighborsById
            .get(hearingEntityKeyId, Map()), PSA_SCORES, PROPERTY_TYPES.STATUS) === PSA_STATUSES.OPEN;
          return (
            <HearingRow
                key={`${hearingEntityKeyId}-${hearingCourtString}-${hearingCaseId}`}
                hearing={row}
                caseId={hearingCaseId}
                isDuplicate={hearingIsADuplicate}
                hasOpenPSA={hearingHasOpenPSA}
                hasOutcome={hearingHasOutcome}
                cancelFn={cancelFn}
                disabled={disabled} />
          );
        }))}
      </Body>
    </Table>
  );
};

export default HearingsTable;
