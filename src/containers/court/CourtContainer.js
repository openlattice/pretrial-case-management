/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { Map, List, Set } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavLink } from 'react-router-dom';
import { Constants } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClone } from '@fortawesome/pro-light-svg-icons';
import { faBell } from '@fortawesome/pro-solid-svg-icons';

import CONTENT from '../../utils/consts/ContentConsts';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import ToggleButtonsGroup from '../../components/buttons/ToggleButtons';
import HearingSettingsButton from '../../components/hearings/HearingSettingsButton';
import LogoLoader from '../../components/LogoLoader';
import PersonCard from '../../components/people/PersonCard';
import DatePicker from '../../components/datetime/DatePicker';
import PSAModal from '../psamodal/PSAModal';
import { formatPeopleInfo, sortPeopleByName } from '../../utils/PeopleUtils';
import * as Routes from '../../core/router/Routes';
import { StyledSectionWrapper } from '../../utils/Layout';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { DATE_FORMAT, TIME_FORMAT } from '../../utils/consts/DateTimeConsts';
import { DOMAIN } from '../../utils/consts/ReportDownloadTypes';
import { OL } from '../../utils/consts/Colors';
import {
  APP,
  COURT,
  EDM,
  PSA_ASSOCIATION,
  PSA_NEIGHBOR,
  STATE
} from '../../utils/consts/FrontEndStateConsts';

import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';

import { loadPSAModal } from '../psamodal/PSAModalActionFactory';
import { clearSubmit } from '../../utils/submit/SubmitActionFactory';
import { loadHearingsForDate } from '../hearings/HearingsActions';
import {
  changeHearingFilters,
  loadJudges,
  setCourtDate
} from './CourtActionFactory';
import {
  bulkDownloadPSAReviewPDF,
  checkPSAPermissions,
  loadCaseHistory
} from '../review/ReviewActionFactory';

const { PEOPLE } = APP_TYPES;

const { OPENLATTICE_ID_FQN } = Constants;


const Legend = styled.div`
  display: flex;
  flex-direction: row;
  padding: 10px;
`;

const LegendItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  font-size: 12px;
  margin-bottom: 10px;
  padding: 5px;
  svg {
    margin-right: 5px;
  }
`;

const StyledFormViewWrapper = styled.div`
  display: flex;
  max-width: 960px;
`;

const StyledFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 55px auto;
  width: 100%;
`;

const Subtitle = styled.div`
  height: 100%;
  font-size: 18px;
  display: flex;
  margin: 5.5px 10px;
`;

const Title = styled.div`
  height: 100%;
  font-size: 24px;
  display: flex;
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
  padding: 30px;
  text-align: left;
  width: 100%;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    color: ${OL.GREY01};
    padding-bottom: 30px;
  }
`;

const HearingRow = styled.div`
  display: flex;
  flex-direction: row;

  &:not(:last-child) {
    margin-bottom: 50px;
  }
`;

const Courtroom = styled.div`
  width: 200px;
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
  padding: 20px 0 0 20px;
  border: 1px solid ${OL.GREY08};
  display: grid;
  grid-template-columns: 31% 31% 31%;
  column-gap: 3%;
`;

const DatePickerWrapper = styled.div`
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
`;

