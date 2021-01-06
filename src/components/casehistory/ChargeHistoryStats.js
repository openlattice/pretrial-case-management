/*
 * @flow
 */
import React from 'react';
import { List, Map } from 'immutable';
import { Tag } from 'lattice-ui-kit';
import { DateTime } from 'luxon';

import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getSummaryStats } from '../../utils/HistoricalChargeUtils';
import { getChargeIdToSentenceDate } from '../../utils/SentenceUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { getPendingCharges } from '../../utils/AutofillUtils';
import {
  Title,
  StatsContainer,
  StatsWrapper,
  StatsSubWrapper,
  StatsGroup,
  StatsItem,
  StatLabel,
  StatValue,
  StatsSectionHeader
} from '../../utils/Layout';

const {
  CHARGES,
  MANUAL_PRETRIAL_CASES,
  PRETRIAL_CASES,
  SENTENCES,
} = APP_TYPES;

const {
  ARREST_DATE_TIME,
  FILE_DATE,
  CASE_ID
} = PROPERTY_TYPES;

type Props = {
  padding ?:boolean;
  personNeighbors :Map;
  psaNeighbors :Map;
};

const ChargeHistoryStats = ({
  personNeighbors,
  psaNeighbors,
  padding
} :Props) => {
  const arrest = psaNeighbors.getIn([MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS], Map());
  const {
    [ARREST_DATE_TIME]: arrestDateTime,
    [FILE_DATE]: arrestFileDate,
    [CASE_ID]: caseId
  } = getEntityProperties(
    arrest,
    [CASE_ID, ARREST_DATE_TIME, FILE_DATE]
  );
  const arrestDate = arrestDateTime || arrestFileDate || DateTime.local().toISO();

  const allCharges = personNeighbors.get(CHARGES, List());
  const allCases = personNeighbors.get(PRETRIAL_CASES, List());
  const allSentences = personNeighbors.get(SENTENCES, List());

  const chargeIdsToSentenceDates = getChargeIdToSentenceDate(allSentences);
  const pendingCharges = getPendingCharges(
    caseId,
    arrestDate,
    allCases,
    allCharges,
    allSentences
  );

  const statusText = pendingCharges.size
    ? `${pendingCharges.size} Pending Charge${pendingCharges.size > 1 ? 's' : ''}`
    : 'No Pending Charges';
  const mode = pendingCharges.size ? 'danger' : 'neutral';

  const {
    numMisdemeanorCharges,
    numMisdemeanorConvictions,
    numFelonyCharges,
    numFelonyConvictions,
    numViolentCharges,
    numViolentConvictions
  } = getSummaryStats(allCharges, chargeIdsToSentenceDates);

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
        {
          !!pendingCharges.size && (
            <Tag mode={mode}>
              {statusText}
            </Tag>
          )
        }
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
};

ChargeHistoryStats.defaultProps = {
  padding: false
};

export default ChargeHistoryStats;
