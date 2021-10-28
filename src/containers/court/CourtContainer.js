/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faClone } from '@fortawesome/pro-light-svg-icons';
import { faEdit, faFileDownload } from '@fortawesome/pro-regular-svg-icons';
import { faBell } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map, Set } from 'immutable';
import { Constants } from 'lattice';
import { Button, DatePicker } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { changeHearingFilters } from './CourtActionFactory';

import BulkHearingsEditModal from '../../components/hearings/BulkHearingEditModal';
import CONTENT from '../../utils/consts/ContentConsts';
import CountiesDropdown from '../counties/CountiesDropdown';
import HearingSettingsButton from '../../components/hearings/HearingSettingsButton';
import LogoLoader from '../../components/LogoLoader';
import PSAModal from '../psamodal/PSAModal';
import PersonCard from '../../components/people/PersonCard';
import ToggleButtonsGroup from '../../components/buttons/ToggleButtons';
import * as Routes from '../../core/router/Routes';
import { getEntityProperties, isUUID } from '../../utils/DataUtils';
import { StyledFormViewWrapper, StyledSectionWrapper } from '../../utils/Layout';
import { formatPeopleInfo, sortPeopleByName } from '../../utils/PeopleUtils';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { DATE_FORMAT, TIME_FORMAT } from '../../utils/consts/DateTimeConsts';
import {
  COURT,
  EDM,
  PSA_ASSOCIATION,
  PSA_NEIGHBOR
} from '../../utils/consts/FrontEndStateConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { DOMAIN } from '../../utils/downloads/ReportDownloadTypes';
import { loadHearingsForDate, setCourtDate } from '../hearings/HearingsActions';
import { loadPSAModal } from '../psamodal/PSAModalActionFactory';
import {
  bulkDownloadPSAReviewPDF,
  checkPSAPermissions,
  loadCaseHistory
} from '../review/ReviewActions';

const { JUDGES, PEOPLE } = APP_TYPES;

const { OPENLATTICE_ID_FQN } = Constants;

const { PREFERRED_COUNTY } = SETTINGS;

const {
  CASE_ID,
  COURTROOM,
  DATE_TIME,
  ENTITY_KEY_ID,
} = PROPERTY_TYPES;

const bulkEditIcon = <FontAwesomeIcon icon={faEdit} />;
const downloadIcon = <FontAwesomeIcon icon={faFileDownload} />;

const Legend = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px;
`;

const LegendItem = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  font-size: 12px;
  justify-content: center;
  margin-bottom: 10px;
  padding: 5px;

  svg {
    margin-right: 5px;
  }
`;

const StyledFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 100%;
`;

const Title = styled.div`
  display: flex;
  font-size: 24px;
  height: 100%;
`;

const Subtitle = styled(Title)`
  font-size: 18px;
  margin: 5.5px 10px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledTitleWrapper = styled.div`
  color: ${OL.GREY34};
  display: flex;
  font-size: 24px;
  margin-bottom: 30px;
  width: 100%;
`;

const HearingTime = styled.div`
  border-bottom: 1px solid ${OL.GREY11};
  margin-bottom: 30px;
  text-align: left;
  width: 100%;

  h1 {
    color: ${OL.GREY01};
    font-size: 18px;
    padding-bottom: 30px;
  }
`;

const HearingRow = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 20%) minmax(700px, 80%);
  min-width: 900px;

  &:not(:last-child) {
    margin-bottom: 50px;
  }
`;

const Courtroom = styled.div`
  padding: 20px;
  background-color: ${OL.GREY08};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  span {
    font-weight: 600;
    margin-bottom: 10px;
  }
`;

const PeopleWrapper = styled.div`
  width: 100%;
  padding: 20px;
  border: 1px solid ${OL.GREY08};
  display: grid;
  grid-template-columns: 31% 31% 31%;
  column-gap: 3%;
`;

const StyledButton = styled(Button)`
  font-size: 11px;
  margin-bottom: 10px;
  width: max-content;

  span {
    margin: 0 !important;
  }

  svg {
    margin-right: 3px;
  }
