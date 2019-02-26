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
import TableWithPagination from '../../components/reminders/TableWithPagination';
import SearchAllBar from '../../components/SearchAllBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import PersonSubscriptionList from '../../components/subscription/PersonSubscriptionList';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import { Count } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES_FQNS } from '../../utils/consts/DataModelConsts';
import {
  APP,
  REMINDERS,
  SEARCH,
  STATE
} from '../../utils/consts/FrontEndStateConsts';

const remindersFqn = APP_TYPES_FQNS.REMINDERS.toString();
const reminderOptOutsFqn = APP_TYPES_FQNS.REMINDER_OPT_OUTS.toString();


import * as AppActionFactory from '../app/AppActionFactory';
import * as RemindersActionFactory from './RemindersActionFactory';
import * as SubscriptionsActionFactory from '../subscription/SubscriptionsActionFactory';
import * as PersonActionFactory from '../person/PersonActionFactory';


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

const TableWrapper = styled.div`
  width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 30px;
  margin-bottom: 15px;
  background: white;
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
  overflow: hidden;
`;

const TableTitle = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${OL.GREY01};
  padding-bottom: 20px;
  min-height: 56px;
`;

const TitleText = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  color: ${OL.GREY01};
`;

const ListContainer = styled.div`
  width: 100%;
  height: 400px;
  display: grid;
  grid-template-columns: 48% 48%;
  column-gap: 4%;
`;

type Props = {
  futureRemidners :Map<*, *>,
  failedReminderIds :Set<*, *>,
  isLoadingPeople :boolean,
  loadingPeopleWithNoContacts :boolean,
  loadingOptOuts :boolean,
  loadingOptOutNeighbors :boolean,
  loadingReminders :boolean,
  loadingReminderNeighbors :boolean,
  optOutMap :Map<*, *>,
  optOutNeighbors :Map<*, *>,
  pastReminders :Map<*, *>,
  peopleWithHearingsButNoContacts :Map<*, *>,
  reminderNeighborsById :Map<*, *>,
  remindersWithOpenPSA :Set<*>,
  reminderIds :Set<*, *>,
  searchResults :Set<*>,
  searchHasRun :boolean,
  selectedOrganizationId :boolean,
  actions :{
    loadPeopleWithHearingsButNoContacts :RequestSequence,
    loadRemindersforDate :RequestSequence,
    loadReminderNeighborsById :RequestSequence,
    searchPeopleByPhoneNumber :RequestSequence,
  };
};

class RemindersContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      selectedDate: moment()
    };
  }
  componentDidMount() {
    const { actions, selectedOrganizationId } = this.props;
    const { loadPeopleWithHearingsButNoContacts } = actions;
    if (selectedOrganizationId) {
      loadPeopleWithHearingsButNoContacts();
      this.loadData(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { actions, selectedOrganizationId } = this.props;
    const { loadPeopleWithHearingsButNoContacts } = actions;
    if (selectedOrganizationId !== nextProps.selectedOrganizationId) {
      loadPeopleWithHearingsButNoContacts();
      this.loadData(nextProps);
    }
  }

  loadData = (props) => {
    const { selectedDate } = this.state;
    const { actions, reminderIds } = props;
    const { loadOptOutsForDate, loadRemindersforDate } = actions;
    if (!reminderIds.size) {
      loadRemindersforDate({ date: selectedDate });
      loadOptOutsForDate({ date: selectedDate });
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSearchResults();
  }

  onDateChange = (dateStr) => {
    const { actions } = this.props;
    const date = moment(dateStr);
    const { loadOptOutsForDate, loadRemindersforDate } = actions;
    if (date.isValid()) {
      this.setState({ selectedDate: date });
      loadRemindersforDate({ date });
      loadOptOutsForDate({ date });
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
        <span>Reminder Date:</span>
        {this.renderDatePicker()}
      </SubToolbarWrapper>
    </ToolbarWrapper>
  )

  renderSearchToolbar = () => {
    const { actions } = this.props;
    return <SearchAllBar handleSubmit={actions.searchPeopleByPhoneNumber} />;
  }

  renderRemindersTable = (title, reminders, neighbors) => {
    const { remindersWithOpenPSA, loadingReminders, loadingReminderNeighbors } = this.props;
    return (
      <TableWithPagination
          loading={loadingReminders || loadingReminderNeighbors}
          title={title}
          entities={reminders}
          neighbors={neighbors}
          appTypeFqn={remindersFqn}
          remindersWithOpenPSA={remindersWithOpenPSA} />
    );
  }

  renderOptOutTable = () => {
    const {
      optOutMap,
      optOutNeighbors,
      loadingOptOuts,
      loadingOptOutNeighbors
    } = this.props;
    return (
      <TableWithPagination
          loading={loadingOptOuts || loadingOptOutNeighbors}
          title="Opt Outs"
          entities={optOutMap}
          neighbors={optOutNeighbors}
          appTypeFqn={reminderOptOutsFqn}
          remindersWithOpenPSA={Set()} />
    );
  }

  renderNoContactPersonList = (people) => {
    const { loadingPeopleWithNoContacts } = this.props;
    return (
      <TableWrapper>
        <TableTitle>
          <TitleText>
            People not receiving reminders
            <Count>{ people.size }</Count>
          </TitleText>
        </TableTitle>
        <PersonSubscriptionList
            noResultsText="No Results"
            loading={loadingPeopleWithNoContacts}
            people={people}
            noResults={!people.size} />
      </TableWrapper>
    );
  }

  renderSearchByContactList = (people) => {
    const { isLoadingPeople, searchHasRun } = this.props;
    const noResultsText = (searchHasRun && !people.size)
      ? 'No Results'
      : 'Search for People By Name or Phone Number';
    return (
      <TableWrapper>
        <TableTitle>
          <TitleText>
            {this.renderSearchToolbar()}
          </TitleText>
        </TableTitle>
        <PersonSubscriptionList
            includeContact
            noResultsText={noResultsText}
            loading={isLoadingPeople}
            people={people}
            noResults={!people.size} />
      </TableWrapper>
    );
  }

  renderLists = () => {
    const { peopleWithHearingsButNoContacts, searchResults } = this.props;
    return (
      <ListContainer>
        {this.renderSearchByContactList(searchResults)}
        {this.renderNoContactPersonList(peopleWithHearingsButNoContacts)}
      </ListContainer>
    );
  }

  renderSearch

  renderResults = () => {
    const {
      futureRemidners,
      pastReminders,
      failedReminderIds,
      reminderNeighborsById
    } = this.props;
    const failedReminders = pastReminders.filter((reminder, entityKeyId) => failedReminderIds.includes(entityKeyId));

    return (
      <ResultsWrapper>
        {
          futureRemidners.size ? this.renderRemindersTable(
            'Scheduled Reminders',
            futureRemidners,
            reminderNeighborsById
          ) : null
        }
        {
          this.renderRemindersTable(
            'Reminders',
            pastReminders,
            reminderNeighborsById
          )
        }
        {
          this.renderRemindersTable(
            'Failed Reminders',
            failedReminders,
            reminderNeighborsById
          )
        }
      </ResultsWrapper>
    );
  }

  render() {
    return (
      <DashboardMainSection>
        {this.renderLists()}
        {this.renderToolbar()}
        {this.renderOptOutTable()}
        {this.renderResults()}
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const reminders = state.get(STATE.REMINDERS);
  const search = state.get(STATE.SEARCH);

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
    [REMINDERS.LOADING_REMINDER_NEIGHBORS]: reminders.get(REMINDERS.LOADING_REMINDER_NEIGHBORS),
    [REMINDERS.PEOPLE_WITH_HEARINGS_BUT_NO_CONTACT]: reminders.get(REMINDERS.PEOPLE_WITH_HEARINGS_BUT_NO_CONTACT),
    [REMINDERS.LOADING_PEOPLE_NO_CONTACTS]: reminders.get(REMINDERS.LOADING_PEOPLE_NO_CONTACTS),
    [REMINDERS.OPT_OUTS]: reminders.get(REMINDERS.OPT_OUTS),
    [REMINDERS.OPT_OUT_NEIGHBORS]: reminders.get(REMINDERS.OPT_OUT_NEIGHBORS),
    [REMINDERS.OPT_OUTS_WITH_REASON]: reminders.get(REMINDERS.OPT_OUTS_WITH_REASON),
    [REMINDERS.LOADING_OPT_OUTS]: reminders.get(REMINDERS.LOADING_OPT_OUTS),
    [REMINDERS.LOADING_OPT_OUT_NEIGHBORS]: reminders.get(REMINDERS.LOADING_OPT_OUT_NEIGHBORS),

    [SEARCH.LOADING]: search.get(SEARCH.LOADING),
    [SEARCH.SEARCH_RESULTS]: search.get(SEARCH.SEARCH_RESULTS),
    [SEARCH.SEARCH_ERROR]: search.get(SEARCH.SEARCH_ERROR),
    [SEARCH.SEARCH_HAS_RUN]: search.get(SEARCH.SEARCH_HAS_RUN)
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

  Object.keys(PersonActionFactory).forEach((action :string) => {
    actions[action] = PersonActionFactory[action];
  });

  Object.keys(SubscriptionsActionFactory).forEach((action :string) => {
    actions[action] = SubscriptionsActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RemindersContainer);
