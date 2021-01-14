import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { Map } from 'immutable';

import CaseHistoryTimeline from '../casehistory/CaseHistoryTimeline';
import ChargeHistoryStats from '../casehistory/ChargeHistoryStats';
import CaseHistoryList from '../casehistory/CaseHistoryList';
import LogoLoader from '../LogoLoader';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatDate } from '../../utils/FormattingUtils';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';
import {
  Title,
  StyledColumn,
  StyledColumnRow,
  StyledColumnRowWrapper,
  Wrapper
} from '../../utils/Layout';
import {
  getChargeHistory,
  getCaseHistory,
  getCasesForPSA,
} from '../../utils/CaseUtils';

const { MANUAL_PRETRIAL_CASES, STAFF } = APP_TYPES;

const { CASE_ID, ARREST_DATE_TIME } = PROPERTY_TYPES;

const PaddedStyledColumnRow = styled(StyledColumnRow)`
  padding: 30px;
`;

type Props = {
  loading :boolean;
  mostRecentPSA :Map;
  mostRecentPSAEntityKeyId :string;
  neighbors :Map;
  psaNeighborsById :Map;
}

const PersonCases = ({
  loading,
  mostRecentPSA,
  mostRecentPSAEntityKeyId,
  neighbors,
  psaNeighborsById
} :Props) => {
  const chargeHistory = getChargeHistory(neighbors);
  const mostRecentPSANeighbors = psaNeighborsById.get(mostRecentPSAEntityKeyId, Map());
  const scores = mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map());
  const caseHistory = getCaseHistory(neighbors);
  const arrest = mostRecentPSANeighbors.getIn([MANUAL_PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS], Map());
  const {
    [ARREST_DATE_TIME]: arrestDateTime
  } = getEntityProperties(
    arrest,
    [CASE_ID, ARREST_DATE_TIME]
  );
  const arrestDate = arrestDateTime || DateTime.local().toISO();
  const lastEditDateForPSA = psaNeighborsById.getIn(
    [mostRecentPSAEntityKeyId, STAFF, 0, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0],
    formatDate(DateTime.local().toISODate())
  );
  const {
    caseHistoryForMostRecentPSA,
    chargeHistoryForMostRecentPSA,
    caseHistoryNotForMostRecentPSA,
    chargeHistoryNotForMostRecentPSA
  } = getCasesForPSA(
    caseHistory,
    chargeHistory,
    scores,
    arrestDate,
    lastEditDateForPSA
  );

  if (loading) {
    return <LogoLoader loadingText="Loading..." />;
  }
  return (
    <Wrapper>
      <StyledColumn>
        <StyledColumnRowWrapper>
          <PaddedStyledColumnRow>
            <Title withSubtitle>
              <span>Timeline</span>
              <span>Convictions in the past two years</span>
            </Title>
            <CaseHistoryTimeline caseHistory={caseHistory} chargeHistory={chargeHistory} />
            <ChargeHistoryStats
                psaNeighbors={mostRecentPSANeighbors}
                personNeighbors={neighbors} />
          </PaddedStyledColumnRow>
        </StyledColumnRowWrapper>
        <StyledColumnRowWrapper>
          <StyledColumnRow>
            <CaseHistoryList
                loading={loading}
                title="Pending Cases on Arrest Date for Current PSA"
                caseHistory={caseHistoryForMostRecentPSA}
                chargeHistory={chargeHistoryForMostRecentPSA} />
          </StyledColumnRow>
        </StyledColumnRowWrapper>
        <StyledColumnRowWrapper>
          <StyledColumnRow>
            <CaseHistoryList
                loading={loading}
                title="Case History"
                caseHistory={caseHistoryNotForMostRecentPSA}
                chargeHistory={chargeHistoryNotForMostRecentPSA} />
          </StyledColumnRow>
        </StyledColumnRowWrapper>
      </StyledColumn>
    </Wrapper>
  );
};

export default PersonCases;
