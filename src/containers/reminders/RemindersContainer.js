/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Banner, Modal, Select } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Constants } from 'lattice';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';

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
import { Count, WarningText } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { FILTERS } from '../../utils/RemindersUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { MANUAL_REMINDERS, PSA_NEIGHBOR, SEARCH } from '../../utils/consts/FrontEndStateConsts';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import { REMINDERS_ACTIONS, REMINDERS_DATA } from '../../utils/consts/redux/RemindersConsts';
import {
  getError,
  getReqState,
  requestIsFailure,
  requestIsPending,
  requestIsSuccess
} from '../../utils/consts/redux/ReduxUtils';

import * as AppActionFactory from '../app/AppActionFactory';
import * as RemindersActionFactory from './RemindersActionFactory';
import * as ManualRemindersActionFactory from '../manualreminders/ManualRemindersActionFactory';
import * as SubscriptionActions from '../subscription/SubscriptionActions';
import * as PersonActions from '../person/PersonActions';

const { OPENLATTICE_ID_FQN } = Constants;
const { PREFERRED_COUNTY } = SETTINGS;

const {
  PEOPLE,
  REMINDERS,
  REMINDER_OPT_OUTS
} = APP_TYPES;

const {
  ENTITY_KEY_ID,
  NAME
} = PROPERTY_TYPES;

const ErrorText = styled.div`
  text-align: center;
  display: flex;
  padding: 40px 0 0;
  font-size: 18px;
  height: 100%;
  max-width: 350px;
`;

const ListContainer = styled.div`
  width: 100%;
  height: 400px;
  display: grid;
  grid-template-columns: 48% 48%;
  column-gap: 4%;
`;

const ResultsWrapper = styled.div`
  width: 100%;
`;

const StatusIconContainer = styled.div`
  pointer-events: none;
  margin: 5px 0;
`;

const SubToolbarWrapper = styled.div`
  flex-wrap: nowrap;
  width: max-content;
  min-width: 250px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  span {
    width: 100%;
  }
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

const TitleText = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  color: ${OL.GREY01};
`;

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

