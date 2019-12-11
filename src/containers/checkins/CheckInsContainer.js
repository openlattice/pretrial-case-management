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
import {
  Card,
  DatePicker,
  SearchInput,
  Table,
} from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faUserSlash } from '@fortawesome/pro-light-svg-icons';

import IncompleteCheckInRow from '../../components/checkins/IncompleteCheckInRow';
import ManualCheckInModal from './ManualCheckInModal';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { getEntityProperties } from '../../utils/DataUtils';
import { getCheckInsData } from '../../utils/CheckInUtils';
import { StyledTitleWrapper } from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHECKINS_ACTIONS, CHECKINS_DATA } from '../../utils/consts/redux/CheckInConsts';
import { HEARINGS_ACTIONS } from '../../utils/consts/redux/HearingsConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';

import { setCheckInDate, loadCheckInAppointmentsForDate } from './CheckInActions';

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

const StyledCard = styled(Card)`
  margin-bottom: 20px;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  height: 100%;
  font-size: 24px;
  display: flex;
`;

const TableHeader = styled.div`
  color: ${OL.GREY02};
  font-weight: 600;
  font-size: 20px;
  line-height: 27px;
  padding: 30px;
`;

const IconContainer = styled.div`
  width: 100%;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: ${OL.GREY02};
  border-top: 1px solid ${OL.GREY05};
  svg {
    padding-bottom: 15px;
  }
`;

const INITIAL_STATE = {
  manualCheckInModalOpen: false,
  manualCheckInPersonName: '',
  manualCheckInPersonEKID: '',
  searchTerm: ''
};

type Props = {
  checkInsDate :DateTime,
  checkInAppointmentNeighborsById :Map<*, *>,
  completeCheckInAppointments :List<*>,
  incompleteCheckInAppointments :List<*>,
  selectedOrganizationId :string,
  getPeopleNeighborsReqState :RequestState,
  loadCheckInAppointmentsForDateReqState :RequestState,
  loadCheckInNeighborsReqState :RequestState,
  loadHearingNeighborsReqState :RequestState,
  actions :{
    loadCheckInAppointmentsForDate :RequestSequence
  };
};

class CheckInsContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  openManualCheckInModal = data => this.setState({
    manualCheckInModalOpen: true,
    manualCheckInPersonName: data.personName,
    manualCheckInPersonEKID: data.personEKID
  });

  closeManualCheckInModal = () => this.setState({
    manualCheckInModalOpen: false,
    manualCheckInPersonName: '',
    manualCheckInPersonEKID: ''
  });

  renderManualCheckInModal = () => {
    const { manualCheckInModalOpen, manualCheckInPersonName, manualCheckInPersonEKID } = this.state;
    return (
      <ManualCheckInModal
          closeManualCheckInModal={this.closeManualCheckInModal}
          open={manualCheckInModalOpen && manualCheckInPersonEKID.length}
          personName={manualCheckInPersonName}
          personEKID={manualCheckInPersonEKID} />
    );
  }

  componentDidMount() {
    const { actions, selectedOrganizationId } = this.props;
    if (actions && selectedOrganizationId) {
      this.loadData(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedOrganizationId } = this.props;
    if (selectedOrganizationId !== nextProps.selectedOrganizationId) {
      this.loadData(nextProps);
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

  renderHeader = () => (
    <StyledTitleWrapper>
      <Title>Check-Ins</Title>
    </StyledTitleWrapper>
  );

  onDateChange = (dateStr) => {
    const { actions } = this.props;
    const date = DateTime.fromISO(dateStr);
    if (date.isValid) {
      actions.setCheckInDate({ date });
      actions.loadCheckInAppointmentsForDate({ date });
    }
  }

  renderToolbar = () => {
    const { searchTerm } = this.state;
    const { checkInsDate } = this.props;
    return (
      <ToolBar>
        <SearchInput value={searchTerm} name="searchTerm" onChange={this.handleInputChange} />
        <DatePicker value={checkInsDate} onChange={this.onDateChange} />
      </ToolBar>
    );
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

  renderIncompleteCheckins = () => {
    const { checkInsDate, incompleteCheckInAppointments } = this.props;
    const filteredIncompleteCheckInAppointments = this.getFilteredCheckIns(incompleteCheckInAppointments);
    const loading :boolean = this.isLoading();
    const pendingAreOverdue :boolean = checkInsDate < DateTime.local();
    const paginationOptions :number[] = filteredIncompleteCheckInAppointments.size > 5 ? [5, 10, 20] : [];
    const HeaderText :string = pendingAreOverdue ? 'Overdue' : 'Pending';
    const headers :Object[] = [
      { key: 'person', label: 'Name', cellStyle: { 'padding-left': '30px', color: OL.GREY02 } },
      { key: 'checkInNumber', label: 'Number', cellStyle: { color: OL.GREY02 } },
      { key: 'type', label: 'Type', cellStyle: { color: OL.GREY02 } },
      { sortable: false, cellStyle: { color: OL.GREY02 } }
    ];

    const components :Object = {
      Row: ({ data } :any) => (
        <IncompleteCheckInRow
            openManualCheckInModal={this.openManualCheckInModal}
            pendingAreOverdue={pendingAreOverdue}
            levels={this.openManualCheckInModal}
            data={data} />
      )
    };

    return (
      <StyledCard vertical noPadding>
        <TableHeader>{HeaderText}</TableHeader>
        {
          !filteredIncompleteCheckInAppointments.size
            ? (
              <IconContainer>
                <FontAwesomeIcon size="4x" icon={faCheckCircle} />
                {`No ${HeaderText} Check-Ins`}
              </IconContainer>
            )
            : (
              <Table
                  isLoading={loading}
                  components={components}
                  headers={headers}
                  data={filteredIncompleteCheckInAppointments}
                  rowsPerPageOptions={paginationOptions}
                  paginated={!!paginationOptions.length} />
            )
        }
      </StyledCard>
    );
  }

  renderCompleteCheckins = () => {
    const { completeCheckInAppointments } = this.props;
    const filteredCompleteCheckInAppointments :List = this.getFilteredCheckIns(completeCheckInAppointments);
    const loading :boolean = this.isLoading();
    const paginationOptions :number[] = filteredCompleteCheckInAppointments.size > 5 ? [5, 10, 20] : [];
    const headers :Object[] = [
      { key: 'checkInTime', label: 'Time', cellStyle: { 'padding-left': '30px', color: OL.GREY02 } },
      { key: 'personName', label: 'Name', cellStyle: { color: OL.GREY02 } },
      { key: 'checkInNumber', label: 'Number', cellStyle: { color: OL.GREY02 } },
      { key: 'type', label: 'Type', cellStyle: { color: OL.GREY02 } },
      { key: 'numAttempts', label: '# Attempts', cellStyle: { color: OL.GREY02 } }
    ];
    return (
      <StyledCard vertical noPadding>
        <TableHeader>Complete</TableHeader>
        {
          !filteredCompleteCheckInAppointments.size
            ? (
              <IconContainer>
                <FontAwesomeIcon size="4x" icon={faUserSlash} />
                No Complete Check-Ins
              </IconContainer>
            )
            : (
              <Table
                  isLoading={loading}
                  headers={headers}
                  data={filteredCompleteCheckInAppointments}
                  rowsPerPageOptions={paginationOptions}
                  paginated={!!paginationOptions.length} />
            )
        }
      </StyledCard>
    );
  }

  render() {
    return (
      <DashboardMainSection>
        {this.renderHeader()}
        {this.renderToolbar()}
        {this.renderIncompleteCheckins()}
        {this.renderCompleteCheckins()}
        {this.renderManualCheckInModal()}
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
    loadCheckInAppointmentsForDate
  }, dispatch)
});


export default connect(mapStateToProps, mapDispatchToProps)(CheckInsContainer);
