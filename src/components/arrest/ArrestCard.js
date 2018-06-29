/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import { formatDateTime } from '../../utils/Utils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  ARRESTING_AGENCY,
  CASE_ID,
  ARREST_DATE,
  ARREST_DATE_TIME,
  NUMBER_OF_CHARGES
} = PROPERTY_TYPES;

const DetailsWrapper = styled.div`
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 33%;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: #8e929b;
    text-transform: uppercase;
  }

  div {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: #2e2e34;
  }
`;

const DetailItemWide = styled(DetailItem)`
  width: 100%;
`;


type Props = {
  arrest :Immutable.Map<*, *>,
  handleSelect? :(arrest :Immutable.Map<*, *>, entityKeyId :string) => void
};

const ArrestCard = ({ arrest, handleSelect } :Props) => {
  const caseNum = arrest.getIn([CASE_ID, 0]);
  const arrestDateTime = arrest.getIn([ARREST_DATE_TIME, 0], arrest.getIn([ARREST_DATE, 0], ''));
  const arrestDate = formatDateTime(arrestDateTime, 'MM/DD/YYYY');
  const arrestTime = formatDateTime(arrestDateTime, 'HH:mm');
  const numCharges = arrest.getIn([NUMBER_OF_CHARGES, 0]);
  const arrestAgency = arrest.getIn([ARRESTING_AGENCY, 0]);

  const entityKeyId :string = arrest.get('id', '');

  return (
    <DetailsWrapper>
      <DetailRow>
        <DetailItemWide>
          <h1>CASE NUMBER</h1>
          <div>{caseNum}</div>
        </DetailItemWide>
      </DetailRow>
      <DetailRow>
        <DetailItem>
          <h1>ARREST DATE</h1>
          <div>{arrestDate}</div>
        </DetailItem>
        <DetailItem>
          <h1>ARREST TIME</h1>
          <div>{arrestTime}</div>
        </DetailItem>
        <DetailItem>
          <h1>ARRESTING AGENCY</h1>
          <div>{arrestAgency}</div>
        </DetailItem>
      </DetailRow>
    </DetailsWrapper>
  );
};

ArrestCard.defaultProps = {
  handleSelect: () => {}
};

export default ArrestCard;
