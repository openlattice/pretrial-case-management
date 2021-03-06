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
import { List, Map, Set } from 'immutable';
import {
  Badge,
  Button,
  Card,
  CardSegment,
  DatePicker,
  Modal,
  SearchInput,
  Select
} from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload } from '@fortawesome/pro-light-svg-icons';

import OptOutTable from '../../components/optouts/OptOutTable';
import RemindersTable from '../../components/reminders/RemindersTable';
import SearchAllBar from '../../components/SearchAllBar';
import PersonSubscriptionList from '../../components/subscription/PersonSubscriptionList';
import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import exportRemindersPDFList from '../../utils/CourtRemindersPDFUtils';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { addWeekdays, getEntityProperties } from '../../utils/DataUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';
import { personIsReceivingReminders } from '../../utils/SubscriptionUtils';
import { SEARCH } from '../../utils/consts/FrontEndStateConsts';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { MANUAL_REMINDERS_DATA } from '../../utils/consts/redux/ManualRemindersConsts';
import { NO_HEARING_IDS, REMINDERS_ACTIONS, REMINDERS_DATA } from '../../utils/consts/redux/RemindersConsts';
import { getReqState, requestIsPending, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';

import { clearSearchResults, searchPeopleByPhoneNumber } from '../person/PersonActions';
import {
  loadManualRemindersForDate,
  LOAD_MANUAL_REMINDERS,
  LOAD_MANUAL_REMINDERS_NEIGHBORS
} from '../manualreminders/ManualRemindersActions';
import {
  loadRemindersActionList,
  loadRemindersforDate,
  loadOptOutsForDate,
  setDateForRemindersActionList
} from './RemindersActionFactory';

const downloadIcon = <FontAwesomeIcon color={OL.PURPLE03} icon={faFileDownload} />;

const { PREFERRED_COUNTY } = SETTINGS;

const { HEARINGS } = APP_TYPES;
const {
  DATE_TIME,
  ENTITY_KEY_ID,
  NAME
} = PROPERTY_TYPES;

const StyledCard = styled(Card)`
  margin-bottom: 30px;
`;

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
  grid-template-columns: 1fr 1fr;
  column-gap: 30px;
`;

const SubToolbarWrapper = styled.div`
  align-items: baseline;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  min-width: 250px;
  width: max-content;

  span {
    width: 100%;
  }
`;

const TableTitle = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${OL.GREY01};
  margin-right: 10px;
  ${(props :Object) => (
    props.grid
      ? (
        `display: grid;
         grid-template-columns: 75% 25%;
         margin-bottom: 20px;`
      ) : ''
  )}
`;

const TableWrapper = styled.div`
  background: white;
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
  max-height: 100%;
  overflow: hidden;
  padding: 30px;
  width: 100%;
`;

const TitleText = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  color: ${OL.GREY01};
`;

const StyledCardSegment = styled(CardSegment)`
  justify-content: space-between;
  flex-direction: row;
`;

const RemindersTableTitle = styled.div`
  display: flex;
  height: min-content;
  margin: auto 0;
`;

const ToolbarWrapper = styled.div`
  align-items: baseline;
  background: white;
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 15px 0 30px;
  padding: 15px 30px;
  width: 100%;
`;

type Props = {
  actions :{
    clearSearchResults :() => void;
    loadManualRemindersForDate :RequestSequence;
    loadOptOutsForDate :RequestSequence;
    loadReminderNeighborsById :RequestSequence;
    loadRemindersActionList :RequestSequence;
    loadRemindersforDate :RequestSequence;
    searchPeopleByPhoneNumber :RequestSequence;
    setDateForRemindersActionList :RequestSequence;
  };
  countiesById :Map;
  getPeopleNeighborsRequestState :RequestState;
  isLoadingPeople :boolean;
  loadManualRemindersForDateRS :RequestState;
  loadManualRemindersNeighborsRS :RequestState;
  loadReminderNeighborsByIdReqState :RequestState;
  loadRemindersActionListReqState :RequestState;
  loadRemindersForDateReqState :RequestState;
  loadOptOutsForDateReqState :RequestState;
  loadOptOutNeighborsReqState :RequestState;
  optOutMap :Map;
  optOutNeighbors :Map;
  peopleReceivingManualReminders :Map;
  peopleNeighborsById :Map;
  remindersById :Map;
  reminderNeighborsById :Map;
  remindersActionListDate :DateTime;
  remindersActionList :Map;
  remindersByCounty :Map;
  manualRemindersById :Map;
  manualReminderNeighborsById :Map;
  searchResults :Set;
  searchHasRun :boolean;
  selectedOrganizationId :boolean;
  selectedOrganizationSettings :Map;
};

type State = {
  countyFilter :string;
  noPDFModalIsVisible :boolean;
  searchQuery :string;
}

class RemindersContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      countyFilter: '',
      noPDFModalIsVisible: false,
      searchQuery: ''
    };
  }

  componentDidMount() {
    const {
      actions,
      selectedOrganizationId,
      selectedOrganizationSettings,
      remindersActionListDate
    } = this.props;
    const preferredCountyEKID :UUID = selectedOrganizationSettings.get(PREFERRED_COUNTY, '');
    if (selectedOrganizationId) {
      actions.loadRemindersActionList({ remindersActionListDate });
      this.loadData(this.props);
    }
    if (preferredCountyEKID) {
      this.setState({ countyFilter: preferredCountyEKID });
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      selectedOrganizationId,
      remindersActionListDate
    } = this.props;

    if (selectedOrganizationId !== prevProps.selectedOrganizationId) {
      actions.loadRemindersActionList({ remindersActionListDate });
      this.loadData(this.props);
    }
    if (remindersActionListDate !== prevProps.remindersActionListDate) {
      actions.loadRemindersActionList({ remindersActionListDate });
      actions.loadManualRemindersForDate({ date: remindersActionListDate });
      actions.loadRemindersforDate({ date: remindersActionListDate });
      actions.loadOptOutsForDate({ date: remindersActionListDate });
    }
  }

  updateSearchQuery = (event :SyntheticInputEvent<*>) => this.setState({
    searchQuery: event.target.value
  });

  loadData = (props :Props) => {
    const {
      actions,
      loadManualRemindersForDateRS,
      loadManualRemindersNeighborsRS,
      remindersActionListDate,
      loadRemindersForDateReqState,
      loadReminderNeighborsByIdReqState
    } = props;
    const remindersLoaded :boolean = requestIsSuccess(loadRemindersForDateReqState)
      && requestIsSuccess(loadReminderNeighborsByIdReqState);

    if (!remindersLoaded) {
      actions.loadRemindersforDate({ date: remindersActionListDate });
      actions.loadOptOutsForDate({ date: remindersActionListDate });
    }

    const manualRemindersLoaded :boolean = requestIsSuccess(loadManualRemindersForDateRS)
      && requestIsSuccess(loadManualRemindersNeighborsRS);
    if (!manualRemindersLoaded) {
      actions.loadManualRemindersForDate({ date: remindersActionListDate });
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSearchResults();
  }

  manualRemindersSubmitCallback = () => {
    const { actions, remindersActionListDate } = this.props;
    if (remindersActionListDate.isValid) {
      actions.loadManualRemindersForDate({ date: remindersActionListDate });
    }
  }

  renderRemindersDatePicker = () => {
    const { actions, remindersActionListDate } = this.props;

    return (
      <DatePicker
          subtle
          value={remindersActionListDate.toISODate()}
          onChange={(date) => actions.setDateForRemindersActionList({ date })} />
    );
  }

  renderToolbar = () => (
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

  renderSearchToolbar = () => {
    const { actions } = this.props;
    return <SearchAllBar handleSubmit={actions.searchPeopleByPhoneNumber} />;
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
      <StyledCard>
        <StyledCardSegment>
          <RemindersTableTitle>
            <TableTitle>Opt Outs</TableTitle>
            <Badge count={optOutMap.size} />
          </RemindersTableTitle>
        </StyledCardSegment>
        <OptOutTable
            isLoading={optOutsLoading}
            optOuts={optOutMap}
            optOutNeighbors={optOutNeighbors}
            pageOptions={[5, 10, 15]} />
      </StyledCard>
    );
  }

  getNoContactPeople = () => {
    const {
      peopleNeighborsById,
      peopleReceivingManualReminders,
      remindersActionList,
    } = this.props;
    let filteredRemindersActionList = remindersActionList;
    peopleReceivingManualReminders.forEach((personEntityKeyId) => {
      filteredRemindersActionList = filteredRemindersActionList.delete(personEntityKeyId);
    });
    remindersActionList.keySeq().forEach((personEKID) => {
      const personNeighbors = peopleNeighborsById.get(personEKID, Map());
      if (personIsReceivingReminders(personNeighbors)) {
        filteredRemindersActionList = filteredRemindersActionList.delete(personEKID);
      }
    });
    return filteredRemindersActionList;
  }

  renderNoContactPersonList = () => {
    const {
      getPeopleNeighborsRequestState,
      loadRemindersActionListReqState,
    } = this.props;
    const loadingRemindersActionList :boolean = requestIsPending(loadRemindersActionListReqState);
    const loadingPersonNieghbors :boolean = requestIsPending(getPeopleNeighborsRequestState);

    const noContactPeople = this.getNoContactPeople();

    const loading = loadingRemindersActionList || loadingPersonNieghbors;

    return (
      <TableWrapper>
        <TableTitle grid>
          <TitleText>
            People not receiving reminders
            { loading ? null : <Badge count={noContactPeople.size} /> }
          </TitleText>
          <Button startIcon={downloadIcon} onClick={this.downloadReminderPDF} disabled={loading}>
            PDF
          </Button>
        </TableTitle>
        <PersonSubscriptionList
            includeManualRemindersButton
            noResultsText="No Results"
            loading={loading}
            submitCallback={this.manualRemindersSubmitCallback}
            people={noContactPeople}
            noResults={!noContactPeople.size} />
      </TableWrapper>
    );
  }

  renderSearchByContactList = (people :List) => {
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
            includeManualRemindersButton
            includeContact
            noResultsText={noResultsText}
            loading={isLoadingPeople}
            people={people}
            noResults={!people.size} />
      </TableWrapper>
    );
  }

  renderLists = () => {
    const { searchResults } = this.props;
    return (
      <ListContainer>
        {this.renderSearchByContactList(searchResults)}
        {this.renderNoContactPersonList()}
      </ListContainer>
    );
  }

  downloadReminderPDF = () => {
    const { remindersActionListDate, peopleNeighborsById } = this.props;
    const noContactPeople = this.getNoContactPeople();
    const dateString = remindersActionListDate.toISODate();
    const fileName = `Notices_To_Appear_In_Court_${dateString}`;
    const oneDayAhead = addWeekdays(dateString, 1);
    const oneWeekAhead = addWeekdays(dateString, 7);
    const pageDetailsList = List().withMutations((mutableList) => {
      noContactPeople.forEach((person, personEKID) => {
        const personNeighbors = peopleNeighborsById.get(personEKID, Map());
        const validPersonHearings = personNeighbors.get(HEARINGS, List()).filter((hearing) => {
          const hearingIsActive = !hearingIsCancelled(hearing);
          const { [DATE_TIME]: hearingDateTime } = getEntityProperties(hearing, [DATE_TIME]);
          const hearingDT = DateTime.fromISO(hearingDateTime);
          return hearingIsActive && (hearingDT.hasSame(oneDayAhead, 'day') || hearingDT.hasSame(oneWeekAhead, 'day'));
        });
        if (validPersonHearings.size) {
          mutableList.push({ selectedPerson: person, selectedHearing: validPersonHearings });
        }
      });
    });

    if (pageDetailsList.size) {
      exportRemindersPDFList(fileName, pageDetailsList);
    }
    else {
      this.setState({ noPDFModalIsVisible: true });
      throw new Error(`${NO_HEARING_IDS} ${oneDayAhead.toISODate()} and ${oneWeekAhead.toISODate()}.`);
    }
  }

  setCountyFilter = (countyFilter :Object) => this.setState({ countyFilter: countyFilter.value });

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
    const { countyFilter, searchQuery } = this.state;
    let { remindersById } = this.props;
    const {
      remindersByCounty,
      manualRemindersById,
      reminderNeighborsById,
      manualReminderNeighborsById,
      loadManualRemindersForDateRS,
      loadManualRemindersNeighborsRS,
      loadRemindersForDateReqState,
      loadReminderNeighborsByIdReqState
    } = this.props;
    const remindersAreLoading :boolean = requestIsPending(loadRemindersForDateReqState)
      || requestIsPending(loadReminderNeighborsByIdReqState)
      || requestIsPending(loadManualRemindersForDateRS)
      || requestIsPending(loadManualRemindersNeighborsRS);

    if (countyFilter) {
      const reminderIds = remindersByCounty.get(countyFilter, List());
      remindersById = remindersById
        .filter((reminder, entityKeyId) => reminderIds.includes(entityKeyId));
    }

    return (
      <StyledCard>
        <StyledCardSegment>
          <RemindersTableTitle>
            <TableTitle>Reminders</TableTitle>
            <Badge count={manualRemindersById.size + remindersById.size} />
          </RemindersTableTitle>
          <SearchInput onChange={this.updateSearchQuery} />
        </StyledCardSegment>
        <RemindersTable
            isLoading={remindersAreLoading}
            manualReminders={manualRemindersById}
            manualRemindersNeighbors={manualReminderNeighborsById}
            reminders={remindersById}
            remindersNeighbors={reminderNeighborsById}
            searchQuery={searchQuery} />
      </StyledCard>
    );
  }

  onClose = () => this.setState({ noPDFModalIsVisible: false });

  renderNoPDFModal = () => {
    const { noPDFModalIsVisible } = this.state;
    const errorText = 'No Reminders For Selected Date';
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
  const people = state.get(STATE.PEOPLE);

  return {
    // App
    [APP_DATA.ORGS]: app.get(APP_DATA.ORGS),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Counties
    [COUNTIES_DATA.COUNTIES_BY_ID]: counties.get(COUNTIES_DATA.COUNTIES_BY_ID),

    // Reminders Request States
    loadOptOutNeighborsReqState: getReqState(reminders, REMINDERS_ACTIONS.LOAD_OPT_OUT_NEIGHBORS),
    loadOptOutsForDateReqState: getReqState(reminders, REMINDERS_ACTIONS.LOAD_OPT_OUTS_FOR_DATE),
    loadRemindersActionListReqState: getReqState(reminders, REMINDERS_ACTIONS.LOAD_REMINDERS_ACTION_LIST),
    loadRemindersForDateReqState: getReqState(reminders, REMINDERS_ACTIONS.LOAD_REMINDERS_FOR_DATE),
    loadReminderNeighborsByIdReqState: getReqState(reminders, REMINDERS_ACTIONS.LOAD_REMINDER_NEIGHBORS),

    // People Data
    getPeopleNeighborsRequestState: getReqState(people, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS),
    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID),

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

    // Manual Reminders
    loadManualRemindersForDateRS: getReqState(manualReminders, LOAD_MANUAL_REMINDERS),
    loadManualRemindersNeighborsRS: getReqState(manualReminders, LOAD_MANUAL_REMINDERS_NEIGHBORS),
    [MANUAL_REMINDERS_DATA.REMINDER_IDS]: manualReminders.get(MANUAL_REMINDERS_DATA.REMINDER_IDS),
    [MANUAL_REMINDERS_DATA.REMINDERS_BY_ID]: manualReminders.get(MANUAL_REMINDERS_DATA.REMINDERS_BY_ID),
    [MANUAL_REMINDERS_DATA.REMINDER_NEIGHBORS]: manualReminders.get(MANUAL_REMINDERS_DATA.REMINDER_NEIGHBORS),
    [MANUAL_REMINDERS_DATA.PEOPLE_RECEIVING_REMINDERS]: manualReminders
      .get(MANUAL_REMINDERS_DATA.PEOPLE_RECEIVING_REMINDERS),
    [MANUAL_REMINDERS_DATA.SUCCESSFUL_REMINDER_IDS]: manualReminders.get(MANUAL_REMINDERS_DATA.SUCCESSFUL_REMINDER_IDS),
    [MANUAL_REMINDERS_DATA.FAILED_REMINDER_IDS]: manualReminders.get(MANUAL_REMINDERS_DATA.FAILED_REMINDER_IDS),

    [SEARCH.LOADING]: search.get(SEARCH.LOADING),
    [SEARCH.SEARCH_RESULTS]: search.get(SEARCH.SEARCH_RESULTS),
    [SEARCH.SEARCH_ERROR]: search.get(SEARCH.SEARCH_ERROR),
    [SEARCH.SEARCH_HAS_RUN]: search.get(SEARCH.SEARCH_HAS_RUN)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    clearSearchResults,
    loadManualRemindersForDate,
    loadOptOutsForDate,
    loadRemindersActionList,
    loadRemindersforDate,
    searchPeopleByPhoneNumber,
    setDateForRemindersActionList
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(RemindersContainer);