`;

const SubSection = styled.div`
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const ToggleWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin: 5px;
`;

type Props = {
  actions :{
    bulkDownloadPSAReviewPDF :RequestSequence;
    changeHearingFilters :(value :{ courtroom :string }) => void;
    checkPSAPermissions :RequestSequence;
    loadCaseHistory :RequestSequence;
    loadHearingsForDate :RequestSequence;
    loadPSAModal :RequestSequence;
    setCourtDate :(value :{ courtDate :DateTime }) => void;
  };
  courtDate :DateTime;
  countiesById :Map;
  hearingsByCounty :Map;
  hearingsByTime :Map;
  hearingNeighborsById :Map;
  isLoadingPSAs :boolean;
  courtroom :string;
  courtrooms :List;
  county :string;
  loadHearingsForDateReqState :RequestState;
  loadHearingNeighborsReqState :RequestState;
  peopleWithOpenPsas :Set;
  peopleIdsToOpenPSAIds :Map;
  peopleWithMultipleOpenPsas :Set;
  peopleReceivingReminders :Set;
  selectedOrganizationId :string;
  selectedOrganizationSettings :Map;
  selectedOrganizationTitle :string;
  psaEditDatesById :Map;
};

type State = {
  countyFilter :string;
  psaId :string;
  psaModalOpen :boolean;
  courtroom :string;
  hearingEKIDs :Set;
  associationEKIDs :Set;
  hearingDateTime :string;
  bulkHearingEditModalOpen :boolean;
}

const PENN_ROOM_PREFIX = 'Courtroom ';

class CourtContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      countyFilter: '',
      psaId: '',
      psaModalOpen: false,
      courtroom: '',
      hearingEKIDs: Set(),
      associationEKIDs: Set(),
      hearingDateTime: '',
      bulkHearingEditModalOpen: false
    };
  }

  onClose = () => (this.setState({ psaModalOpen: false }));

  renderPSAModal = () => {
    const { psaId, psaModalOpen } = this.state;
    return (
      <PSAModal
          open={psaModalOpen}
          view={CONTENT.JUDGES}
          onClose={this.onClose}
          entityKeyId={psaId} />
    );
  }

  openPSAModal = ({ psaId } :Object) => {
    const { actions } = this.props;
    this.setState({ psaId });
    actions.loadPSAModal({ psaId, callback: this.loadCaseHistoryCallback });
    this.setState({ psaModalOpen: true });
  }

  componentDidMount() {
    const {
      actions,
      courtDate,
      hearingsByTime,
      hearingNeighborsById,
      selectedOrganizationId,
      selectedOrganizationSettings
    } = this.props;
    const preferredCountyEKID :UUID = selectedOrganizationSettings.get(PREFERRED_COUNTY, '');
    if (selectedOrganizationId) {
      actions.checkPSAPermissions();
      if (!hearingsByTime.size || !hearingNeighborsById.size) {
        actions.loadHearingsForDate({ courtDate });
      }
    }
    this.setState({ countyFilter: preferredCountyEKID });
  }

  componentDidUpdate(prevProps :Props) {
    const {
      actions,
      courtDate,
      hearingNeighborsById,
      selectedOrganizationId,
      selectedOrganizationSettings
    } = this.props;
    const preferredCountyEKID :UUID = selectedOrganizationSettings.get(PREFERRED_COUNTY, '');
    if (selectedOrganizationId !== prevProps.selectedOrganizationId) {
      actions.checkPSAPermissions();
      if (!prevProps.hearingsByTime.size || !hearingNeighborsById.size || courtDate !== prevProps.courtDate) {
        actions.loadHearingsForDate({ courtDate });
        this.setState({ countyFilter: preferredCountyEKID });
      }
    }
  }

  loadCaseHistoryCallback = (personEKID :string, psaNeighbors :Map) => {
    const { actions } = this.props;
    actions.loadCaseHistory({ personEKID, neighbors: psaNeighbors });
  }

  renderPersonCard = (person :Map) => {
    const {
      peopleIdsToOpenPSAIds,
      peopleWithOpenPsas,
      peopleWithMultipleOpenPsas,
      peopleReceivingReminders,
      psaEditDatesById
    } = this.props;
    const personEntityKeyId = person.getIn([OPENLATTICE_ID_FQN, 0]);
    const openPSAId = peopleIdsToOpenPSAIds.get(personEntityKeyId, '');
    const hasOpenPSA = peopleWithOpenPsas.has(personEntityKeyId);
    const isReceivingReminders = peopleReceivingReminders.includes(personEntityKeyId);
    const hasMultipleOpenPSAs = peopleWithMultipleOpenPsas.includes(personEntityKeyId);

    const completedDateFromAssociation = psaEditDatesById
      .getIn([openPSAId, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0], '');
    const dateTimeFromAssociation = psaEditDatesById
      .getIn([openPSAId, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0], '');
    const editDateFromPSA = psaEditDatesById.getIn([openPSAId, PROPERTY_TYPES.DATE_TIME], '');
    const lastEditDateString = completedDateFromAssociation || dateTimeFromAssociation || editDateFromPSA;

    const lastEditDate = DateTime.fromISO(lastEditDateString).toFormat(DATE_FORMAT);

    const personObj = formatPeopleInfo(person);
    return (
      <PersonCard
          key={`${personObj.personId}`}
          psaId={openPSAId}
          editDate={lastEditDate}
          multipleOpenPSAs={hasMultipleOpenPSAs}
          personObj={personObj}
          hasOpenPSA={hasOpenPSA}
          isReceivingReminders={isReceivingReminders}
          loadCaseHistoryFn={this.loadCaseHistoryCallback}
          openPSAModal={this.openPSAModal}
          judgesview />
    );
  }

  downloadPDFs = (courtroom :string, people :Map, time :string) => {
    const { actions } = this.props;
    const fileName = `${courtroom}-${DateTime.local().toISODate()}-${time}`;
    actions.bulkDownloadPSAReviewPDF({
      fileName,
      peopleEntityKeyIds: people.valueSeq().map((person) => person.getIn([OPENLATTICE_ID_FQN, 0])).toJS()
    });
  }

  openBulkEditModal = ({
    courtroom,
    hearingEKIDs,
    associationEKIDs,
    hearingDateTime
  } :Object) => {
    this.setState({
      courtroom,
      hearingEKIDs,
      associationEKIDs,
      hearingDateTime,
      bulkHearingEditModalOpen: true
    });
  };

  closeBulkEditModal = () => {
    this.setState({
      courtroom: '',
      hearingEKIDs: Set(),
      associationEKIDs: Set(),
      hearingDateTime: '',
      bulkHearingEditModalOpen: false
    });
  };

  renderHearingRow = (
    courtroom :string,
    people :Map,
    time :string,
    hearingEKIDs :Set,
    associationEKIDs :Set,
    hearingDateTime :string
  ) => {
    const sortedPeople = people.toList().sort(sortPeopleByName);
    return (
      <HearingRow key={`${courtroom}-${time}`}>
        <Courtroom key={`courtroom-${courtroom}-${time}`}>
          <span>{courtroom}</span>
          <StyledButton
              color="secondary"
              onClick={() => this.downloadPDFs(courtroom, people, time)}
              size="small"
              startIcon={downloadIcon}>
            Download PDFs
          </StyledButton>
          <StyledButton
              color="secondary"
              onClick={() => this.openBulkEditModal({
                courtroom,
                hearingEKIDs,
                associationEKIDs,
                hearingDateTime
              })}
              size="small"
              startIcon={bulkEditIcon}>
            Update Manual Hearings
          </StyledButton>
        </Courtroom>
        <PeopleWrapper key={`people-${courtroom}-${time}`}>{sortedPeople.map(this.renderPersonCard)}</PeopleWrapper>
      </HearingRow>
    );
  }

  setCountyFilter = (filter :{ value :string }) => this.setState({ countyFilter: filter.value });

  renderCountyFilter = () => {
    const { countyFilter } = this.state;
    const {
      countiesById,
      loadHearingsForDateReqState,
      loadHearingNeighborsReqState,
    } = this.props;
    const remindersAreLoading :boolean = requestIsPending(loadHearingsForDateReqState)
      || requestIsPending(loadHearingNeighborsReqState);
    return (
      <CountiesDropdown
          value={countyFilter}
          options={countiesById}
          loading={remindersAreLoading}
          onChange={this.setCountyFilter} />
    );
  }

  renderHearingsAtTime = (time :string) => {
    const { countyFilter } = this.state;
    const {
      county,
      courtroom,
      hearingsByTime,
      hearingsByCounty,
      hearingNeighborsById
    } = this.props;
    let hearingsByCourtroom = Map();
    let associationEKIDs = Set();
    const { [DATE_TIME]: hearingDateTime } = getEntityProperties(
      hearingsByTime.getIn([time, 0], Map()), [DATE_TIME]
    );
    const hearinIdsForCountyFilter = hearingsByCounty.get(countyFilter, Set());
    const hearingEKIDs = Set().withMutations((mutableSet) => {
      hearingsByTime.get(time).forEach((hearing) => {
        let shouldInclude = true;
        const {
          [ENTITY_KEY_ID]: hearingEKID,
          [CASE_ID]: hearingCaseId,
          [COURTROOM]: room
        } = getEntityProperties(hearing, [ENTITY_KEY_ID, CASE_ID, COURTROOM]);
        if (courtroom.length && room !== courtroom) shouldInclude = false;
        if (shouldInclude && !hearinIdsForCountyFilter.includes(hearingEKID)) shouldInclude = false;
        if (!countyFilter) shouldInclude = true;
        if (shouldInclude) {
          const neighbors = hearingNeighborsById.get(hearingEKID, Map());
          const person = neighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
          const judge = neighbors.getIn([JUDGES, PSA_ASSOCIATION.DETAILS], Map());
          const { [ENTITY_KEY_ID]: judgeAssociationEKID } = getEntityProperties(judge, [ENTITY_KEY_ID]);
          const personId = person.getIn([PROPERTY_TYPES.PERSON_ID, 0]);
          if (personId) {
            if (isUUID(hearingCaseId)) {
              mutableSet.add(hearingEKID);
              associationEKIDs = associationEKIDs.add(judgeAssociationEKID);
            }
            hearingsByCourtroom = hearingsByCourtroom
              .set(room, hearingsByCourtroom.get(room, Map()).set(personId, person));
          }
        }
      });
    });

    if (!hearingsByCourtroom.size) return null;

    return (
      <HearingTime key={`HearingTime${time}${courtroom}${county}`}>
        <h1>{time}</h1>
        {
          hearingsByCourtroom.entrySeq()
            .map(([room, people]) => this.renderHearingRow(
              room, people, time, hearingEKIDs, associationEKIDs, hearingDateTime
            )).toJS()
        }
      </HearingTime>
    );
  }

  onCourtroomChange = (courtroom :string) => {
    const { actions } = this.props;
    actions.changeHearingFilters({ courtroom });
  }

  renderCourtroomChoices = () => {
    const {
      county,
      courtroom,
      courtrooms
    } = this.props;

    const pennCoutrooms = courtrooms.filter((room) => room.startsWith(PENN_ROOM_PREFIX)).toList().sort()
      .map((value) => ({
        value,
        label: value
      }));
    const minnCoutrooms = courtrooms.filter((room) => !room.startsWith(PENN_ROOM_PREFIX)).toList().sort()
      .map((value) => ({
        value,
        label: value
      }));

    let roomOptions = [{
      value: '',
      label: 'All'
    }];
    if (county === DOMAIN.MINNEHAHA) {
      roomOptions = [...roomOptions, ...minnCoutrooms];
    }
    else if (county === DOMAIN.PENNINGTON) {
      roomOptions = [...roomOptions, ...pennCoutrooms];
    }
    else {
      roomOptions = [...roomOptions, ...minnCoutrooms, ...pennCoutrooms];
    }

    return (
      <ToggleWrapper>
        <ToggleButtonsGroup
            options={roomOptions}
            selectedOption={courtroom}
            onSelect={this.onCourtroomChange} />
      </ToggleWrapper>
    );
  }

  handleDateChange = (dateString :string) => {
    const { actions } = this.props;
    const courtDate :DateTime = DateTime.fromISO(dateString);
    if (courtDate.isValid) {
      actions.setCourtDate({ courtDate });
      actions.loadHearingsForDate({ courtDate });
    }
  }

  renderDatePicker = () => {
    const { courtDate } = this.props;
    return (
      <SubSection>
        <Label>Hearing Date</Label>
        <DatePicker
            value={courtDate.toISODate()}
            onChange={this.handleDateChange} />
      </SubSection>
    );
  }

  renderSearchLink = () => (
    <NavLink to={Routes.SEARCH_PEOPLE} name={Routes.SEARCH_PEOPLE}>Search All People</NavLink>
  )

  renderContent = () => {
    const {
      loadHearingsForDateReqState,
      loadHearingNeighborsReqState,
      isLoadingPSAs,
      hearingsByTime
    } = this.props;
    const loadingHearingsNeighbors = requestIsPending(loadHearingNeighborsReqState);
    const loadingHearings = requestIsPending(loadHearingsForDateReqState);
    if (loadingHearings || loadingHearingsNeighbors || isLoadingPSAs) {
      return <LogoLoader loadingText="Loading..." />;
    }

    const timeOptions = hearingsByTime.keySeq().sort((time1, time2) => {
      const dateTime1 = DateTime.fromFormat(time1, TIME_FORMAT);
      const dateTime2 = DateTime.fromFormat(time2, TIME_FORMAT);
      return dateTime1.valueOf() <= dateTime2.valueOf() ? -1 : 1;
    });

    return timeOptions.map(this.renderHearingsAtTime);

  }

  renderLegend = () => (
    <Legend>
      <LegendItem>
        <FontAwesomeIcon color={OL.ORANGE01} icon={faBell} />
        <div>Person is receiving reminders</div>
      </LegendItem>
      <LegendItem>
        <FontAwesomeIcon color={OL.PURPLE02} icon={faClone} />
        <div>Person has multiple open PSAs</div>
      </LegendItem>
    </Legend>
  )

  render() {
    const { selectedOrganizationTitle } = this.props;
    const {
      associationEKIDs,
      bulkHearingEditModalOpen,
      courtroom,
      hearingDateTime,
      hearingEKIDs
    } = this.state;
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <Header>
            <StyledTitleWrapper>
              <Title>Court Hearings</Title>
              <Subtitle>{ `(Showing Open PSAs for ${selectedOrganizationTitle})` }</Subtitle>
            </StyledTitleWrapper>
            <HearingSettingsButton />
          </Header>
          <StyledSectionWrapper>
            {this.renderDatePicker()}
            <SubSection>
              {this.renderCountyFilter()}
            </SubSection>
            {this.renderCourtroomChoices()}
            {this.renderLegend()}
            {this.renderSearchLink()}
            {this.renderContent()}
          </StyledSectionWrapper>
        </StyledFormWrapper>
        {this.renderPSAModal()}
        <BulkHearingsEditModal
            associationEKIDs={associationEKIDs}
            defaultCourtroom={courtroom}
            defaultDateTime={hearingDateTime}
            hearingEKIDs={hearingEKIDs}
            isVisible={bulkHearingEditModalOpen}
            onClose={this.closeBulkEditModal} />
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const court = state.get(STATE.COURT);
  const counties = state.get(STATE.COUNTIES);
  const edm = state.get(STATE.EDM);
  const hearings = state.get(STATE.HEARINGS);
  const courtDate = hearings.get(HEARINGS_DATA.COURT_DATE).toISODate();
  const hearingsByTime = hearings.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, courtDate], Map());
  const courtrooms = hearings.getIn([HEARINGS_DATA.COURTROOMS_BY_DATE, courtDate], Set());
  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Counties
    [COUNTIES_DATA.COUNTIES_BY_ID]: counties.get(COUNTIES_DATA.COUNTIES_BY_ID),

    // Court
    [COURT.PEOPLE_WITH_OPEN_PSAS]: court.get(COURT.PEOPLE_WITH_OPEN_PSAS),
    [COURT.PEOPLE_WITH_MULTIPLE_OPEN_PSAS]: court.get(COURT.PEOPLE_WITH_MULTIPLE_OPEN_PSAS),
    [COURT.PEOPLE_RECEIVING_REMINDERS]: court.get(COURT.PEOPLE_RECEIVING_REMINDERS),
    [COURT.LOADING_PSAS]: court.get(COURT.LOADING_PSAS),
    [COURT.COURTROOM]: court.get(COURT.COURTROOM),
    [COURT.SCORES_AS_MAP]: court.get(COURT.SCORES_AS_MAP),
    [COURT.PSA_EDIT_DATES]: court.get(COURT.PSA_EDIT_DATES),
    [COURT.OPEN_PSA_IDS]: court.get(COURT.OPEN_PSA_IDS),
    [COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS]: court.get(COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS),

    // Hearings
    courtrooms,
    hearingsByTime,
    loadHearingsForDateReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE),
    loadHearingNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS),
    [HEARINGS_DATA.COURT_DATE]: hearings.get(HEARINGS_DATA.COURT_DATE),
    [HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME]: hearings.get(HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME),
    [HEARINGS_DATA.HEARINGS_BY_COUNTY]: hearings.get(HEARINGS_DATA.HEARINGS_BY_COUNTY),
    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Court actions
    changeHearingFilters,
    // Hearings Actions
    loadHearingsForDate,
    setCourtDate,
    // PSA Modal actions
    loadPSAModal,
    // Review actions
    bulkDownloadPSAReviewPDF,
    checkPSAPermissions,
    loadCaseHistory
  }, dispatch)
});
// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(CourtContainer);
