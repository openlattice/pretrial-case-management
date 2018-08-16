/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';

import ChargeList from '../charges/ChargeList';
import { formatDateList } from '../../utils/FormattingUtils';
import { getSummaryStats } from '../../utils/HistoricalChargeUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const CaseHistoryWrapper = styled.div`
  hr {
    margin: ${props => (props.modal ? '30px -30px' : '15px 0')};
    width: ${props => (props.modal ? 'calc(100% + 60px)' : '100%')};
  }
`;

const InfoRow = styled.div`
  background-color: #f5f5f8;
  display: flex;
  flex-direction: row;
  padding: 15px 0;
  margin: 0 -30px;
`;

const InfoItem = styled.div`
  margin: 0 30px;
  color: #555e6f;
`;

const CaseHistoryContainer = styled.div`
  height: 100%;
`;

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 15px 0;
`;

const StatsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const StatsGroup = styled.div`
  display: grid;
  grid-template-columns: 28% 28% 28%;
  grid-column-gap: 8%;
  grid-template-rows: 50% 50%;
  width: 100%;
`;
const StatsItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 2px;
`;

const StatLabel = styled.span`
  font-size: 16px;
  text-align: left;
  color: #555e6f;
`;
const StatValue = styled.span`
  font-family: Open Sans;
  font-size: 16px;
  font-weight: 600;
  text-align: right;
  color: #555e6f;
`;
const Title = styled.div`
  display: flex;
  flex-direction: column;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: #555e6f;
  margin-bottom: 20px;

  span:first-child {
    font-weight: ${props => (props.withSubtitle ? '600' : '400')};
    padding-bottom: 5px;
  }
`;

type Props = {
  caseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  modal :boolean
};

const CaseHistory = ({ caseHistory, chargeHistory, modal } :Props) => {

  const {
    numMisdemeanorCharges,
    numMisdemeanorConvictions,
    numFelonyCharges,
    numFelonyConvictions,
    numViolentCharges,
    numViolentConvictions
  } = getSummaryStats(chargeHistory);

  const SUMMARY_STATS_ARR = [
    {
      label: '# of misdemeanor charges',
      value: numMisdemeanorCharges
    },
    {
      label: '# of felony charges',
      value: numFelonyCharges
    },
    {
      label: '# of violent charges',
      value: numViolentCharges
    },
    {
      label: '# of misdemeanor convictions',
      value: numMisdemeanorConvictions
    },
    {
      label: '# of felony convictions',
      value: numFelonyConvictions
    },
    {
      label: '# of violent convictions',
      value: numViolentConvictions
    }
  ];

  const SummaryStats = SUMMARY_STATS_ARR.map(stat => (
    <StatsItem key={stat.label} >
      <StatLabel>{stat.label}</StatLabel>
      <StatValue>{stat.value}</StatValue>
    </StatsItem>
  ));

  const cases = caseHistory
    .sort((c1, c2) => {
      const date1 = moment(c1.getIn([PROPERTY_TYPES.FILE_DATE, 0], ''));
      const date2 = moment(c2.getIn([PROPERTY_TYPES.FILE_DATE, 0], ''));
      return date1.isBefore(date2) ? 1 : -1;
    })
    .filter(caseObj => caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '').length)
    .map((caseObj) => {
      const caseNum = caseObj.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
      const charges = chargeHistory.get(caseNum);
      const fileDate = formatDateList(caseObj.get(PROPERTY_TYPES.FILE_DATE, Immutable.List()));
      return (
        <div key={caseNum}>
          <InfoRow>
            <InfoItem>{`Case Number: ${caseNum}`}</InfoItem>
            <InfoItem>{`File Date: ${fileDate}`}</InfoItem>
          </InfoRow>
          <ChargeList modal={modal} pretrialCaseDetails={caseObj} charges={charges} detailed historical />
        </div>
      );
    });

  return (
    <CaseHistoryWrapper modal={modal}>
      <div>
        <Title withSubtitle >
          <span>Summary Statistics</span>
          <span>All current and past cases</span>
        </Title>
        <StatsContainer>
          <StatsWrapper>
            <StatsGroup>
              {SummaryStats}
            </StatsGroup>
          </StatsWrapper>
        </StatsContainer>
        <hr />
      </div>
      <CaseHistoryContainer>
        <Title withSubtitle >
          <span>Case History</span>
        </Title>
        {cases}
      </CaseHistoryContainer>
    </CaseHistoryWrapper>
  );
};

export default CaseHistory;
