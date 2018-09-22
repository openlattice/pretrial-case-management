/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NavLink } from 'react-router-dom';
import { Constants } from 'lattice';
import {
  ButtonToolbar,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap';

import SecondaryButton from '../../components/buttons/SecondaryButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import PersonCard from '../../components/people/PersonCard';
import StyledDatePicker from '../../components/controls/StyledDatePicker';
import * as Routes from '../../core/router/Routes';
import { StyledSectionWrapper } from '../../utils/Layout';
import { TIME_FORMAT, formatDate } from '../../utils/FormattingUtils';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { DOMAIN } from '../../utils/consts/ReportDownloadTypes';
import { STATE, COURT, REVIEW, SUBMIT, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import { sortPeopleByName } from '../../utils/PSAUtils';

import * as CourtActionFactory from './CourtActionFactory';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

const ToolbarWrapper = styled(ButtonToolbar)`
  margin-bottom: 20px;
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

const StyledTitleWrapper = styled.div`
  align-items: center;
  color: #37454a;
  display: flex;
  font-size: 32px;
  justify-content: space-between;
  margin-bottom: 30px;
  width: 100%;
`;

const Toggle = styled(ToggleButton)`
  -webkit-appearance: none !important;
`;

const HearingTime = styled.div`
  border-bottom: 1px solid #e1e1eb;
  padding: 30px;
  text-align: left;
  width: 100%;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    color: #555e6f;
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
  background-color: #f0f0f7;
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
  border: 1px solid #f0f0f7;
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

const SpinnerWrapper = styled.div`
  margin-top: 30px;
`;

type Props = {
  hearingsToday :Immutable.List<*>,
  hearingsByTime :Immutable.Map<*, *>,
  hearingNeighborsById :Immutable.Map<*, *>,
  isLoadingHearings :boolean,
  isLoadingPSAs :boolean,
  loadingError :boolean,
  courtroom :string,
  county :string,
  peopleWithOpenPsas :Immutable.Set<*>,
  openPSANeighbors :Immutable.Map<*>,
  caseHistory :Immutable.List<*>,
  manualCaseHistory :Immutable.List<*>,
  chargeHistory :Immutable.Map<*, *>,
  manualChargeHistory :Immutable.Map<*, *>,
  sentenceHistory :Immutable.Map<*, *>,
  ftaHistory :Immutable.Map<*, *>,
  hearings :Immutable.List<*>,
  loadingPSAData :boolean,
  submitting :boolean,
  actions :{
    bulkDownloadPSAReviewPDF :({ peopleEntityKeyIds :string[] }) => void,
    changeHearingFilters :({ county? :string, courtroom? :string }) => void,
    checkPSAPermissions :() => void,
    clearSubmit :() => void,
    deleteEntity :(value :{ entitySetName :string, entityKeyId :string }) => void,
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Immutable.Map<*, *>
    }) => void,
    loadHearingsForDate :(date :Object) => void,
    loadPSAsByDate :(filter :string) => void,
    refreshPSANeighbors :({ id :string }) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
    searchPeopleRequest :(firstName :string, lastName :string, dob :string) => void,
    submit :(value :{ config :Object, values :Object}) => void,
    loadPSAData :(psaIds :string[]) => void
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
      date: moment()
    };
  }

  componentDidMount() {
    this.props.actions.checkPSAPermissions();
    if (!this.props.hearingsByTime.size || !this.props.hearingNeighborsById.size) {
      this.props.actions.loadHearingsForDate(this.state.date);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { openPSAIds } = this.props;
    if (openPSAIds.size !== nextProps.openPSAIds.size) {
      this.props.actions.loadPSAData(nextProps.openPSAIds.toJS());
    }
  }

  componentWillUnmount() {
    this.props.actions.clearSubmit();
  }


  renderPersonCard = (person, index) => {
    const personId = person.getIn([PROPERTY_TYPES.PERSON_ID, 0]);
    const personOlId = person.getIn([OPENLATTICE_ID_FQN, 0]);
    const openPSAId = this.props.peopleIdsToOpenPSAIds.get(personOlId, '');
    const dobMoment = moment(person.getIn([PROPERTY_TYPES.DOB, 0], ''));
    const formattedDOB = dobMoment.isValid() ? formatDate(dobMoment) : '';
    const caseHistory = this.props.caseHistory.get(personOlId, Immutable.List());
    const manualCaseHistory = this.props.manualCaseHistory.get(personOlId, Immutable.List());
    const chargeHistory = this.props.chargeHistory.get(personOlId, Immutable.Map());
    const manualChargeHistory = this.props.manualChargeHistory.get(personOlId, Immutable.Map());
    const sentenceHistory = this.props.sentenceHistory.get(personOlId, Immutable.Map());
    const ftaHistory = this.props.ftaHistory.get(personOlId, Immutable.Map());
    const hearings = this.props.hearings.get(personOlId, Immutable.List());
    const hasOpenPSA = this.props.peopleWithOpenPsas.has(person.getIn([OPENLATTICE_ID_FQN, 0]));
    const scores = this.props.openPSANeighbors.getIn([personOlId, ENTITY_SETS.PSA_SCORES, 0, PSA_NEIGHBOR.DETAILS], Immutable.Map());
    const neighbors = this.props.psaNeighborsById.get(openPSAId, Immutable.Map());
    const personObj = {
      identification: personId,
      firstName: person.getIn([PROPERTY_TYPES.FIRST_NAME, 0]),
      middleName: person.getIn([PROPERTY_TYPES.MIDDLE_NAME, 0]),
      lastName: person.getIn([PROPERTY_TYPES.LAST_NAME, 0]),
      dob: formattedDOB,
      photo: person.getIn([PROPERTY_TYPES.PICTURE, 0])
    };
    const entityKeyId = scores.getIn([OPENLATTICE_ID_FQN, 0]);
    return (
      <PersonCard
          key={`${personObj.identification}-${index}`}
          entityKeyId={entityKeyId}
          person={person}
          personObj={personObj}
          hasOpenPSA={hasOpenPSA}
          scores={scores}
          neighbors={neighbors}
          downloadFn={this.props.actions.downloadPSAReviewPDF}
          loadCaseHistoryFn={this.props.actions.loadCaseHistory}
          submitData={this.props.actions.submit}
          replaceEntity={this.props.actions.replaceEntity}
          deleteEntity={this.props.actions.deleteEntity}
          caseHistory={caseHistory}
          manualCaseHistory={manualCaseHistory}
          chargeHistory={chargeHistory}
          manualChargeHistory={manualChargeHistory}
          sentenceHistory={sentenceHistory}
          ftaHistory={ftaHistory}
          hearings={hearings}
          judgesview />
    );
  }

  downloadPDFs = (courtroom, people, time) => {
    const fileName = `${courtroom}-${moment().format('YYYY-MM-DD')}-${time}`;
    this.props.actions.bulkDownloadPSAReviewPDF({
      fileName,
      peopleEntityKeyIds: people.valueSeq().map(person => person.getIn([OPENLATTICE_ID_FQN, 0])).toJS()
    });
  }

  renderHearingRow = (courtroom, people, time) => {
    const persons = people.toList().sort(sortPeopleByName);
    return (
      <HearingRow key={`${courtroom}-${time}`}>
        <Courtroom>
          <span>{courtroom}</span>
          <SecondaryButton onClick={() => this.downloadPDFs(courtroom, people, time)}>Download PDFs</SecondaryButton>
        </Courtroom>
        <PeopleWrapper>{persons.map(this.renderPersonCard)}</PeopleWrapper>
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
    let hearingsByCourtroom = Immutable.Map();

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
        const person = hearingNeighborsById.getIn([hearingId, ENTITY_SETS.PEOPLE], Immutable.Map());
        const personId = person.getIn([PROPERTY_TYPES.PERSON_ID, 0]);
        if (personId) {
          hearingsByCourtroom = hearingsByCourtroom
            .set(room, hearingsByCourtroom.get(room, Immutable.Map()).set(personId, person));
        }
      }
    });


    if (!hearingsByCourtroom.size) return null;

    return (
      <HearingTime key={time}>
        <h1>{time}</h1>
        {
          hearingsByCourtroom.entrySeq()
            .map(([room, people]) => this.renderHearingRow(room, people, time)).toJS()
        }
      </HearingTime>
    );
  }

  onCountyChange = (county) => {
    this.props.actions.changeHearingFilters({
      county,
      courtroom: ''
    });
  }

  onCourtroomChange = (courtroom) => {
    this.props.actions.changeHearingFilters({ courtroom });
  }

  renderCountyChoices = () => (
    <ToolbarWrapper>
      <ToggleButtonGroup type="radio" name="countyPicker" value={this.props.county} onChange={this.onCountyChange}>
        <Toggle value="">All</Toggle>
        <Toggle value={DOMAIN.PENNINGTON}>Pennington</Toggle>
        <Toggle value={DOMAIN.MINNEHAHA}>Minnehaha</Toggle>
      </ToggleButtonGroup>
    </ToolbarWrapper>
  )

  renderCourtroomChoices = () => {
    const { county, courtroom, hearingsByTime } = this.props;

    let courtrooms = Immutable.Set();
    hearingsByTime.valueSeq().forEach(hearingList => hearingList.forEach((hearing) => {
      const room = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0]);
      if (room) {
        courtrooms = courtrooms.add(room);
      }
    }));
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
      <ToolbarWrapper>
        <ToggleButtonGroup type="radio" name="roomPicker" value={courtroom} onChange={this.onCourtroomChange}>
          {roomOptions.map(room => <Toggle key={room.value} value={room.value}>{room.label}</Toggle>)}
        </ToggleButtonGroup>
      </ToolbarWrapper>
    );
  }

  handleDateChange = (dateStr) => {
    const date = moment(dateStr);
    if (date.isValid()) {
      this.setState({ date });
      this.props.actions.loadHearingsForDate(date);
    }
  }

  renderDatePicker = () => {
    return (
      <DatePickerWrapper>
        <Label>Hearing Date</Label>
        <StyledDatePicker value={this.state.date.format('YYYY-MM-DD')} onChange={this.handleDateChange} />
      </DatePickerWrapper>
    );
  }

  renderSearchLink = () => {
    return (
      <NavLink to={Routes.SEARCH_PEOPLE} name={Routes.SEARCH_PEOPLE}>Search All People</NavLink>
    );
  }

  renderContent = () => {
    if (this.props.loadingPSAData) {
      return <SpinnerWrapper><LoadingSpinner /></SpinnerWrapper>;
    }

    const timeOptions = this.props.hearingsByTime.keySeq().sort((time1, time2) =>
      (moment(time1, TIME_FORMAT).isSameOrBefore(moment(time2, TIME_FORMAT)) ? -1 : 1));


    return timeOptions.map(this.renderHearingsAtTime);

  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledTitleWrapper>
            <div>Initial Appearances</div>
          </StyledTitleWrapper>
          <StyledSectionWrapper>
            {this.renderDatePicker()}
            {this.renderCountyChoices()}
            {this.renderCourtroomChoices()}
            {this.renderSearchLink()}
            {this.renderContent()}
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const court = state.get(STATE.COURT);
  const review = state.get(STATE.REVIEW);
  const submit = state.get(STATE.SUBMIT);
  return {
    [COURT.HEARINGS_TODAY]: court.get(COURT.HEARINGS_TODAY),
    [COURT.HEARINGS_BY_TIME]: court.get(COURT.HEARINGS_BY_TIME),
    [COURT.HEARINGS_NEIGHBORS_BY_ID]: court.get(COURT.HEARINGS_NEIGHBORS_BY_ID),
    [COURT.PEOPLE_WITH_OPEN_PSAS]: court.get(COURT.PEOPLE_WITH_OPEN_PSAS),
    [COURT.LOADING_HEARINGS]: court.get(COURT.LOADING_HEARINGS),
    [COURT.LOADING_PSAS]: court.get(COURT.LOADING_PSAS),
    [COURT.LOADING_ERROR]: court.get(COURT.LOADING_ERROR),
    [COURT.COUNTY]: court.get(COURT.COUNTY),
    [COURT.COURTROOM]: court.get(COURT.COURTROOM),
    [COURT.OPEN_PSA_NEIGHBORS]: court.get(COURT.OPEN_PSA_NEIGHBORS),
    [COURT.OPEN_PSA_IDS]: court.get(COURT.OPEN_PSA_IDS),
    [COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS]: court.get(COURT.PEOPLE_IDS_TO_OPEN_PSA_IDS),

    [REVIEW.CASE_HISTORY]: review.get(REVIEW.CASE_HISTORY),
    [REVIEW.MANUAL_CASE_HISTORY]: review.get(REVIEW.MANUAL_CASE_HISTORY),
    [REVIEW.CHARGE_HISTORY]: review.get(REVIEW.CHARGE_HISTORY),
    [REVIEW.MANUAL_CHARGE_HISTORY]: review.get(REVIEW.MANUAL_CHARGE_HISTORY),
    [REVIEW.SENTENCE_HISTORY]: review.get(REVIEW.SENTENCE_HISTORY),
    [REVIEW.FTA_HISTORY]: review.get(REVIEW.FTA_HISTORY),
    [REVIEW.HEARINGS]: review.get(REVIEW.HEARINGS),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.PSA_IDS_REFRESHING]: review.get(REVIEW.PSA_IDS_REFRESHING),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.NEIGHBORS_BY_DATE]: review.get(REVIEW.NEIGHBORS_BY_DATE),
    [REVIEW.ALL_FILERS]: review.get(REVIEW.ALL_FILERS),

    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(CourtActionFactory).forEach((action :string) => {
    actions[action] = CourtActionFactory[action];
  });

  Object.keys(FormActionFactory).forEach((action :string) => {
    actions[action] = FormActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CourtContainer);
