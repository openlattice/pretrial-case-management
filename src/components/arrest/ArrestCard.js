/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import { formatDateTime } from '../../utils/Utils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  CASE_ID,
  ARREST_DATE_TIME,
  ARREST_DATE,
  NUMBER_OF_CHARGES
} = PROPERTY_TYPES;

const InfoRow = styled.tr`
  display: flex;
  justify-content: flex-start;
`;

const Header = styled.th`
  width: 105px;
  margin: 2px 5px 2px 0;
`;

const DataElem = styled.td`
  width: 200px;
  margin: 2px 0;
`;

const CaseResultWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 0 auto;
  margin: 10px 0;
`;

type Props = {
  arrest :Immutable.Map<*, *>,
  handleSelect? :(arrest :Immutable.Map<*, *>, entityKeyId :string) => void
};

const ArrestCard = ({ arrest, handleSelect } :Props) => {

  const Wrapper = styled(CaseResultWrapper)`
    &:hover {
      cursor: ${handleSelect ? 'pointer' : 'default'};
    }
  `;

  const caseNum = arrest.getIn([CASE_ID, 0]);
  const arrestDate = formatDateTime(arrest.getIn([ARREST_DATE_TIME, 0],
    arrest.getIn([ARREST_DATE, 0], '')));
  const numCharges = arrest.getIn([NUMBER_OF_CHARGES, 0]);

  const entityKeyId :string = arrest.get('id', '');

  return (
    <Wrapper
        key={entityKeyId}
        onClick={() => {
          if (handleSelect) {
            handleSelect(arrest, entityKeyId);
          }
        }}>
      <table>
        <tbody>
          <InfoRow>
            <Header>Case Number:</Header>
            <DataElem>{ caseNum }</DataElem>
          </InfoRow>
          <InfoRow>
            <Header>Arrest Date:</Header>
            <DataElem>{ arrestDate }</DataElem>
          </InfoRow>
          <InfoRow>
            <Header>Number of Charges:</Header>
            <DataElem>{ numCharges }</DataElem>
          </InfoRow>
        </tbody>
      </table>
    </Wrapper>
  );
};

ArrestCard.defaultProps = {
  handleSelect: () => {}
};

export default ArrestCard;
