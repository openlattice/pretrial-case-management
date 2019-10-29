/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { Map, Set, List } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ManageHearingsListItem from '../../components/managehearings/ManageHearingsListItem';
import { OL } from '../../utils/consts/Colors';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { COURT, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';
import { DATE_FORMAT } from '../../utils/consts/DateTimeConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { getReqState } from '../../utils/consts/redux/ReduxUtils';
import { getEntityProperties } from '../../utils/DataUtils';

import { loadPSAModal } from '../psamodal/PSAModalActionFactory';
import { clearSubmit } from '../../utils/submit/SubmitActionFactory';
import { loadHearingsForDate, setManageHearingsDate } from './HearingsActions';
import {
  bulkDownloadPSAReviewPDF,
  checkPSAPermissions,
  loadCaseHistory
} from '../review/ReviewActionFactory';

const { COURTROOM, ENTITY_KEY_ID } = PROPERTY_TYPES;


const ManageHearingsList = styled.div`
  width: 100%;
  overflow: scroll;
  display: flex;
  flex-direction: column;
`;

const HeaderItem = styled.div`
  font-size: 16px;
  width: 100%;
  padding: 20px 30px;
`;

const HearingTime = styled(HeaderItem)`
  font-size: 18px;
  font-weight: 600;
  background: ${OL.GREY09};
`;

type Props = {
  courtroomFilter :string,
  countyFilter :string,
  courtroom :string,
  manageHearingsDate :DateTime,
  countiesById :Map<*, *>,
  hearingsByCounty :Map<*, *>,
  hearingsByCourtroom :Map<*, *>,
  hearingsByTime :Map<*, *>,
  hearingNeighborsById :Map<*, *>,
  loadHearingsForDateReqState :RequestState,
  loadHearingNeighborsReqState :RequestState,
  selectedOrganizationId :string,
  selectedOrganizationSettings :Map<*, *>,
  actions :{
    bulkDownloadPSAReviewPDF :({ peopleEntityKeyIds :string[] }) => void,
    changeHearingFilters :({ county? :string, courtroom? :string }) => void,
    checkPSAPermissions :() => void,
    clearSubmit :() => void,
    downloadPSAReviewPDF :(values :{
      neighbors :Map<*, *>,
      scores :Map<*, *>
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Map<*, *>
    }) => void,
    loadHearingsForDate :(date :Object) => void
  }
};

class ManageHearingsContainer extends React.Component<Props, *> {

  renderHearingsByTime = () => {
    const {
      courtroomFilter,
      countyFilter,
      hearingsByTime,
      hearingsByCounty,
      hearingNeighborsById,
      peopleIdsToOpenPSAIds,
      peopleReceivingReminders,
      peopleWithOpenPsas,
      peopleWithMultipleOpenPsas,
      psaEditDatesById
    } = this.props;
    const hearinIdsForCountyFilter = hearingsByCounty.get(countyFilter, Set());

    const hearingsByCourtroom = Map().withMutations((mutableMap) => {
      hearingsByTime.entrySeq().forEach(([time, hearings]) => {
        if (hearings.size) {
          hearings.forEach((hearing) => {
            let shouldInclude = true;
            const {
              [COURTROOM]: hearingCourtroom,
              [ENTITY_KEY_ID]: hearingEKID,
            } = getEntityProperties(hearing, [COURTROOM, ENTITY_KEY_ID]);
            const {
              [ENTITY_KEY_ID]: personEKID,
            } = getEntityProperties(hearing, [COURTROOM, ENTITY_KEY_ID]);
            const hearingNeighbors = hearingNeighborsById.get(hearingEKID, Map());
            if (courtroomFilter.length && hearingCourtroom !== courtroomFilter) shouldInclude = false;
            if (countyFilter.length && !hearinIdsForCountyFilter.includes(hearingEKID)) shouldInclude = false;
            if (shouldInclude) {
              const psaEKID = peopleIdsToOpenPSAIds.get(personEKID, '');
              const hasOpenPSA = peopleWithOpenPsas.has(personEKID);
              const isReceivingReminders = peopleReceivingReminders.includes(personEKID);
              const hasMultipleOpenPSAs = peopleWithMultipleOpenPsas.includes(personEKID);

              const completedDateFromAssociation = psaEditDatesById
                .getIn([psaEKID, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0], '');
              const dateTimeFromAssociation = psaEditDatesById
                .getIn([psaEKID, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], '');
              const editDateFromPSA = psaEditDatesById.getIn([psaEKID, PROPERTY_TYPES.DATE_TIME], '');
              const lastEditDateString = completedDateFromAssociation || dateTimeFromAssociation || editDateFromPSA;

              const lastEditDate = DateTime.fromISO(lastEditDateString).toFormat(DATE_FORMAT);

              mutableMap.setIn(
                [time, hearingCourtroom],
                mutableMap
                  .getIn([time, hearingCourtroom], List()).push(
                    <ManageHearingsListItem
                        hearingNeighbors={hearingNeighbors}
                        lastEditDate={lastEditDate}
                        hasOpenPSA={hasOpenPSA}
                        isReceivingReminders={isReceivingReminders}
                        hasMultipleOpenPSAs={hasMultipleOpenPSAs} />
                  )
              );
            }
          });
        }
      });
    });
  }

  render() {
    return (
      <ManageHearingsList>
      </ManageHearingsList>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const counties = state.get(STATE.COUNTIES);
  const court = state.get(STATE.COURT);
  const hearings = state.get(STATE.HEARINGS);
  const hearingDate = hearings.get(HEARINGS_DATA.MANAGE_HEARINGS_DATE).toISODate();
  const hearingsByTime = hearings.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, hearingDate], Map());
  const courtrooms = hearings.getIn([HEARINGS_DATA.COURTROOMS_BY_DATE, hearingDate], Set());
  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Counties
    [COUNTIES_DATA.COUNTIES_BY_ID]: counties.get(COUNTIES_DATA.COUNTIES_BY_ID),

    // Court
    [COURT.PEOPLE_WITH_OPEN_PSAS]: court.get(COURT.PEOPLE_WITH_OPEN_PSAS),
    [COURT.PEOPLE_WITH_MULTIPLE_OPEN_PSAS]: court.get(COURT.PEOPLE_WITH_MULTIPLE_OPEN_PSAS),
    [COURT.PEOPLE_RECEIVING_REMINDERS]: court.get(COURT.PEOPLE_RECEIVING_REMINDERS),
    [COURT.PSA_EDIT_DATES]: court.get(COURT.PSA_EDIT_DATES),
    [COURT.OPEN_PSA_IDS]: court.get(COURT.OPEN_PSA_IDS),
    [COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS]: court.get(COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS),

    // Hearings
    courtrooms,
    hearingsByTime,
    loadHearingsForDateReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE),
    loadHearingNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS),
    [HEARINGS_DATA.MANAGE_HEARINGS_DATE]: hearings.get(HEARINGS_DATA.MANAGE_HEARINGS_DATE),
    [HEARINGS_DATA.HEARINGS_BY_ID]: hearings.get(HEARINGS_DATA.HEARINGS_BY_ID),
    [HEARINGS_DATA.HEARINGS_BY_COUNTY]: hearings.get(HEARINGS_DATA.HEARINGS_BY_COUNTY),
    [HEARINGS_DATA.HEARINGS_BY_COURTROOM]: hearings.get(HEARINGS_DATA.HEARINGS_BY_COURTROOM),
    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    loadHearingsForDate,
    setManageHearingsDate,
    // PSA Modal actions
    loadPSAModal,
    // Review actions
    bulkDownloadPSAReviewPDF,
    checkPSAPermissions,
    loadCaseHistory,
    // Submit Actions
    clearSubmit
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageHearingsContainer);
