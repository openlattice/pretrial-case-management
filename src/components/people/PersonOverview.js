/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';

import AboutPersonGeneral from '../person/AboutPersonGeneral';
import HearingCardsWithTitle from '../hearings/HearingCardsWithTitle';
import CaseHistoryList from '../casehistory/CaseHistoryList';
import ChargeHistoryStats from '../casehistory/ChargeHistoryStats';
import LoadingSpinner from '../LoadingSpinner';
import PSASummary from '../../containers/review/PSASummary';
import ViewMoreLink from '../buttons/ViewMoreLink';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getIdOrValue } from '../../utils/DataUtils';
import {
  StyledColumn,
  StyledColumnRow,
  StyledColumnRowWrapper,
  Wrapper
} from '../../utils/Layout';
import {
  currentPendingCharges,
  getChargeHistory,
  getCaseHistory,
  getCasesForPSA,
} from '../../utils/CaseUtils';
import {
  PSA_NEIGHBOR,
  PSA_ASSOCIATION
} from '../../utils/consts/FrontEndStateConsts';

import * as Routes from '../../core/router/Routes';

type Props = {
  contactInfo :Map<*, *>,
  psaNeighborsById :Map<*, *>,
  selectedPersonData :Map<*, *>,
  loading :boolean,
  mostRecentPSA :Map<*, *>,
  mostRecentPSAEntityKeyId :string,
  neighbors :Map<*, *>,
  openDetailsModal :() => void,
  openUpdateContactModal :() => void,
  personId :string,
  scheduledHearings :List,
}

const StyledViewMoreLinkForCases = styled(ViewMoreLink)`
  position: absolute;
  transform: translateX(830px) translateY(15px);
`;

const StyledViewMoreLinkForHearings = styled(StyledViewMoreLinkForCases)`
  transform: translateX(800px) translateY(20px);
`;

const StyledColumnRowWithPadding = styled(StyledColumnRow)`
  padding: 20px 30px 30px;
`;

const PersonOverview = ({
  contactInfo,
  loading,
  mostRecentPSA,
  mostRecentPSAEntityKeyId,
  neighbors,
  personId,
  psaNeighborsById,
  scheduledHearings,
  selectedPersonData,
  openDetailsModal,
  openUpdateContactModal
} :Props) => {
  const mostRecentPSANeighbors = psaNeighborsById.get(mostRecentPSAEntityKeyId, Map());
  const arrestDate = getIdOrValue(
    mostRecentPSANeighbors, ENTITY_SETS.MANUAL_PRETRIAL_CASES, PROPERTY_TYPES.ARREST_DATE_TIME
  );
  const caseHistory = getCaseHistory(neighbors);
  const chargeHistory = getChargeHistory(neighbors);
  const lastEditDateForPSA = psaNeighborsById.getIn(
    [mostRecentPSAEntityKeyId, ENTITY_SETS.STAFF, 0, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0],
    ''
  );
  const notes = getIdOrValue(
    mostRecentPSANeighbors, ENTITY_SETS.RELEASE_RECOMMENDATIONS, PROPERTY_TYPES.RELEASE_RECOMMENDATION
  );
  const scores = mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, Map());
  const { caseHistoryForMostRecentPSA, chargeHistoryForMostRecentPSA } = getCasesForPSA(
    caseHistory,
    chargeHistory,
    scores,
    arrestDate,
    lastEditDateForPSA
  );
  const pendingCharges = currentPendingCharges(chargeHistory);

  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <Wrapper>
      <StyledColumn>
        <StyledColumnRowWrapper>
          <StyledColumnRow>
            <AboutPersonGeneral
                selectedPersonData={selectedPersonData}
                contactInfo={contactInfo}
                openUpdateContactModal={openUpdateContactModal} />
          </StyledColumnRow>
        </StyledColumnRowWrapper>
        <StyledColumnRowWrapper>
          <StyledColumnRow>
            <ChargeHistoryStats
                padding
                pendingCharges={pendingCharges}
                chargeHistory={chargeHistory} />
          </StyledColumnRow>
        </StyledColumnRowWrapper>
        <StyledColumnRowWrapper>
          <StyledColumnRow>
            <PSASummary
                profile
                notes={notes}
                scores={scores}
                neighbors={mostRecentPSANeighbors}
                openDetailsModal={openDetailsModal} />
          </StyledColumnRow>
        </StyledColumnRowWrapper>
        <StyledColumnRowWrapper>
          <StyledColumnRowWithPadding>
            <StyledViewMoreLinkForHearings to={`${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.HEARINGS}`}>
              View more
            </StyledViewMoreLinkForHearings>
            <HearingCardsWithTitle
                viewOnly
                title="Upcoming Hearings"
                hearings={scheduledHearings}
                noHearingsMessage="There are no upcoming hearings." />
          </StyledColumnRowWithPadding>
        </StyledColumnRowWrapper>
        <StyledColumnRowWrapper>
          <StyledColumnRow>
            <StyledViewMoreLinkForCases to={`${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.CASES}`}>
              View more
            </StyledViewMoreLinkForCases>
            <CaseHistoryList
                loading={loading}
                title="Pending Cases on Arrest Date for Current PSA"
                caseHistory={caseHistoryForMostRecentPSA}
                chargeHistory={chargeHistoryForMostRecentPSA} />
          </StyledColumnRow>
        </StyledColumnRowWrapper>
      </StyledColumn>
    </Wrapper>
  );
};

export default PersonOverview;