const Label = styled.span`
  font-family: 'Open Sans', sans-serif;
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
  courtDate :DateTime,
  hearingsByTime :Map<*, *>,
  hearingNeighborsById :Map<*, *>,
  isLoadingPSAs :boolean,
  courtroom :string,
  courtrooms :List<*>,
  county :string,
  loadHearingsForDateReqState :RequestState,
  loadHearingNeighborsReqState :RequestState,
  peopleWithOpenPsas :Set<*>,
  peopleIdsToOpenPSAIds :Map<*>,
  peopleWithMultipleOpenPsas :Set<*>,
  peopleReceivingReminders :Set<*>,
  selectedOrganizationId :string,
  selectedOrganizationTitle :string,
  psaEditDatesById :Map<*, *>,
  actions :{
    bulkDownloadPSAReviewPDF :({ peopleEntityKeyIds :string[] }) => void,
    changeHearingFilters :({ county? :string, courtroom? :string }) => void,
    checkPSAPermissions :() => void,
    clearSubmit :() => void,
    downloadPSAReviewPDF :(values :{
      neighbors :Map<*, *>,
      scores :Map<*, *>
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Map<*, *>
    }) => void,
    loadHearingsForDate :(date :Object) => void,
    loadJudges :() => void,
  }
};

type State = {
  date :Object
}

const PENN_ROOM_PREFIX = 'Courtroom ';

class CourtContainer extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      psaModalOpen: false
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


  openPSAModal = ({ psaId }) => {
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
      selectedOrganizationId
    } = this.props;
    if (selectedOrganizationId) {
      actions.checkPSAPermissions();
      actions.loadJudges();
      if (!hearingsByTime.size || !hearingNeighborsById.size) {
        actions.loadHearingsForDate(courtDate);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      actions,
      courtDate,
      hearingsByTime,
      hearingNeighborsById,
      selectedOrganizationId
    } = this.props;
    if (selectedOrganizationId !== nextProps.selectedOrganizationId) {
      actions.checkPSAPermissions();
      actions.loadJudges();
      if (!hearingsByTime.size || !hearingNeighborsById.size || courtDate !== nextProps.courtDate) {
        actions.loadHearingsForDate(courtDate);
      }
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearSubmit();
  }

  loadCaseHistoryCallback = (personId, psaNeighbors) => {
    const { actions } = this.props;
    actions.loadCaseHistory({ personId, neighbors: psaNeighbors });
  }

  renderPersonCard = (person, _) => {
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
    const lastEditDate = DateTime.fromISO(psaEditDatesById.getIn(
      [openPSAId, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0],
      psaEditDatesById.getIn([openPSAId, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0],
        psaEditDatesById.getIn([openPSAId, PROPERTY_TYPES.DATE_TIME], ''))
    )).toFormat(DATE_FORMAT);
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

  downloadPDFs = (courtroom, people, time) => {
    const { actions } = this.props;
    const fileName = `${courtroom}-${DateTime.local().toISODate()}-${time}`;
    actions.bulkDownloadPSAReviewPDF({
      fileName,
      peopleEntityKeyIds: people.valueSeq().map(person => person.getIn([OPENLATTICE_ID_FQN, 0])).toJS()
    });
  }

  renderHearingRow = (courtroom, people, time) => {
    const sortedPeople = people.toList().sort(sortPeopleByName);
    return (
      <HearingRow key={`${courtroom}-${time}`}>
        <Courtroom key={`courtroom-${courtroom}-${time}`}>
          <span>{courtroom}</span>
          <SecondaryButton
              onClick={() => this.downloadPDFs(courtroom, people, time)}>
            Download PDFs
          </SecondaryButton>
        </Courtroom>
        <PeopleWrapper key={`people-${courtroom}-${time}`}>{sortedPeople.map(this.renderPersonCard)}</PeopleWrapper>
      </HearingRow>
    );
  }

  renderHearingsAtTime = (time) => {
    const {
      county,
      courtroom,
      hearingsByTime,
      hearingNeighborsById
    } = this.props;
    let hearingsByCourtroom = Map();

    hearingsByTime.get(time).forEach((hearing) => {
      let shouldInclude = true;
      const room = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');

      if (county.length || courtroom.length) {

        if (courtroom.length && room !== courtroom) {
          shouldInclude = false;
        }

        if (shouldInclude && county.length) {
          const isPenn = room.startsWith(PENN_ROOM_PREFIX);
          shouldInclude = isPenn ? county === DOMAIN.PENNINGTON : county === DOMAIN.MINNEHAHA;
        }
      }
      if (shouldInclude) {
        const hearingId = hearing.getIn([OPENLATTICE_ID_FQN, 0]);
        const person = hearingNeighborsById
          .getIn([hearingId, PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
        const personId = person.getIn([PROPERTY_TYPES.PERSON_ID, 0]);
        if (personId) {
          hearingsByCourtroom = hearingsByCourtroom
            .set(room, hearingsByCourtroom.get(room, Map()).set(personId, person));
        }
      }
    });


    if (!hearingsByCourtroom.size) return null;

    return (
      <HearingTime key={`HearingTime${time}${courtroom}${county}`}>
        <h1>{time}</h1>
        {
          hearingsByCourtroom.entrySeq()
            .map(([room, people]) => this.renderHearingRow(room, people, time)).toJS()
        }
      </HearingTime>
    );
  }

  onCountyChange = (county) => {
    const { actions } = this.props;
    actions.changeHearingFilters({
      county,
      courtroom: ''
    });
  }

  onCourtroomChange = (courtroom) => {
    const { actions } = this.props;
    actions.changeHearingFilters({ courtroom });
  }

  renderCountyChoices = () => {
    const { county } = this.props;
    const countyOptions = [
      { value: '', label: 'All' },
      { value: DOMAIN.PENNINGTON, label: 'Pennington' },
      { value: DOMAIN.MINNEHAHA, label: 'Minnehaha' },
    ];
    return (
      <ToggleWrapper>
        <ToggleButtonsGroup
            options={countyOptions}
            selectedOption={county}
            onSelect={this.onCountyChange} />
      </ToggleWrapper>
    );
  }

  renderCourtroomChoices = () => {
    const {
      county,
      courtroom,
      courtrooms
    } = this.props;

    const pennCoutrooms = courtrooms.filter(room => room.startsWith(PENN_ROOM_PREFIX)).toList().sort().map(value => ({
      value,
      label: value
    }));
    const minnCoutrooms = courtrooms.filter(room => !room.startsWith(PENN_ROOM_PREFIX)).toList().sort().map(value => ({
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

  handleDateChange = (dateStr) => {
    const { actions } = this.props;
    const courtDate = DateTime.fromFormat(dateStr, DATE_FORMAT);
    if (courtDate.isValid) {
      actions.setCourtDate({ courtDate });
      actions.loadHearingsForDate(courtDate);
    }
  }

  renderDatePicker = () => {
    const { courtDate } = this.props;
    return (
      <DatePickerWrapper>
        <Label>Hearing Date</Label>
        <DatePicker
            value={courtDate.toFormat(DATE_FORMAT)}
            onChange={this.handleDateChange} />
      </DatePickerWrapper>
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
      return dateTime1 <= dateTime2 ? -1 : 1;
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
            {this.renderLegend()}
            {this.renderCountyChoices()}
            {this.renderCourtroomChoices()}
            {this.renderSearchLink()}
            {this.renderContent()}
          </StyledSectionWrapper>
        </StyledFormWrapper>
        {this.renderPSAModal()}
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const court = state.get(STATE.COURT);
  const edm = state.get(STATE.EDM);
  const hearings = state.get(STATE.HEARINGS);
  const courtDate = court.get(COURT.COURT_DATE).toISODate();
  const hearingsByTime = hearings.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, courtDate], Map())
  return {
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_TITLE]: app.get(APP.SELECTED_ORG_TITLE),

    // Court
    [COURT.COURT_DATE]: court.get(COURT.COURT_DATE),
    [COURT.PEOPLE_WITH_OPEN_PSAS]: court.get(COURT.PEOPLE_WITH_OPEN_PSAS),
    [COURT.PEOPLE_WITH_MULTIPLE_OPEN_PSAS]: court.get(COURT.PEOPLE_WITH_MULTIPLE_OPEN_PSAS),
    [COURT.PEOPLE_RECEIVING_REMINDERS]: court.get(COURT.PEOPLE_RECEIVING_REMINDERS),
    [COURT.LOADING_PSAS]: court.get(COURT.LOADING_PSAS),
    [COURT.COUNTY]: court.get(COURT.COUNTY),
    [COURT.COURTROOM]: court.get(COURT.COURTROOM),
    [COURT.COURTROOMS]: court.get(COURT.COURTROOMS),
    [COURT.SCORES_AS_MAP]: court.get(COURT.SCORES_AS_MAP),
    [COURT.PSA_EDIT_DATES]: court.get(COURT.PSA_EDIT_DATES),
    [COURT.OPEN_PSA_IDS]: court.get(COURT.OPEN_PSA_IDS),
    [COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS]: court.get(COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS),
    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),

    // Hearings
    hearingsByTime,
    loadHearingsForDateReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE),
    loadHearingNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS),
    [HEARINGS_DATA.HEARINGS_BY_DATE]: hearings.get(HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME),
    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Court actions
    changeHearingFilters,
    loadJudges,
    setCourtDate,
    // Hearings Actions
    loadHearingsForDate,
    // PSA Modal actions
    loadPSAModal,
    // Review actions
    bulkDownloadPSAReviewPDF,
    checkPSAPermissions,
    loadCaseHistory,
    // Submit Actions
    clearSubmit
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(CourtContainer);
