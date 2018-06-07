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

const CaseInfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 10px;
`;

const CaseInfoHeaders = styled.div`
  display: flex;
  text-align: left;
  flex-direction: column;
  justify-content: space-around;
  strong {
    font-weight: 600;
  }
`;

const CaseInfo = styled.div`
  display: flex;
  text-align: left;
  flex-direction: column;
  justify-content: space-between;
  margin: 0;
  margin-left: 10px;
  span {
    margin: 0;
  }
`;

type Props = {
  pretrialCase :Immutable.Map<*, *>,
  handleSelect? :(pretrialCase :Immutable.Map<*, *>, entityKeyId :string) => void
};

const PretrialCard = ({ pretrialCase, handleSelect } :Props) => {

  const Wrapper = styled(CaseResultWrapper)`
    &:hover {
      cursor: ${handleSelect ? 'pointer' : 'default'};
    }
  `;

  const caseNum = pretrialCase.getIn([CASE_ID, 0]);
  const arrestDate = formatDateTime(pretrialCase.getIn([ARREST_DATE_TIME, 0],
    pretrialCase.getIn([ARREST_DATE, 0], '')));
  const numCharges = pretrialCase.getIn([NUMBER_OF_CHARGES, 0]);

  const entityKeyId :string = pretrialCase.get('id', '');

  return (
    <Wrapper
        key={entityKeyId}
        onClick={() => {
          if (handleSelect) {
            handleSelect(pretrialCase, entityKeyId);
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

PretrialCard.defaultProps = {
  handleSelect: () => {}
};

export default PretrialCard;
