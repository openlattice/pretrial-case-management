/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';

import AboutPersonGeneral from '../person/AboutPersonGeneral';
import HearingCardsWithTitle from '../hearings/HearingCardsWithTitle';
import SubscriptionInfo from './SubscriptionInfo';
import CaseHistoryList from '../casehistory/CaseHistoryList';
import ChargeHistoryStats from '../casehistory/ChargeHistoryStats';
import LoadingSpinner from '../LoadingSpinner';
import PSASummary from '../../containers/review/PSASummary';
import ViewMoreLink from '../buttons/ViewMoreLink';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
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

let {
  MANUAL_PRETRIAL_CASES,
  RELEASE_RECOMMENDATIONS,
  STAFF,
  SUBSCRIPTION
} = APP_TYPES_FQNS;

MANUAL_PRETRIAL_CASES = MANUAL_PRETRIAL_CASES.toString();
RELEASE_RECOMMENDATIONS = RELEASE_RECOMMENDATIONS.toString();
STAFF = STAFF.toString();
SUBSCRIPTION = SUBSCRIPTION.toString();

type Props = {
  contactInfo :List<*, *>,
  psaNeighborsById :Map<*, *>,
  selectedPersonData :Map<*, *>,
  includesPretrialModule :boolean,
  loading :boolean,
  mostRecentPSA :Map<*, *>,
  mostRecentPSAEntityKeyId :string,
  neighbors :Map<*, *>,
  openDetailsModal :() => void,
  openUpdateContactModal :() => void,
  personId :string,
  readOnlyPermissions :boolean,
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
  mostRecentPSANeighbors,
  mostRecentPSAEntityKeyId,
  neighbors,
  personId,
  psaNeighborsById,
  scheduledHearings,
  selectedPersonData,
  includesPretrialModule,
  openDetailsModal,
  openUpdateContactModal,
  readOnlyPermissions
} :Props) => {

  const subscription = neighbors.getIn([SUBSCRIPTION, PSA_NEIGHBOR.DETAILS], Map());
  let arrestDate = getIdOrValue(
    mostRecentPSANeighbors, MANUAL_PRETRIAL_CASES, PROPERTY_TYPES.ARREST_DATE_TIME
  );
  if (!arrestDate) {
    arrestDate = getIdOrValue(
      mostRecentPSANeighbors, MANUAL_PRETRIAL_CASES, PROPERTY_TYPES.FILE_DATE
    );
  }

  const caseHistory = getCaseHistory(neighbors);
  const chargeHistory = getChargeHistory(neighbors);
  const lastEditDateForPSA = psaNeighborsById.getIn(
    [mostRecentPSAEntityKeyId, STAFF, 0, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0],
    ''
  );
  const notes = getIdOrValue(
    mostRecentPSANeighbors, RELEASE_RECOMMENDATIONS, PROPERTY_TYPES.RELEASE_RECOMMENDATION
  );
  const scores = mostRecentPSA.get(PSA_NEIGHBOR.DETAILS, List());
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
        {
          includesPretrialModule
            ? (
              <>
                <StyledColumnRowWrapper>
                  <StyledColumnRow>
                    <SubscriptionInfo
                        readOnlyPermissions={readOnlyPermissions}
                        subscription={subscription}
                        contactInfo={contactInfo}
                        person={selectedPersonData} />
                  </StyledColumnRow>
                </StyledColumnRowWrapper>
                <StyledColumnRowWrapper>
                  <StyledColumnRowWithPadding>
                    <StyledViewMoreLinkForHearings to={`${Routes.PERSON_DETAILS_ROOT}/${personId}${Routes.HEARINGS}`}>
                      View more
                    </StyledViewMoreLinkForHearings>
                    <HearingCardsWithTitle
                        readOnly
                        title="Upcoming Hearings"
                        hearings={scheduledHearings}
                        handleSelect={() => null}
                        noHearingsMessage="There are no upcoming hearings." />
                  </StyledColumnRowWithPadding>
                </StyledColumnRowWrapper>
                <StyledColumnRowWrapper>
                  <StyledColumnRowWithPadding>
                    <ChargeHistoryStats
                        pendingCharges={pendingCharges}
                        chargeHistory={chargeHistory} />
                  </StyledColumnRowWithPadding>
                </StyledColumnRowWrapper>
              </>
            ) : null
        }
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
        {
          includesPretrialModule
            ? (
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
            ) : null
        }
      </StyledColumn>
    </Wrapper>
  );
};

export default PersonOverview;