type Props = {
  countiesById :Map<*, *>,
  bulkDownloadRemindersPDFReqState :RequestState,
  bulkDownloadRemindersPDFError :Error,
  failedManualReminderIds :Set<*>,
  failedReminderIds :Set<*>,
  isLoadingPeople :boolean,
  loadingManualReminders :boolean,
  loadReminderNeighborsByIdReqState :RequestState,
  loadRemindersActionListReqState :RequestState,
  loadRemindersForDateReqState :RequestState,
  loadOptOutsForDateReqState :RequestState,
  loadOptOutNeighborsReqState :RequestState,
  loadingManualReminderNeighbors :boolean,
  optOutMap :Map<*, *>,
  optOutNeighbors :Map<*, *>,
  optOutPeopleIds :Set<*>,
  remindersById :Map<*, *>,
  peopleReceivingManualReminders :Map<*, *>,
  reminderNeighborsById :Map<*, *>,
  remindersActionListDate :DateTime,
  remindersActionList :Map<*, *>,
  remindersByCounty :Map<*, *>,
  manualRemindersById :Map<*, *>,
  manualReminderNeighborsById :Map<*, *>,
  searchResults :Set<*>,
  searchHasRun :boolean,
  selectedOrganizationId :boolean,
  selectedOrganizationSettings :Map<*, *>,
  successfulReminderIds :Set<*>,
  successfulManualReminderIds :Set<*>,
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
      countyFilter: '',
      filter: '',
      noPDFModalIsVisible: false
    };
  }

  setFilter = e => this.setState({ filter: e.target.value });

  static getDerivedStateFromProps(nextProps, prevState) {
    const { bulkDownloadRemindersPDFReqState } = nextProps;
    const { noPDFModalIsVisible } = prevState;
    const downloadFailed = requestIsFailure(bulkDownloadRemindersPDFReqState);
    if (!noPDFModalIsVisible && downloadFailed) {
      return { noPDFModalIsVisible: true };
    }
    return null;
  }

  componentDidMount() {
    const {
      actions,
      selectedOrganizationId,
      selectedOrganizationSettings,
      remindersActionListDate
    } = this.props;
    const { loadRemindersActionList } = actions;
    const preferredCountyEKID :UUID = selectedOrganizationSettings.get(PREFERRED_COUNTY, '');
    if (selectedOrganizationId) {
      loadRemindersActionList({ remindersActionListDate });
      this.loadData(this.props);
    }
    if (preferredCountyEKID) {
      this.setState({ countyFilter: preferredCountyEKID });
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
      remindersActionListDate
    } = props;
    const { loadRemindersForDateReqState, loadReminderNeighborsByIdReqState } = this.props;
    const remindersLoaded :boolean = requestIsSuccess(loadRemindersForDateReqState)
      && requestIsSuccess(loadReminderNeighborsByIdReqState);
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
    return (
      <ToolbarWrapper>
        <SubToolbarWrapper>
          <span>Reminder Date:</span>
          {this.renderRemindersDatePicker()}
        </SubToolbarWrapper>
        <SubToolbarWrapper>
          { this.renderCountyFilter() }
        </SubToolbarWrapper>
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
      loadRemindersForDateReqState,
      loadingManualReminderNeighbors,
      loadReminderNeighborsByIdReqState
    } = this.props;
    const remindersAreLoading :boolean = requestIsPending(loadRemindersForDateReqState)
      || requestIsPending(loadReminderNeighborsByIdReqState);
    const loading :boolean = (
      loadingManualReminders
        || remindersAreLoading
        || loadingManualReminderNeighbors
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
          appTypeFqn={REMINDERS} />
    );
  }

  renderOptOutTable = () => {
    const {
      optOutMap,
      optOutNeighbors,
      loadOptOutsForDateReqState,
      loadOptOutNeighborsReqState
    } = this.props;
    const optOutsLoading :boolean = requestIsPending(loadOptOutsForDateReqState)
      || requestIsPending(loadOptOutNeighborsReqState);
    return (
      <TableWithPagination
          loading={optOutsLoading}
          title="Opt Outs"
          entities={optOutMap}
          neighbors={optOutNeighbors}
          appTypeFqn={REMINDER_OPT_OUTS} />
    );
  }

  renderNoContactPersonList = (people) => {
    const {
      bulkDownloadRemindersPDFReqState,
      loadRemindersActionListReqState,
      loadingManualReminderNeighbors
    } = this.props;
    const loadingRemindersActionList :boolean = requestIsPending(loadRemindersActionListReqState);
    const loadingReminderPDF :boolean = requestIsPending(bulkDownloadRemindersPDFReqState);
    return (
      <TableWrapper>
        <TableTitle grid>
          <TitleText>
            People not receiving reminders
            { loadingRemindersActionList ? null : <Count>{ people.size }</Count> }
          </TitleText>
          <StyledButton onClick={this.downloadReminderPDF} disabled={loadingRemindersActionList || loadingReminderPDF}>
            <FontAwesomeIcon color={OL.PURPLE03} icon={faFileDownload} />
            {' PDF'}
          </StyledButton>
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
    const noResultsText :string = (searchHasRun && !people.size)
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
        PEOPLE,
        PSA_NEIGHBOR.DETAILS,
        OPENLATTICE_ID_FQN,
        0], '');
      return personEntityKeyId;
    });
    const failedPeopleIds = failedReminderIds.map((reminderId) => {
      const personEntityKeyId = reminderNeighborsById.getIn([
        reminderId,
        PEOPLE,
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

  setCountyFilter = filter => this.setState({ countyFilter: filter.value });

  renderCountyFilter = () => {
    const { countyFilter } = this.state;
    const { countiesById, loadRemindersForDateReqState, loadReminderNeighborsByIdReqState } = this.props;
    const remindersAreLoading :boolean = requestIsPending(loadRemindersForDateReqState)
      || requestIsPending(loadReminderNeighborsByIdReqState);
    const countyOptions :List = countiesById.entrySeq().map(([countyEKID, county]) => {
      const { [NAME]: countyName } = getEntityProperties(county, [ENTITY_KEY_ID, NAME]);
      return {
        label: countyName,
        value: countyEKID
      };
    }).toJS();
    countyOptions.unshift({ label: 'All', value: '' });
    const currentFilterValue :Object = {
      label: countiesById.getIn([countyFilter, NAME, 0], 'All'),
      value: countyFilter
    };
    return (
      <Select
          value={currentFilterValue}
          options={countyOptions}
          isLoading={remindersAreLoading}
          onChange={this.setCountyFilter} />
    );
  }

  renderResults = () => {
    const { countyFilter, filter } = this.state;
    const {
      remindersByCounty,
      remindersById,
      failedReminderIds,
      failedManualReminderIds,
      manualRemindersById,
      reminderNeighborsById,
      manualReminderNeighborsById,
      successfulReminderIds,
      successfulManualReminderIds
    } = this.props;

    let entities = remindersById.merge(manualRemindersById);
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
    if (countyFilter) {
      const reminderIds = remindersByCounty.get(countyFilter, List()).concat(manualRemindersById.keySeq());
      entities = entities.filter((reminder, entityKeyId) => reminderIds.includes(entityKeyId));
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

  onClose = () => this.setState({ noPDFModalIsVisible: false });

  renderNoPDFModal = () => {
    const { noPDFModalIsVisible } = this.state;
    const { bulkDownloadRemindersPDFError } = this.props;
    const errorText = bulkDownloadRemindersPDFError.message;
    return (
      <Modal
          isVisible={noPDFModalIsVisible}
          onClickPrimary={this.onClose}
          shouldBeCentered
          shouldCloseOnOutsideClick
          shouldStretchButtons
          textPrimary="OK"
          withHeader={false}>
        <ErrorText>{errorText}</ErrorText>
      </Modal>
    );
  }

  render() {
    return (
      <DashboardMainSection>
        {this.renderToolbar()}
        {this.renderLists()}
        {this.renderOptOutTable()}
        {this.renderResults()}
        {this.renderNoPDFModal()}
      </DashboardMainSection>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const counties = state.get(STATE.COUNTIES);
  const reminders = state.get(STATE.REMINDERS);
  const manualReminders = state.get(STATE.MANUAL_REMINDERS);
  const search = state.get(STATE.SEARCH);

  return {
    // App
    [APP_DATA.ORGS]: app.get(APP_DATA.ORGS),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Counties
    [COUNTIES_DATA.COUNTIES_BY_ID]: counties.get(COUNTIES_DATA.COUNTIES_BY_ID),

    // Reminders Request States
    bulkDownloadRemindersPDFReqState: getReqState(reminders, REMINDERS_ACTIONS.BULK_DOWNLOAD_REMINDERS_PDF),
    bulkDownloadRemindersPDFError: getError(reminders, REMINDERS_ACTIONS.BULK_DOWNLOAD_REMINDERS_PDF),
    loadOptOutNeighborsReqState: getReqState(reminders, REMINDERS_ACTIONS.LOAD_OPT_OUT_NEIGHBORS),
    loadOptOutsForDateReqState: getReqState(reminders, REMINDERS_ACTIONS.LOAD_OPT_OUTS_FOR_DATE),
    loadRemindersActionListReqState: getReqState(reminders, REMINDERS_ACTIONS.LOAD_REMINDERS_ACTION_LIST),
    loadRemindersForDateReqState: getReqState(reminders, REMINDERS_ACTIONS.LOAD_REMINDERS_FOR_DATE),
    loadReminderNeighborsByIdReqState: getReqState(reminders, REMINDERS_ACTIONS.LOAD_REMINDER_NEIGHBORS),

    // Reminders Data
    [REMINDERS_DATA.REMINDERS_ACTION_LIST_DATE]: reminders.get(REMINDERS_DATA.REMINDERS_ACTION_LIST_DATE),
    [REMINDERS_DATA.REMINDERS_ACTION_LIST]: reminders.get(REMINDERS_DATA.REMINDERS_ACTION_LIST),
    [REMINDERS_DATA.REMINDERS_BY_ID]: reminders.get(REMINDERS_DATA.REMINDERS_BY_ID),
    [REMINDERS_DATA.REMINDERS_BY_COUNTY]: reminders.get(REMINDERS_DATA.REMINDERS_BY_COUNTY),
    [REMINDERS_DATA.SUCCESSFUL_REMINDER_IDS]: reminders.get(REMINDERS_DATA.SUCCESSFUL_REMINDER_IDS),
    [REMINDERS_DATA.FAILED_REMINDER_IDS]: reminders.get(REMINDERS_DATA.FAILED_REMINDER_IDS),
    [REMINDERS_DATA.REMINDER_NEIGHBORS]: reminders.get(REMINDERS_DATA.REMINDER_NEIGHBORS),
    [REMINDERS_DATA.OPT_OUTS]: reminders.get(REMINDERS_DATA.OPT_OUTS),
    [REMINDERS_DATA.OPT_OUT_NEIGHBORS]: reminders.get(REMINDERS_DATA.OPT_OUT_NEIGHBORS),
    [REMINDERS_DATA.OPT_OUT_PEOPLE_IDS]: reminders.get(REMINDERS_DATA.OPT_OUT_PEOPLE_IDS),
    [REMINDERS_DATA.OPT_OUTS_WITH_REASON]: reminders.get(REMINDERS_DATA.OPT_OUTS_WITH_REASON),

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
