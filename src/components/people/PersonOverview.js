/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import AboutPersonGeneral from '../person/AboutPersonGeneral';
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
  psaNeighborsById :Map<*, *>,
  selectedPersonData :Map<*, *>,
  loading :boolean,
  mostRecentPSA :Map<*, *>,
  mostRecentPSAEntityKeyId :string,
  neighbors :Map<*, *>,
  openDetailsModal :() => void,
  personId :string,
  downloadPSAReviewPDF :(values :{
    neighbors :Map<*, *>,
    scores :Map<*, *>
  }) => void
}

const StyledViewMoreLink = styled(ViewMoreLink)`
  transform: translateX(830px) translateY(50px);
`;

const PersonOverview = ({
  downloadPSAReviewPDF,
  loading,
  mostRecentPSA,
  mostRecentPSAEntityKeyId,
  neighbors,
  personId,
  psaNeighborsById,
  selectedPersonData,
  openDetailsModal
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
            <AboutPersonGeneral selectedPersonData={selectedPersonData} />
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
                downloadFn={downloadPSAReviewPDF}
                openDetailsModal={openDetailsModal} />
          </StyledColumnRow>
        </StyledColumnRowWrapper>
        <StyledColumnRowWrapper>
          <StyledColumnRow>
            <StyledViewMoreLink to={`${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.CASES}`}>
              View more
            </StyledViewMoreLink>
            <CaseHistoryList
                loading={loading}
                title="Case Summary"
                caseHistory={caseHistoryForMostRecentPSA}
                chargeHistory={chargeHistoryForMostRecentPSA} />
          </StyledColumnRow>
        </StyledColumnRowWrapper>
      </StyledColumn>
    </Wrapper>
  );
};

export default PersonOverview;
