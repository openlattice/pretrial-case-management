/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fromJS, Map, List } from 'immutable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglassHalf, faMicrophoneAlt } from '@fortawesome/pro-light-svg-icons';
import type { RequestSequence } from 'redux-reqseq';

import DatePicker from '../../components/datetime/DatePicker';
import TableWithPagination from '../../components/reminders/TableWithPagination';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { FILTERS, RESULT_TYPE } from '../../utils/consts/CheckInConsts';
import { getEntityProperties } from '../../utils/DataUtils';
import { CHECK_IN, SEARCH } from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import * as CheckInsActionFactory from './CheckInsActionFactory';
import * as PersonActions from '../person/PersonActions';

const { CHECKINS, PEOPLE, HEARINGS } = APP_TYPES;

const {
  COMPLETED_DATE_TIME,
  RESULT,
  START_DATE,
  END_DATE
} = PROPERTY_TYPES;

const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  margin: 15px 0;
  background: white;
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
  padding: 15px 30px;
  width: 100%;
`;

const SubToolbarWrapper = styled.div`
  flex-wrap: nowrap;
  width: max-content;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  span {
    width: 100%;
  }
`;

const ResultsWrapper = styled.div`
  width: 100%;
`;

const StatusIconContainer = styled.div`
  display: flex;
  flex-direction: row;
  pointer-events: none;
  margin: 5px 0;
`;

const StatusText = styled.div`
  margin-right: 10px;
