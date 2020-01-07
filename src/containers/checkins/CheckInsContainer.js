/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { DateTime } from 'luxon';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Map, List, Seq } from 'immutable';
import { Card, DatePicker, SearchInput } from 'lattice-ui-kit';

import CompleteCheckInsTable from '../../components/checkins/CompleteCheckInsTable';
import IncompleteCheckInsTable from '../../components/checkins/IncompleteCheckInsTable';
import ManualCheckInModal from './ManualCheckInModal';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { getCheckInsData } from '../../utils/CheckInUtils';
import { StyledTitleWrapper } from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHECKINS_ACTIONS, CHECKINS_DATA } from '../../utils/consts/redux/CheckInConsts';
import { HEARINGS_ACTIONS } from '../../utils/consts/redux/HearingsConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';

import { resetCheckInAction, setCheckInDate, loadCheckInAppointmentsForDate } from './CheckInActions';

const { PEOPLE } = APP_TYPES;
const { FIRST_NAME, LAST_NAME, MIDDLE_NAME } = PROPERTY_TYPES;


const ToolBar = styled(Card)`
  margin-bottom: 20px;
  padding: 30px;
  width: 100%;
  display: grid;
  grid-template-columns: 75% 25%;
  input {
    margin-right: 10px
  }
`;

const Title = styled.div`
  height: 100%;
  font-size: 24px;
  display: flex;
`;

const INITIAL_STATE = {
  manualCheckInModalOpen: false,
  manualCheckInPersonName: '',
  manualCheckInPersonEKID: '',
  searchTerm: ''
};

type Props = {
  actions :{
    loadCheckInAppointmentsForDate :RequestSequence;
    resetCheckInAction :() => void;
    setCheckInDate :() => void;
  };
  checkInsDate :DateTime;
  checkInAppointmentNeighborsById :Map;
  completeCheckInAppointments :List;
  getPeopleNeighborsReqState :RequestState;
  incompleteCheckInAppointments :List;
  loadCheckInAppointmentsForDateReqState :RequestState;
  loadCheckInNeighborsReqState :RequestState;
  loadHearingNeighborsReqState :RequestState;
  selectedOrganizationId :string;
};

class CheckInsContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  openManualCheckInModal = (data) => this.setState({
    manualCheckInModalOpen: true,
    manualCheckInPersonName: data.personName,
    manualCheckInPersonEKID: data.personEKID
  });

  closeManualCheckInModal = () => {
    const { actions } = this.props;
    this.setState({
      manualCheckInModalOpen: false,
      manualCheckInPersonName: '',
      manualCheckInPersonEKID: ''
    });
    actions.resetCheckInAction({ actionType: CHECKINS_ACTIONS.CREATE_MANUAL_CHECK_IN });
  };

  componentDidMount() {
    const { actions, selectedOrganizationId } = this.props;
    if (actions && selectedOrganizationId) {
      this.loadData(this.props);
    }
  }

  componentDidUpdate(prevProps) {
    const { selectedOrganizationId } = this.props;
    if (selectedOrganizationId !== prevProps.selectedOrganizationId) {
      this.loadData(prevProps);
    }
  }

  loadData = (props) => {
    const { actions, checkInsDate } = props;
    if (checkInsDate.isValid) {
      actions.loadCheckInAppointmentsForDate({ date: checkInsDate });
    }
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  onDateChange = (dateStr) => {
    const { actions } = this.props;
    const date = DateTime.fromISO(dateStr);
    if (date.isValid) {
      actions.setCheckInDate({ date });
      actions.loadCheckInAppointmentsForDate({ date });
    }
  }

  isLoading = () => {
    const {
      getPeopleNeighborsReqState,
      loadCheckInAppointmentsForDateReqState,
      loadCheckInNeighborsReqState,
      loadHearingNeighborsReqState,
    } = this.props;
    return requestIsPending(getPeopleNeighborsReqState)
          || requestIsPending(loadCheckInAppointmentsForDateReqState)
          || requestIsPending(loadCheckInNeighborsReqState)
          || requestIsPending(loadHearingNeighborsReqState);
  }

  getFilteredCheckIns = (checkIns) => {
    let filteredCheckIns :List = checkIns;
    const { searchTerm } = this.state;
    const { checkInAppointmentNeighborsById } = this.props;
    if (searchTerm) {
      const searchWords :string[] = searchTerm.split(' ');
      filteredCheckIns = filteredCheckIns.filter((checkIn) => {
        const { entityKeyId } = checkIn;
        const person = checkInAppointmentNeighborsById.getIn([entityKeyId, PEOPLE], Map());
        let matchesFirstName = false;
        let matchesLastName = false;
        let matchesMiddleName = false;
        const {
          [FIRST_NAME]: firstName,
          [MIDDLE_NAME]: middleName,
          [LAST_NAME]: lastName
        } = getEntityProperties(person, [FIRST_NAME, MIDDLE_NAME, LAST_NAME]);
        searchWords.forEach((word) => {
          if (firstName && firstName.toLowerCase().includes(word.toLowerCase())) matchesFirstName = true;
          if (lastName && lastName.toLowerCase().includes(word.toLowerCase())) matchesLastName = true;
          if (middleName && middleName.toLowerCase().includes(word.toLowerCase())) matchesMiddleName = true;
        });
        return matchesFirstName || matchesLastName || matchesMiddleName;
      });
    }
    return filteredCheckIns;
  }

  render() {
    const {
      manualCheckInModalOpen,
      manualCheckInPersonName,
      manualCheckInPersonEKID,
      searchTerm
    } = this.state;
    const {
      checkInsDate,
      completeCheckInAppointments,
      incompleteCheckInAppointments
    } = this.props;
    const filteredCompleteCheckInAppointments :List = this.getFilteredCheckIns(completeCheckInAppointments);
    const filteredIncompleteCheckInAppointments :List = this.getFilteredCheckIns(incompleteCheckInAppointments);
    const loading = this.isLoading();
    return (
      <DashboardMainSection>
        <StyledTitleWrapper>
          <Title>Check-Ins</Title>
        </StyledTitleWrapper>
        <ToolBar>
          <SearchInput value={searchTerm} name="searchTerm" onChange={this.handleInputChange} />
          <DatePicker value={checkInsDate} onChange={this.onDateChange} />
        </ToolBar>
        <IncompleteCheckInsTable
            checkInsDate={checkInsDate}
            incompleteCheckInAppointments={filteredIncompleteCheckInAppointments}
            loading={loading}
            openManualCheckInModal={this.openManualCheckInModal} />
        <CompleteCheckInsTable
            completeCheckInAppointments={filteredCompleteCheckInAppointments}
            loading={loading} />
        <ManualCheckInModal
            closeManualCheckInModal={this.closeManualCheckInModal}
            open={manualCheckInModalOpen && manualCheckInPersonEKID.length}
            personName={manualCheckInPersonName}
            personEKID={manualCheckInPersonEKID} />
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const checkIns = state.get(STATE.CHECK_INS);
  const hearings = state.get(STATE.HEARINGS);
  const people = state.get(STATE.PEOPLE);

  const checkInsDate :DateTime = checkIns.get(CHECKINS_DATA.CHECK_INS_DATE);
  const checkInAppointmentsByDate :Map = checkIns.get(CHECKINS_DATA.CHECK_INS_BY_DATE);
  const checkInAppointmentNeighborsById :Map = checkIns.get(CHECKINS_DATA.CHECK_IN_NEIGHBORS_BY_ID);
  const peopleNeighborsById :Map = people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID);

  const checkInsDateString :string = checkInsDate.toISODate();
  const checkInAppointmentsForDate :Seq = checkInAppointmentsByDate.get(checkInsDateString, Map()).valueSeq();
  const { completeCheckInAppointments, incompleteCheckInAppointments } = getCheckInsData(
    checkInAppointmentsForDate,
    checkInAppointmentNeighborsById,
    peopleNeighborsById
  );
  return {
    // App
    [APP_DATA.ORGS]: app.get(APP_DATA.ORGS),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),

    // CheckIns
    completeCheckInAppointments,
    incompleteCheckInAppointments,
    checkInsDate,
    checkInAppointmentNeighborsById,
    loadCheckInAppointmentsForDateReqState: getReqState(checkIns, CHECKINS_ACTIONS.LOAD_CHECKIN_APPOINTMENTS_FOR_DATE),
    loadCheckInNeighborsReqState: getReqState(checkIns, CHECKINS_ACTIONS.LOAD_CHECK_IN_NEIGHBORS),
    [CHECKINS_DATA.CHECK_INS_BY_ID]: checkIns.get(CHECKINS_DATA.CHECK_INS_BY_ID),

    // People
    getPeopleNeighborsReqState: getReqState(people, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS),

    // Hearings
    loadHearingNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // CheckIns Actions
    setCheckInDate,
    loadCheckInAppointmentsForDate,
    resetCheckInAction
  }, dispatch)
});


export default connect(mapStateToProps, mapDispatchToProps)(CheckInsContainer);
