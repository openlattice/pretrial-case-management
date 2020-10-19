/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import { Tag } from 'lattice-ui-kit';

import { getSummaryStats } from '../../utils/HistoricalChargeUtils';
import {
  Title,
  PendingChargeStatus,
  StatsContainer,
  StatsWrapper,
  StatsSubWrapper,
  StatsGroup,
  StatsItem,
  StatLabel,
  StatValue,
  StatsSectionHeader
} from '../../utils/Layout';

type Props = {
  chargeHistory :Immutable.Map<*, *>,
  pendingCharges :Immutable.List<*, *>,
  padding :boolean
};

class ChargeHistoryStats extends React.Component<Props, *> {

  renderPendingChargeStatus = () => {
    const { pendingCharges } = this.props;
    const statusText = pendingCharges.size
      ? `${pendingCharges.size} Pending Charge${pendingCharges.size > 1 ? 's' : ''}`
      : 'No Pending Charges';
    const mode = pendingCharges.size ? 'danger' : 'neutral';
    return (
      <Tag mode={mode}>
        {statusText}
      </Tag>
    );
  }

  render() {
    const { chargeHistory, padding, pendingCharges } = this.props;
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

    const SummaryStats = SUMMARY_STATS_ARR.map((stat) => (
      <StatsItem key={stat.label}>
        <StatLabel>{stat.label}</StatLabel>
        <StatValue>{stat.value}</StatValue>
      </StatsItem>
    ));

    return (
      <StatsWrapper padding={padding}>
        <StatsSectionHeader>
          <Title withSubtitle>
            <span>Summary Statistics</span>
            All current and past cases
          </Title>
          {pendingCharges.size ? this.renderPendingChargeStatus() : null}
        </StatsSectionHeader>
        <StatsContainer>
          <StatsSubWrapper>
            <StatsGroup>
              {SummaryStats}
            </StatsGroup>
          </StatsSubWrapper>
        </StatsContainer>
      </StatsWrapper>
    );
  }
}

export default ChargeHistoryStats;