`;

type Props = {
  loadingCheckIns :boolean,
  loadingCheckInNieghbors :boolean,
  checkInsById :Map<*, *>,
  checkInNeighborsById :Map<*, *>,
  selectedOrganizationId :string,
  actions :{
    loadCheckInAppointmentsForDate :RequestSequence
  };
};

class CheckInsContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      selectedDate: moment(),
      filter: ''
    };
  }

  setFilter = e => this.setState({ filter: e.target.value });

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
    const { selectedDate } = this.state;
    const { actions, checkInsLoaded } = props;
    const { loadCheckInAppointmentsForDate } = actions;
    if (!checkInsLoaded) {
      loadCheckInAppointmentsForDate({ date: selectedDate });
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSearchResults();
  }

  onDateChange = (dateStr) => {
    const { actions } = this.props;
    const date = moment(dateStr);
    const { loadCheckInAppointmentsForDate } = actions;
    if (date.isValid()) {
      this.setState({ selectedDate: date });
      loadCheckInAppointmentsForDate({ date });
    }
  }

  renderDatePicker = () => {
    const { selectedDate } = this.state;

    return (
      <DatePicker
          subtle
          value={selectedDate.format('YYYY-MM-DD')}
          onChange={date => this.onDateChange(date)} />
    );
  }

  renderToolbar = () => (
    <ToolbarWrapper>
      <SubToolbarWrapper>
        <span>Check-in Date:</span>
        {this.renderDatePicker()}
      </SubToolbarWrapper>
    </ToolbarWrapper>
  );

  renderCheckInsTable = (title, checkIns, neighbors, filters) => {
    const { filter } = this.state;
    const { loadingCheckIns, loadingCheckInNieghbors } = this.props;
    const loading = loadingCheckIns || loadingCheckInNieghbors;
    return (
      <TableWithPagination
          loading={loading}
          title={title}
          entities={checkIns}
          filter={filter}
          filters={filters}
          selectFilterFn={this.setFilter}
          neighbors={neighbors}
          appTypeFqn={APP_TYPES.CHECKIN_APPOINTMENTS} />
    );
  }

  getCheckInFilter = (checkInFilter, color, icon) => {
    const { filter } = this.state;
    return {
      label: (
        <StatusIconContainer>
          <StatusText>{`${checkInFilter}`}</StatusText>
          <FontAwesomeIcon color={filter === checkInFilter ? OL.WHITE : color} icon={icon} />
        </StatusIconContainer>
      ),
      value: checkInFilter
    };
  }

  renderResults = () => {
    const { filter } = this.state;
    const {
      checkInsById,
      checkInNeighborsById
    } = this.props;

    let entities = checkInsById;
    entities = entities.filter((checkInAppointment, entityKeyId) => {
      const checkInAppointmentNeighbors = checkInNeighborsById.get(entityKeyId, Map());
      const person = checkInAppointmentNeighbors.get(PEOPLE, Map());
      const hearings = checkInAppointmentNeighbors.get(HEARINGS, List());
      if (!person.size && !hearings.size) return false;
      const {
        [START_DATE]: startDate,
        [END_DATE]: endDate
      } = getEntityProperties(checkInAppointment, [START_DATE, END_DATE]);

      const checkIns = checkInAppointmentNeighbors.get(CHECKINS, List());
      let successfulCheckIns = List();
      let failedCheckIns = List();
      checkIns.forEach((checkIn) => {
        const {
          [COMPLETED_DATE_TIME]: checkInTime,
          [RESULT]: result
        } = getEntityProperties(checkIn, [COMPLETED_DATE_TIME, RESULT]);
        const validCheckInTime = moment(checkInTime).isBetween(startDate, endDate);
        const checkInAccepted = result === RESULT_TYPE.ACCEPT;
        if (validCheckInTime && checkInAccepted) successfulCheckIns = successfulCheckIns.push(checkIn);
        else failedCheckIns = failedCheckIns.push(checkIn);
      });
      let filterResult = true;
      switch (filter) {
        case FILTERS.FAILED:
          filterResult = moment().isAfter(endDate)
          || (!successfulCheckIns.size && failedCheckIns.size);
          break;
        case FILTERS.SUCCESSFUL:
          filterResult = !!successfulCheckIns.size;
          break;
        case FILTERS.PENDING:
          filterResult = successfulCheckIns.size === 0
            && failedCheckIns.size === 0
            && moment().isBefore(endDate);
          break;
        default:
          break;
      }
      return filterResult;
    });

    const filters = fromJS({
      [FILTERS.ALL]: {
        label: FILTERS.ALL,
        value: ''
      },
      [FILTERS.FAILED]: this.getCheckInFilter(FILTERS.FAILED, OL.ORANGE01, faMicrophoneAlt),
      [FILTERS.SUCCESSFUL]: this.getCheckInFilter(FILTERS.SUCCESSFUL, OL.GREEN01, faMicrophoneAlt),
      [FILTERS.PENDING]: this.getCheckInFilter(FILTERS.PENDING, OL.PURPLE03, faHourglassHalf)
    });

    return (
      <ResultsWrapper>
        {
          this.renderCheckInsTable(
            'Reminders',
            entities,
            checkInNeighborsById,
            filters
          )
        }
      </ResultsWrapper>
    );
  }

  render() {
    return (
      <DashboardMainSection>
        {this.renderToolbar()}
        {this.renderResults()}
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const checkIns = state.get(STATE.CHECK_INS);
  const search = state.get(STATE.SEARCH);

  return {
    // App
    [APP_DATA.ORGS]: app.get(APP_DATA.ORGS),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),

    // Reminders
    [CHECK_IN.CHECK_INS_LOADED]: checkIns.get(CHECK_IN.CHECK_INS_LOADED),
    [CHECK_IN.LOADING_CHECK_INS]: checkIns.get(CHECK_IN.LOADING_CHECK_INS),
    [CHECK_IN.CHECK_IN_IDS]: checkIns.get(CHECK_IN.CHECK_IN_IDS),
    [CHECK_IN.CHECK_INS_BY_ID]: checkIns.get(CHECK_IN.CHECK_INS_BY_ID),
    [CHECK_IN.LOADING_CHECK_IN_NEIGHBORS]: checkIns.get(CHECK_IN.LOADING_CHECK_IN_NEIGHBORS),
    [CHECK_IN.CHECK_IN_NEIGHBORS_BY_ID]: checkIns.get(CHECK_IN.CHECK_IN_NEIGHBORS_BY_ID),
    [CHECK_IN.SUCCESSFUL_IDS]: checkIns.get(CHECK_IN.SUCCESSFUL_IDS),
    [CHECK_IN.FAILED_IDS]: checkIns.get(CHECK_IN.FAILED_IDS),
    [CHECK_IN.PENDING_IDS]: checkIns.get(CHECK_IN.PENDING_IDS),

    [SEARCH.LOADING]: search.get(SEARCH.LOADING),
    [SEARCH.SEARCH_RESULTS]: search.get(SEARCH.SEARCH_RESULTS),
    [SEARCH.SEARCH_ERROR]: search.get(SEARCH.SEARCH_ERROR),
    [SEARCH.SEARCH_HAS_RUN]: search.get(SEARCH.SEARCH_HAS_RUN)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(CheckInsActionFactory).forEach((action :string) => {
    actions[action] = CheckInsActionFactory[action];
  });

  Object.keys(PersonActions).forEach((action :string) => {
    actions[action] = PersonActions[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CheckInsContainer);
