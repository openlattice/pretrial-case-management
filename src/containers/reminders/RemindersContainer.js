/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Map, Set } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import DatePicker from '../../components/datetime/DatePicker';
import RemindersTable from '../../components/reminders/RemindersTable'
import LoadingSpinner from '../../components/LoadingSpinner';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import Pagination from '../../components/Pagination';
import { APP, REMINDERS, STATE } from '../../utils/consts/FrontEndStateConsts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';

import * as AppActionFactory from '../app/AppActionFactory';
import * as RemindersActionFactory from './RemindersActionFactory';


const ToolbarWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 15px;
`;

const SubToolbarWrapper = styled(ToolbarWrapper)`
  margin-right: -30px;
`;

const ResultsWrapper = styled.div`
  width: 100%;
`;

const TableWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 30px;
  margin-bottom: 30px;
  background: white;
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
`;

const TableTitle = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${OL.GREY01};
  margin-bottom: 15px;
`;

type Props = {
  futureRemidners :Map<*, *>,
  pastReminders :Map<*, *>,
  successfulReminderIds :Set<*, *>,
  failedReminderIds :Set<*, *>,
  loadingReminders :boolean,
  loadingReminderNeighbors :boolean,
  reminderNeighborsById :Map<*, *>,
  remindersWithOpenPSA :Set<*, *>,
  reminderIds :Set<*, *>,
  selectedOrganizationId :boolean,
  actions :{
    loadRemindersforDate :RequestSequence,
    loadReminderNeighborsById :RequestSequence,
  };
};

const MAX_RESULTS = 20;

class RemindersContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      selectedDate: moment(),
    };
  }
  componentDidMount() {
    const date = moment();
    const {
      actions,
      reminderIds,
      selectedOrganizationId
    } = this.props;
    const { loadRemindersforDate } = actions;
    if (selectedOrganizationId) {
      if (!reminderIds.size) {
        loadRemindersforDate({ date });
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const date = moment();
    const {
      actions,
      reminderIds,
      selectedOrganizationId
    } = this.props;
    const { loadRemindersforDate } = actions;
    if (selectedOrganizationId !== nextProps.selectedOrganizationId) {
      if (!reminderIds.size) {
        loadRemindersforDate({ date });
      }
    }
  }

  onDateChange = (dateStr) => {
    const { actions } = this.props;
    const date = moment(dateStr);
    if (date.isValid()) {
      this.setState({ selectedDate: date });
      actions.loadRemindersforDate({ date });
    }
  }

  renderDatePicker = () => {
    const { selectedDate } = this.state;

    return (
      <DatePicker
          value={selectedDate.format('YYYY-MM-DD')}
          onChange={date => this.onDateChange(date)} />
    );
  }

  renderToolbar = () => (
    <ToolbarWrapper>
      <SubToolbarWrapper>
        Date:
        {this.renderDatePicker()}
      </SubToolbarWrapper>
    </ToolbarWrapper>
  )

  renderTable = (title, reminders, neighbors) => {
    const { remindersWithOpenPSA } = this.props;
    return (
      <TableWrapper>
        <TableTitle>{ title }</TableTitle>
        <RemindersTable
            reminders={reminders}
            neighbors={neighbors}
            remindersWithOpenPSA={remindersWithOpenPSA}
            noResults={!reminders.size} />
      </TableWrapper>
    );
  }

  renderResults = () => {
    const {
      futureRemidners,
      pastReminders,
      failedReminderIds,
      reminderNeighborsById,
      loadingReminders,
      loadingReminderNeighbors
    } = this.props;
    const failedReminders = pastReminders.filter((reminder, entityKeyId) => failedReminderIds.includes(entityKeyId));

    if (loadingReminders || loadingReminderNeighbors) {
      return <LoadingSpinner />;
    }
    return (
      <ResultsWrapper>
        {
          futureRemidners.size ? this.renderTable(
            'Scheduled Reminders',
            futureRemidners.valueSeq().sortBy(reminder => reminder.get(PROPERTY_TYPES.DATE_TIME, '')),
            reminderNeighborsById
          ) : null
        }
        {
          this.renderTable(
            'Past Reminders',
            pastReminders.valueSeq().sortBy(reminder => reminder.get(PROPERTY_TYPES.DATE_TIME, '')),
            reminderNeighborsById
          )
        }
        {
          this.renderTable(
            'Failed Reminders',
            failedReminders.valueSeq().sortBy(reminder => reminder.get(PROPERTY_TYPES.DATE_TIME, '')),
            reminderNeighborsById
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
  const reminders = state.get(STATE.REMINDERS);

  return {
    // App
    [APP.ORGS]: app.get(APP.ORGS),
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_TITLE]: app.get(APP.SELECTED_ORG_TITLE),

    // Charges
    [REMINDERS.REMINDER_IDS]: reminders.get(REMINDERS.REMINDER_IDS),
    [REMINDERS.FUTURE_REMINDERS]: reminders.get(REMINDERS.FUTURE_REMINDERS),
    [REMINDERS.PAST_REMINDERS]: reminders.get(REMINDERS.PAST_REMINDERS),
    [REMINDERS.SUCCESSFUL_REMINDER_IDS]: reminders.get(REMINDERS.SUCCESSFUL_REMINDER_IDS),
    [REMINDERS.FAILED_REMINDER_IDS]: reminders.get(REMINDERS.FAILED_REMINDER_IDS),
    [REMINDERS.LOADING_REMINDERS]: reminders.get(REMINDERS.LOADING_REMINDERS),
    [REMINDERS.REMINDER_NEIGHBORS]: reminders.get(REMINDERS.REMINDER_NEIGHBORS),
    [REMINDERS.REMINDERS_WITH_OPEN_PSA_IDS]: reminders.get(REMINDERS.REMINDERS_WITH_OPEN_PSA_IDS),
    [REMINDERS.LOADING_REMINDER_NEIGHBORS]: reminders.get(REMINDERS.LOADING_REMINDER_NEIGHBORS)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(AppActionFactory).forEach((action :string) => {
    actions[action] = AppActionFactory[action];
  });

  Object.keys(RemindersActionFactory).forEach((action :string) => {
    actions[action] = RemindersActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RemindersContainer);
