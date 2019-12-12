/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, List } from 'immutable';

import EventTimeline from '../person/EventTimeline';
import EnrollStatusBanner from '../enroll/EnrollStatusBanner';
import SubscriptionInfo from '../subscription/SubscriptionInfo';
import CaseHistoryList from '../casehistory/CaseHistoryList';
import ChargeHistoryStats from '../casehistory/ChargeHistoryStats';
import LogoLoader from '../LogoLoader';
import PSASummary from '../../containers/review/PSASummary';
import ViewMoreLink from '../buttons/ViewMoreLink';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getIdOrValue } from '../../utils/DataUtils';
import { getStatusForCheckInAppointments } from '../../utils/CheckInUtils';
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

const {
  CHECKIN_APPOINTMENTS,
  CHECKINS,
  HEARINGS,
  MANUAL_PRETRIAL_CASES,
  RELEASE_RECOMMENDATIONS,
  STAFF,
  SUBSCRIPTION
} = APP_TYPES;

type Props = {
  contactInfo :List<*, *>,
  includesPretrialModule :boolean,
  loading :boolean,
  mostRecentPSA :Map<*, *>,
  mostRecentPSAEntityKeyId :string,
  mostRecentPSANeighbors :Map<*, *>,
  neighbors :Map<*, *>,
  openDetailsModal :() => void,
  courtRemindersEnabled :boolean,
  personEKID :string,
  psaNeighborsById :Map<*, *>,
  readOnlyPermissions :boolean,
  selectedPersonData :Map<*, *>,
  entitySetIdsToAppType :Map<*, *>,
  settingsIncludeVoiceEnroll :boolean,
  personReminders :Map<*, *>,
  personVoiceProfile :Map<*, *>
}

const StyledViewMoreLinkForCases = styled(ViewMoreLink)`
  position: absolute;
  transform: translateX(830px) translateY(15px);
`;

const StyledColumnRowWithPadding = styled(StyledColumnRow)`
  padding: 20px 30px 30px;
`;

const PersonOverview = ({
  contactInfo,
  courtRemindersEnabled,
  loading,
  mostRecentPSA,
  mostRecentPSANeighbors,
  mostRecentPSAEntityKeyId,
  neighbors,
  personEKID,
  psaNeighborsById,
  selectedPersonData,
  includesPretrialModule,
  openDetailsModal,
  readOnlyPermissions,
  personVoiceProfile,
  personReminders,
  settingsIncludeVoiceEnroll,
  entitySetIdsToAppType
} :Props) => {
  const checkInAppointments = neighbors.get(CHECKIN_APPOINTMENTS, List());
  const checkIns = neighbors.get(CHECKINS, List());
  const staff = mostRecentPSANeighbors.get(STAFF, List());
  const checkInStatusById = getStatusForCheckInAppointments(checkInAppointments, checkIns);
  const personHearings = mostRecentPSANeighbors.get(HEARINGS, List());
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

  const renderSubscriptionInfo = () => (
    courtRemindersEnabled
      ? (
        <SubscriptionInfo
            readOnly={readOnlyPermissions}
            subscription={subscription}
            contactInfo={contactInfo}
            person={selectedPersonData} />
      ) : null
  );

  const renderEnrollStatusBanner = () => (
    settingsIncludeVoiceEnroll
      ? (
        <StyledColumnRowWrapper>
          <StyledColumnRow withPadding>
            <EnrollStatusBanner person={selectedPersonData} personVoiceProfile={personVoiceProfile} />
          </StyledColumnRow>
        </StyledColumnRowWrapper>
      ) : null
  );

  if (loading) {
    return <LogoLoader loadingText="Loading Person Details..." />;
  }
  return (
    <Wrapper>
      <StyledColumn>
        {
          includesPretrialModule
            ? (
              <>
                {renderSubscriptionInfo()}
                {renderEnrollStatusBanner()}
                <EventTimeline
                    scores={scores}
                    staff={staff}
                    entitySetIdsToAppType={entitySetIdsToAppType}
                    hearings={personHearings}
                    checkInAppointments={checkInAppointments}
                    checkInStatusById={checkInStatusById}
                    personReminders={personReminders} />
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
                  <StyledViewMoreLinkForCases to={`${Routes.PERSON_DETAILS_ROOT}/${personEKID}${Routes.CASES}`}>
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
