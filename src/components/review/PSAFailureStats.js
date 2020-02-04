/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import {
  StatsContainer,
  StatsWrapper,
  StatsSubWrapper,
  StatsGroup,
  StatsItem,
  StatLabel,
  StatValue,
} from '../../utils/Layout';

const StyledStatsGroup = styled(StatsGroup)`
  grid-template-columns: 20% 20% 20%;
  grid-column-gap: 70px;
`;

type Props = {
  failures :number,
  ftas :number,
  padding :boolean
};

const PSAFailureStats = ({ failures, ftas, padding } :Props) => {
  const SUMMARY_STATS_ARR = [
    {
      label: '# of pretrial failures',
      value: failures
    },
    {
      label: '# of failure to appear',
      value: ftas
    }
  ];

  const SummaryStats = SUMMARY_STATS_ARR.map((stat) => (
    <StatsItem key={stat.label}>
      <StatLabel>{stat.label}</StatLabel>
      <StatValue>{stat.value}</StatValue>
    </StatsItem>
  ));

  return (
    <StatsWrapper padding={padding}>
      <StatsContainer>
        <StatsSubWrapper>
          <StyledStatsGroup>
            {SummaryStats}
          </StyledStatsGroup>
        </StatsSubWrapper>
      </StatsContainer>
    </StatsWrapper>
  );
};

export default PSAFailureStats;
