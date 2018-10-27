/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import { Title } from '../../utils/Layout';
import { getSummaryStats } from '../../utils/HistoricalChargeUtils';

const ChargeHistoryStatsWrapper = styled.div`
  padding: ${props => (props.padding ? '0 30px' : '0')};
  width: 100%;
  hr {
    margin: ${props => (props.padding ? '0 -30px' : '15px 0')};
    width: ${props => (props.padding ? 'calc(100% + 60px)' : '100%')};
  }
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
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  text-align: right;
  color: #555e6f;
`;

type Props = {
  chargeHistory :Immutable.Map<*, *>,
  padding :boolean
};

const ChargeHistoryStats = ({ chargeHistory, padding } :Props) => {

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

  return (
    <ChargeHistoryStatsWrapper padding={padding}>
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
    </ChargeHistoryStatsWrapper>
  );
};

export default ChargeHistoryStats;
