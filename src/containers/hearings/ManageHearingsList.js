/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { Map, Set } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { OL } from '../../utils/consts/Colors';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { getEntityKeyId } from '../../utils/DataUtils';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { getReqState } from '../../utils/consts/redux/ReduxUtils';

import { loadPSAModal } from '../psamodal/PSAModalActionFactory';
import { clearSubmit } from '../../utils/submit/SubmitActionFactory';
import { loadHearingsForDate, setManageHearingsDate } from './HearingsActions';
import {
  bulkDownloadPSAReviewPDF,
  checkPSAPermissions,
  loadCaseHistory
} from '../review/ReviewActionFactory';

const { PEOPLE } = APP_TYPES;
const { COURTROOM } = PROPERTY_TYPES;


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

  renderHearingsAtTime = (time) => {
    const {
      countyFilter,
      courtroom,
      hearingsByTime,
      hearingsByCounty,
      hearingNeighborsById
    } = this.props;
    let hearingsByCourtroom = Map();
    const hearinIdsForCountyFilter = hearingsByCounty.get(countyFilter, Set());

    hearingsByTime.get(time).forEach((hearing) => {
      let shouldInclude = true;
      const room = hearing.getIn([COURTROOM, 0], '');
      const hearingEKID = getEntityKeyId(hearing);
      if (courtroom.length && room !== courtroom) shouldInclude = false;
      if (shouldInclude && !hearinIdsForCountyFilter.includes(hearingEKID)) shouldInclude = false;
      if (!countyFilter) shouldInclude = true;
      if (shouldInclude) {
        const person = hearingNeighborsById
          .getIn([hearingEKID, PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
        const personId = person.getIn([PROPERTY_TYPES.PERSON_ID, 0]);
        if (personId) {
          hearingsByCourtroom = hearingsByCourtroom
            .set(room, hearingsByCourtroom.get(room, Map()).set(personId, person));
        }
      }
    });

    if (!hearingsByCourtroom.size) return null;

    return (
      <HearingTime key={`${time}${courtroom}`}>
        <h1>{time}</h1>
        {
          hearingsByCourtroom.entrySeq()
            .map(([room, people]) => this.renderHearingRow(room, people, time)).toJS()
        }
      </HearingTime>
    );
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
  const edm = state.get(STATE.EDM);
  const hearings = state.get(STATE.HEARINGS);
  const courtDate = hearings.get(HEARINGS_DATA.COURT_DATE).toISODate();
  const hearingsByTime = hearings.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, courtDate], Map());
  const courtrooms = hearings.getIn([HEARINGS_DATA.COURTROOMS_BY_DATE, courtDate], Set());
  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Counties
    [COUNTIES_DATA.COUNTIES_BY_ID]: counties.get(COUNTIES_DATA.COUNTIES_BY_ID),

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

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),
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
