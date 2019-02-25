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
import RemindersTable from '../../components/reminders/RemindersTable';
import SearchAllBar from '../../components/SearchAllBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import PersonSubscriptionList from '../../components/subscription/PersonSubscriptionList';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import Pagination from '../../components/Pagination';
import { Count } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import {
  APP,
  REMINDERS,
  SEARCH,
  STATE
} from '../../utils/consts/FrontEndStateConsts';

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
  loadingReminders :boolean,
  loadingReminderNeighbors :boolean,
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
    const date = moment();
    const {
      actions,
      reminderIds,
      selectedOrganizationId
    } = this.props;
    const { loadPeopleWithHearingsButNoContacts, loadRemindersforDate } = actions;
    if (selectedOrganizationId) {
      loadPeopleWithHearingsButNoContacts();
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
    const { loadPeopleWithHearingsButNoContacts, loadRemindersforDate } = actions;
    if (selectedOrganizationId !== nextProps.selectedOrganizationId) {
      loadPeopleWithHearingsButNoContacts();
      if (!reminderIds.size) {
        loadRemindersforDate({ date });
      }
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSearchResults();
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

  renderTable = (title, reminders, neighbors) => {
    const { remindersWithOpenPSA } = this.props;
    return (
      <TableWrapper>
        <TableTitle>
          <TitleText>
            <span>{ title }</span>
            <Count>{ reminders.size }</Count>
          </TitleText>
        </TableTitle>
        <RemindersTable
            reminders={reminders}
            neighbors={neighbors}
            remindersWithOpenPSA={remindersWithOpenPSA}
            noResults={!reminders.size} />
      </TableWrapper>
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
            futureRemidners,
            reminderNeighborsById
          ) : null
        }
        {
          this.renderTable(
            'Past Reminders',
            pastReminders,
            reminderNeighborsById
          )
        }
        {
          this.renderTable(
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
