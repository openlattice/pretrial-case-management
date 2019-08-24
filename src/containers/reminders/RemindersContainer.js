/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { fromJS, Map, Set } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Constants } from 'lattice';
import type { RequestSequence } from 'redux-reqseq';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faEdit,
  faFileDownload,
  faTimesCircle
} from '@fortawesome/pro-light-svg-icons';

import DatePicker from '../../components/datetime/DatePicker';
import TableWithPagination from '../../components/reminders/TableWithPagination';
import SearchAllBar from '../../components/SearchAllBar';
import PersonSubscriptionList from '../../components/subscription/PersonSubscriptionList';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import StyledButton from '../../components/buttons/StyledButton';
import { Count } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES } from '../../utils/consts/DataModelConsts';
import { FILTERS } from '../../utils/RemindersUtils';
import {
  MANUAL_REMINDERS,
  REMINDERS,
  PSA_NEIGHBOR,
  SEARCH
} from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import * as AppActionFactory from '../app/AppActionFactory';
import * as RemindersActionFactory from './RemindersActionFactory';
import * as ManualRemindersActionFactory from '../manualreminders/ManualRemindersActionFactory';
import * as SubscriptionActions from '../subscription/SubscriptionActions';
import * as PersonActions from '../person/PersonActions';

const { OPENLATTICE_ID_FQN } = Constants;
const peopleFqn = APP_TYPES.PEOPLE;
const remindersFqn = APP_TYPES.REMINDERS;
const reminderOptOutsFqn = APP_TYPES.REMINDER_OPT_OUTS;

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
  ${props => (
    props.grid
      ? (
        `display: grid;
           grid-template-columns: 75% 25%;`
      ) : ''
  )}
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

const StatusIconContainer = styled.div`
  pointer-events: none;
  margin: 5px 0;
`;

type Props = {
  failedReminderIds :Set<*, *>,
  failedManualReminderIds :Set<*, *>,
  isLoadingPeople :boolean,
  loadingOptOuts :boolean,
  loadingOptOutNeighbors :boolean,
  loadingReminders :boolean,
  loadingManualReminders :boolean,
  loadingReminderNeighbors :boolean,
  loadingRemindersActionList :boolean,
  loadingManualReminderNeighbors :boolean,
  loadingReminderPDF :boolean,
  optOutMap :Map<*, *>,
  optOutNeighbors :Map<*, *>,
  optOutPeopleIds :Set<*>,
  pastReminders :Map<*, *>,
  peopleReceivingManualReminders :Map<*, *>,
  reminderNeighborsById :Map<*, *>,
  remindersActionListDate :DateTime,
  remindersActionList :Map<*, *>,
  remindersLoaded :boolean,
  manualRemindersById :Map<*, *>,
  manualRemindersLoaded :boolean,
  manualReminderNeighborsById :Map<*, *>,
  searchResults :Set<*>,
  searchHasRun :boolean,
  selectedOrganizationId :boolean,
  successfulReminderIds :Set<*, *>,
  successfulManualReminderIds :Set<*, *>,
  actions :{
    loadRemindersforDate :RequestSequence,
    loadReminderNeighborsById :RequestSequence,
    searchPeopleByPhoneNumber :RequestSequence,
  };
};

class RemindersContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      filter: ''
    };
  }

  setFilter = e => this.setState({ filter: e.target.value });

  componentDidMount() {
    const { actions, selectedOrganizationId, remindersActionListDate } = this.props;
    const { loadRemindersActionList } = actions;
    if (selectedOrganizationId) {
      loadRemindersActionList({ remindersActionListDate });
      this.loadData(this.props);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      actions,
      selectedOrganizationId,
      remindersActionListDate
    } = this.props;
    const {
      loadManualRemindersForDate,
      loadOptOutsForDate,
      loadRemindersforDate,
      loadRemindersActionList
    } = actions;

    if (selectedOrganizationId !== prevProps.selectedOrganizationId) {
      loadRemindersActionList({ remindersActionListDate });
      this.loadData(this.props);
    }
    if (remindersActionListDate !== prevProps.remindersActionListDate) {
      loadRemindersActionList({ remindersActionListDate });
      loadManualRemindersForDate({ date: remindersActionListDate });
      loadRemindersforDate({ date: remindersActionListDate });
      loadOptOutsForDate({ date: remindersActionListDate });
    }
  }

  loadData = (props) => {
    const {
      actions,
      manualRemindersLoaded,
      remindersActionListDate,
      remindersLoaded
    } = props;
    const {
      loadManualRemindersForDate,
      loadOptOutsForDate,
      loadRemindersforDate
    } = actions;
    if (!manualRemindersLoaded) {
      loadManualRemindersForDate({ date: remindersActionListDate });
    }
    if (!remindersLoaded) {
      loadRemindersforDate({ date: remindersActionListDate });
      loadOptOutsForDate({ date: remindersActionListDate });
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSearchResults();
  }

  manualRemindersSubmitCallback = () => {
    const { actions, remindersActionListDate } = this.props;
    const { loadManualRemindersForDate } = actions;
    if (remindersActionListDate.isValid) {
      loadManualRemindersForDate({ date: remindersActionListDate });
    }
  }

  renderRemindersDatePicker = () => {
    const { actions, remindersActionListDate } = this.props;

    return (
      <DatePicker
          subtle
          value={remindersActionListDate.toISODate()}
          onChange={date => actions.setDateForRemindersActionList({ date })} />
    );
  }

  renderToolbar = () => {
    const { loadingRemindersActionList, loadingReminderPDF } = this.props;
    return (
      <ToolbarWrapper>
        <SubToolbarWrapper>
          <span>Reminder Date:</span>
          {this.renderRemindersDatePicker()}
        </SubToolbarWrapper>
        <StyledButton onClick={this.downloadReminderPDF} disabled={loadingRemindersActionList || loadingReminderPDF}>
          <FontAwesomeIcon color={OL.PURPLE03} icon={faFileDownload} />
          {' PDF Reminders'}
        </StyledButton>
      </ToolbarWrapper>
    );
  }
  renderSearchToolbar = () => {
    const { actions } = this.props;
    return <SearchAllBar handleSubmit={actions.searchPeopleByPhoneNumber} />;
  }

  renderRemindersTable = (title, reminders, neighbors, filters) => {
    const { filter } = this.state;
    const {
      loadingManualReminders,
      loadingReminders,
      loadingManualReminderNeighbors,
      loadingReminderNeighbors
    } = this.props;
    const loading = (
      loadingManualReminders
        || loadingReminders
        || loadingManualReminderNeighbors
        || loadingReminderNeighbors
    );
    return (
      <TableWithPagination
          loading={loading}
          title={title}
          entities={reminders}
          filter={filter}
          filters={filters}
          selectFilterFn={this.setFilter}
          neighbors={neighbors}
          appTypeFqn={remindersFqn} />
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
          appTypeFqn={reminderOptOutsFqn} />
    );
  }

  renderNoContactPersonList = (people) => {
    const { loadingRemindersActionList, loadingManualReminderNeighbors } = this.props;
    return (
      <TableWrapper>
        <TableTitle grid>
          <TitleText>
            People not receiving reminders
            { loadingRemindersActionList ? null : <Count>{ people.size }</Count> }
          </TitleText>
        </TableTitle>
        <PersonSubscriptionList
            includeManualRemindersButton
            noResultsText="No Results"
            loading={loadingRemindersActionList || loadingManualReminderNeighbors}
            submitCallback={this.manualRemindersSubmitCallback}
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
    let { remindersActionList } = this.props;
    const {
      peopleReceivingManualReminders,
      searchResults
    } = this.props;
    peopleReceivingManualReminders.forEach((personEntityKeyId) => {
      remindersActionList = remindersActionList.delete(personEntityKeyId);
    });
    return (
      <ListContainer>
        {this.renderSearchByContactList(searchResults)}
        {this.renderNoContactPersonList(remindersActionList)}
      </ListContainer>
    );
  }

  downloadReminderPDF = () => {
    const { remindersActionListDate } = this.props;
    const {
      actions,
      failedReminderIds,
      optOutPeopleIds,
      remindersActionList,
      reminderNeighborsById,
      successfulReminderIds
    } = this.props;
    const { bulkDownloadRemindersPDF } = actions;
    const peopleIdsWhoHaveRecievedReminders = successfulReminderIds.map((reminderId) => {
      const personEntityKeyId = reminderNeighborsById.getIn([
        reminderId,
        peopleFqn,
        PSA_NEIGHBOR.DETAILS,
        OPENLATTICE_ID_FQN,
        0], '');
      return personEntityKeyId;
    });
    const failedPeopleIds = failedReminderIds.map((reminderId) => {
      const personEntityKeyId = reminderNeighborsById.getIn([
        reminderId,
        peopleFqn,
        PSA_NEIGHBOR.DETAILS,
        OPENLATTICE_ID_FQN,
        0], '');
      return personEntityKeyId;
    }).filter(personEntityKeyId => !peopleIdsWhoHaveRecievedReminders.includes(personEntityKeyId));

    bulkDownloadRemindersPDF({
      date: remindersActionListDate,
      optOutPeopleIds,
      failedPeopleIds,
      remindersActionList: remindersActionList.keySeq()
    });
  }

  renderResults = () => {
    const { filter } = this.state;
    const {
      pastReminders,
      failedReminderIds,
      failedManualReminderIds,
      manualRemindersById,
      reminderNeighborsById,
      manualReminderNeighborsById,
      successfulReminderIds,
      successfulManualReminderIds
    } = this.props;

    let entities = pastReminders.merge(manualRemindersById);
    if (filter === FILTERS.FAILED) {
      entities = entities
        .filter((reminder, entityKeyId) => failedReminderIds
          .concat(failedManualReminderIds).includes(entityKeyId));
    }
    else if (filter === FILTERS.SUCCESSFUL) {
      entities = entities
        .filter((reminder, entityKeyId) => successfulReminderIds
          .concat(successfulManualReminderIds).includes(entityKeyId));
    }
    else if (filter === FILTERS.MANUAL) {
      entities = manualRemindersById;
    }

    const filters = fromJS({
      [FILTERS.ALL]: {
        label: FILTERS.ALL,
        value: ''
      },
      [FILTERS.FAILED]: {
        label: (
          <StatusIconContainer>
            {`${FILTERS.FAILED} `}
            <FontAwesomeIcon color={filter === FILTERS.FAILED ? OL.WHITE : OL.RED01} icon={faTimesCircle} />
          </StatusIconContainer>
        ),
        value: FILTERS.FAILED
      },
      [FILTERS.SUCCESSFUL]: {
        label: (
          <StatusIconContainer>
            {`${FILTERS.SUCCESSFUL} `}
            <FontAwesomeIcon color={filter === FILTERS.SUCCESSFUL ? OL.WHITE : OL.GREEN01} icon={faCheck} />
          </StatusIconContainer>
        ),
        value: FILTERS.SUCCESSFUL
      },
      [FILTERS.MANUAL]: {
        label: (
          <StatusIconContainer>
            {`${FILTERS.MANUAL} `}
            <FontAwesomeIcon color={filter === FILTERS.MANUAL ? OL.WHITE : OL.PURPLE03} icon={faEdit} />
          </StatusIconContainer>
        ),
        value: FILTERS.MANUAL
      }
    });

    return (
      <ResultsWrapper>
        {
          this.renderRemindersTable(
            'Reminders',
            entities,
            reminderNeighborsById.merge(manualReminderNeighborsById),
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
        {this.renderLists()}
        {this.renderOptOutTable()}
        {this.renderResults()}
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const reminders = state.get(STATE.REMINDERS);
  const manualReminders = state.get(STATE.MANUAL_REMINDERS);
  const search = state.get(STATE.SEARCH);

  return {
    // App
    [APP_DATA.ORGS]: app.get(APP_DATA.ORGS),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),

    // Reminders
    [REMINDERS.REMINDERS_ACTION_LIST_DATE]: reminders.get(REMINDERS.REMINDERS_ACTION_LIST_DATE),
    [REMINDERS.REMINDERS_ACTION_LIST]: reminders.get(REMINDERS.REMINDERS_ACTION_LIST),
    [REMINDERS.LOADING_REMINDERS_ACTION_LIST]: reminders.get(REMINDERS.LOADING_REMINDERS_ACTION_LIST),
    [REMINDERS.REMINDER_IDS]: reminders.get(REMINDERS.REMINDER_IDS),
    [REMINDERS.FUTURE_REMINDERS]: reminders.get(REMINDERS.FUTURE_REMINDERS),
    [REMINDERS.PAST_REMINDERS]: reminders.get(REMINDERS.PAST_REMINDERS),
    [REMINDERS.SUCCESSFUL_REMINDER_IDS]: reminders.get(REMINDERS.SUCCESSFUL_REMINDER_IDS),
    [REMINDERS.FAILED_REMINDER_IDS]: reminders.get(REMINDERS.FAILED_REMINDER_IDS),
    [REMINDERS.LOADING_REMINDERS]: reminders.get(REMINDERS.LOADING_REMINDERS),
    [REMINDERS.LOADED]: reminders.get(REMINDERS.LOADED),
    [REMINDERS.REMINDER_NEIGHBORS]: reminders.get(REMINDERS.REMINDER_NEIGHBORS),
    [REMINDERS.LOADING_REMINDER_NEIGHBORS]: reminders.get(REMINDERS.LOADING_REMINDER_NEIGHBORS),
    [REMINDERS.OPT_OUTS]: reminders.get(REMINDERS.OPT_OUTS),
    [REMINDERS.OPT_OUT_NEIGHBORS]: reminders.get(REMINDERS.OPT_OUT_NEIGHBORS),
    [REMINDERS.OPT_OUT_PEOPLE_IDS]: reminders.get(REMINDERS.OPT_OUT_PEOPLE_IDS),
    [REMINDERS.OPT_OUTS_WITH_REASON]: reminders.get(REMINDERS.OPT_OUTS_WITH_REASON),
    [REMINDERS.LOADING_OPT_OUTS]: reminders.get(REMINDERS.LOADING_OPT_OUTS),
    [REMINDERS.LOADING_OPT_OUT_NEIGHBORS]: reminders.get(REMINDERS.LOADING_OPT_OUT_NEIGHBORS),
    [REMINDERS.LOADING_REMINDER_PDF]: reminders.get(REMINDERS.LOADING_REMINDER_PDF),

    // Manual Reminders
    [MANUAL_REMINDERS.REMINDER_IDS]: manualReminders.get(MANUAL_REMINDERS.REMINDER_IDS),
    [MANUAL_REMINDERS.REMINDERS_BY_ID]: manualReminders.get(MANUAL_REMINDERS.REMINDERS_BY_ID),
    [MANUAL_REMINDERS.LOADING_MANUAL_REMINDERS]: manualReminders.get(MANUAL_REMINDERS.LOADING_MANUAL_REMINDERS),
    [MANUAL_REMINDERS.LOADED]: manualReminders.get(MANUAL_REMINDERS.LOADED),
    [MANUAL_REMINDERS.MANUAL_REMINDER_NEIGHBORS]: manualReminders.get(MANUAL_REMINDERS.MANUAL_REMINDER_NEIGHBORS),
    [MANUAL_REMINDERS.PEOPLE_RECEIVING_REMINDERS]: manualReminders.get(MANUAL_REMINDERS.PEOPLE_RECEIVING_REMINDERS),
    [MANUAL_REMINDERS.LOADING_REMINDER_NEIGHBORS]: manualReminders.get(MANUAL_REMINDERS.LOADING_REMINDER_NEIGHBORS),
    [MANUAL_REMINDERS.SUCCESSFUL_REMINDER_IDS]: manualReminders.get(MANUAL_REMINDERS.SUCCESSFUL_REMINDER_IDS),
    [MANUAL_REMINDERS.FAILED_REMINDER_IDS]: manualReminders.get(MANUAL_REMINDERS.FAILED_REMINDER_IDS),

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

  Object.keys(ManualRemindersActionFactory).forEach((action :string) => {
    actions[action] = ManualRemindersActionFactory[action];
  });

  Object.keys(PersonActions).forEach((action :string) => {
    actions[action] = PersonActions[action];
  });

  Object.keys(SubscriptionActions).forEach((action :string) => {
    actions[action] = SubscriptionActions[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RemindersContainer);
