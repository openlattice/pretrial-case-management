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
import { Map } from 'immutable';
import {
  Card,
  DatePicker,
  SearchInput,
  Table,
} from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faUserSlash } from '@fortawesome/pro-light-svg-icons';

import IncompleteCheckInRow from '../../components/checkins/IncompleteCheckInRow';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import { OL } from '../../utils/consts/Colors';
import { getCheckInsData } from '../../utils/CheckInUtils';
import { StyledTitleWrapper } from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHECKINS_ACTIONS, CHECKINS_DATA } from '../../utils/consts/redux/CheckInConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';

import { setCheckInDate, loadCheckInAppointmentsForDate } from './CheckInActions';

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
  svg {
    padding-bottom: 15px;
    ${'' /* color: ${OL.GREY02}; */}
  }
`;

type Props = {
  checkInsDate :DateTime,
  completeCheckInAppointments :List<*>,
  incompleteCheckInAppointments :List<*>,
  selectedOrganizationId :string,
  actions :{
    loadCheckInAppointmentsForDate :RequestSequence
  };
};

class CheckInsContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      manualCheckInModalOpen: false
    };
  }

  openManualCheckInModal = () => this.setState({ manualCheckInModalOpen: true });
  closeManualCheckInModal = () => this.setState({ manualCheckInModalOpen: false });

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
    const { checkInsDate } = this.props;
    return (
      <ToolBar>
        <SearchInput />
        <DatePicker value={checkInsDate} onChange={this.onDateChange} />
      </ToolBar>
    );
  }

  renderIncompleteCheckins = () => {
    const { checkInsDate, incompleteCheckInAppointments } = this.props;
    const pendingAreOverdue :boolean = checkInsDate < DateTime.local();
    const paginationOptions :number[] = incompleteCheckInAppointments.size > 5 ? [5, 10, 20] : [];
    const HeaderText = pendingAreOverdue ? 'Overdue' : 'Pending';
    const headers = [
      { key: 'person', label: 'Name', cellStyle: { 'padding-left': '30px', color: OL.GREY02 } },
      { key: 'checkInNumber', label: 'Number', cellStyle: { color: OL.GREY02 } },
      { key: 'type', label: 'Type', cellStyle: { color: OL.GREY02 } },
      { sortable: false, cellStyle: { color: OL.GREY02 } }
    ];

    const components :Object = {
      Row: ({ data } :any) => (
        <IncompleteCheckInRow
            pendingAreOverdue={pendingAreOverdue}
            levels={this.openManualCheckInModal}
            data={data} />
      )
    };

    return (
      <StyledCard vertical noPadding>
        <TableHeader>{HeaderText}</TableHeader>
        {
          !incompleteCheckInAppointments.size
            ? (
              <IconContainer>
                <FontAwesomeIcon size="4x" icon={faCheckCircle} />
                {`No ${HeaderText} Check-Ins`}
              </IconContainer>
            )
            : (
              <Table
                  components={components}
                  headers={headers}
                  data={incompleteCheckInAppointments}
                  rowsPerPageOptions={paginationOptions}
                  paginated={!!paginationOptions.length} />
            )
        }
      </StyledCard>
    );
  }

  renderCompleteCheckins = () => {
    const { completeCheckInAppointments } = this.props;
    const paginationOptions :number[] = completeCheckInAppointments.size > 5 ? [5, 10, 20] : [];
    const headers = [
      { key: 'checkInTime', label: 'Time', cellStyle: { 'padding-left': '30px', color: OL.GREY02 } },
      { key: 'person', label: 'Name', cellStyle: { color: OL.GREY02 } },
      { key: 'checkInNumber', label: 'Number', cellStyle: { color: OL.GREY02 } },
      { key: 'type', label: 'Type', cellStyle: { color: OL.GREY02 } },
      { key: 'numAttempts', label: '# Attempts', cellStyle: { color: OL.GREY02 } }
    ];
    return (
      <StyledCard vertical noPadding>
        <TableHeader>Complete</TableHeader>
        {
          !completeCheckInAppointments.size
            ? (
              <IconContainer>
                <FontAwesomeIcon size="4x" icon={faUserSlash} />
                No Complete Check-Ins
              </IconContainer>
            )
            : (
              <Table
                  headers={headers}
                  data={completeCheckInAppointments}
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
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const checkIns = state.get(STATE.CHECK_INS);

  const checkInsDate = checkIns.get(CHECKINS_DATA.CHECK_INS_DATE);
  const checkInAppointmentsByDate = checkIns.get(CHECKINS_DATA.CHECK_INS_BY_DATE);
  const checkInAppointmentNeighborsById = checkIns.get(CHECKINS_DATA.CHECK_IN_NEIGHBORS_BY_ID);

  const checkInsDateString = checkInsDate.toISODate();
  const checkInAppointmentsForDate = checkInAppointmentsByDate.get(checkInsDateString, Map()).valueSeq();
  const { completeCheckInAppointments, incompleteCheckInAppointments } = getCheckInsData(
    checkInAppointmentsForDate,
    checkInAppointmentNeighborsById
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
    checkInsDateString,
    checkInAppointmentsByDate,
    checkInAppointmentNeighborsById,
    createCheckinAppointmentsReqState: getReqState(checkIns, CHECKINS_ACTIONS.CREATE_CHECK_IN_APPOINTMENTS),
    loadCheckInAppointmentsForDateReqState: getReqState(checkIns, CHECKINS_ACTIONS.LOAD_CHECKIN_APPOINTMENTS_FOR_DATE),
    loadCheckInNeighborsReqState: getReqState(checkIns, CHECKINS_ACTIONS.LOAD_CHECK_IN_NEIGHBORS),
    [CHECKINS_DATA.CHECK_INS_BY_ID]: checkIns.get(CHECKINS_DATA.CHECK_INS_BY_ID)
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
