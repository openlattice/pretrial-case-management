/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import ChargeList from '../charges/ChargeList';
import { formatDateList } from '../../utils/Utils';
import { InlineBold } from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getSummaryStats } from '../../utils/consts/ChargeConsts';

const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 15px 0;
`;

const InfoItem = styled.div`
  margin: 0 20px;
`;

const InfoHeader = styled.span`
  font-weight: bold;
`;

const CaseHistoryContainer = styled.div`
  max-height: 750px;
  overflow-y: scroll;
  text-align: center;
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #f3f5f7;
  padding: 15px 0;
`;

const StatsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  background: #f3f5f7;
`;

const StatsTitle = styled.div`
  font-weight: bold;
  text-decoration: underline;
  font-style: italic;
`;

const StatsGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: baseline;
  margin: 10px;
`;
const StatsItem = styled.div`
  margin: 2px;
`;

const StatsCount = styled.span`
  font-size: 18px;
`;

type Props = {
  caseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>
};

const CaseHistory = ({ caseHistory, chargeHistory } :Props) => {

  const {
    numMisdemeanorCharges,
    numMisdemeanorConvictions,
    numFelonyCharges,
    numFelonyConvictions,
    numViolentCharges,
    numViolentConvictions
  } = getSummaryStats(chargeHistory);

  const cases = caseHistory
    .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '').length)
    .map((caseObj) => {
      const caseNum = caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
      const charges = chargeHistory.get(caseNum);
      const fileDate = formatDateList(caseObj.get(PROPERTY_TYPES.FILE_DATE, Immutable.List()));
      return (
        <div key={caseNum}>
          <InfoRow>
            <InfoItem><InfoHeader>Case #: </InfoHeader>{caseNum}</InfoItem>
            <InfoItem><InfoHeader>File Date: </InfoHeader>{fileDate}</InfoItem>
          </InfoRow>
          <ChargeList pretrialCaseDetails={caseObj} charges={charges} detailed historical />
          <hr />
        </div>
      );
    });

  return (
    <CaseHistoryContainer>
      <StatsContainer>
        <StatsTitle>Summary Statistics:</StatsTitle>
        <StatsWrapper>
          <StatsGroup>
            <StatsItem>
              <InlineBold>Num misdemeanor charges: </InlineBold>
              <StatsCount>{numMisdemeanorCharges}</StatsCount>
            </StatsItem>
            <StatsItem>
              <InlineBold>Num misdemeanor convictions: </InlineBold>
              <StatsCount>{numMisdemeanorConvictions}</StatsCount>
            </StatsItem>
          </StatsGroup>
          <StatsGroup>
            <StatsItem>
              <InlineBold>Num felony charges: </InlineBold>
              <StatsCount>{numFelonyCharges}</StatsCount>
            </StatsItem>
            <StatsItem>
              <InlineBold>Num felony convictions: </InlineBold>
              <StatsCount>{numFelonyConvictions}</StatsCount>
            </StatsItem>
          </StatsGroup>
          <StatsGroup>
            <StatsItem>
              <InlineBold>Num violent charges: </InlineBold>
              <StatsCount>{numViolentCharges}</StatsCount>
            </StatsItem>
            <StatsItem>
              <InlineBold>Num violent convictions: </InlineBold>
              <StatsCount>{numViolentConvictions}</StatsCount>
            </StatsItem>
          </StatsGroup>
        </StatsWrapper>
      </StatsContainer>
      {cases}
    </CaseHistoryContainer>
  );
};

export default CaseHistory;
