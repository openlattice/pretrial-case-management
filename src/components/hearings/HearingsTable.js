/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import HearingRow from './HearingRow';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES_FQNS } from '../../utils/consts/DataModelConsts';
import { getHearingFields, sortHearingsByDate } from '../../utils/consts/HearingConsts';

let { PSA_SCORES } = APP_TYPES_FQNS;

PSA_SCORES = PSA_SCORES.toString();

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
  &::-webkit-scrollbar {
    display: none;
  }
`;

const HeaderRow = styled.div`
  position: absolute;
  display: grid;
  grid-template-columns: 120px 74px 145px 225px 92px 241px;
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
    <HeaderElement>DATE</HeaderElement>
    <HeaderElement>TIME</HeaderElement>
    <HeaderElement>COURTROOM</HeaderElement>
    <HeaderElement>Type</HeaderElement>
    <CenteredHeader>OPEN PSA</CenteredHeader>
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
    const { hearingCourtString } = getHearingFields(hearing);
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
          const { hearingId, hearingEntityKeyId, hearingCourtString } = getHearingFields(row);
          const hearingIsADuplicate = (hearingCourtStringsCounts.get(hearingCourtString) > 1);
          const hearingHasPSA = !!hearingNeighborsById.getIn([hearingEntityKeyId, PSA_SCORES], Map()).size;
          if (hearingIsADuplicate) console.log(`${hearingEntityKeyId}-${hearingCourtString}-${hearingId}`);
          return (
            <HearingRow
                key={`${hearingEntityKeyId}-${hearingCourtString}-${hearingId}`}
                row={row}
                isDuplicate={hearingIsADuplicate}
                hasPSA={hearingHasPSA}
                cancelFn={cancelFn}
                disabled={hearingsWithOutcomes.includes(hearingEntityKeyId)} />
          );
        }))}
      </Body>
    </Table>
  );
};

export default HearingsTable;
