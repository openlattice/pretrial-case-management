/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';
import InputRange from 'react-input-range';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  ButtonToolbar,
  DropdownButton,
  MenuItem,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap';

import LoadingSpinner from '../../components/LoadingSpinner';
import PersonCard from '../../components/people/PersonCard';
import * as CourtActionFactory from './CourtActionFactory';
import * as FormActionFactory from '../psa/FormActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import { StyledSectionWrapper } from '../../utils/Layout';
import { TIME_FORMAT, formatDate } from '../../utils/Utils';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { DOMAIN } from '../../utils/consts/ReportDownloadTypes';
import { sortPeopleByName } from '../../utils/PSAUtils';

const ToolbarWrapper = styled(ButtonToolbar)`
  margin-bottom: 20px;
`;

const StyledFormViewWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const StyledFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 55px auto;
  width: 1300px;
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
`;

const Courtroom = styled.div`
  width: 200px;
  padding: 20px;
  background-color: #f0f0f7;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PeopleWrapper = styled.div`
  width: 100%;
  padding: 20px 0 0 20px;
  border: 1px solid #f0f0f7;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

type Props = {
  hearingsToday :Immutable.List<*>,
  hearingsByTime :Immutable.Map<*, *>,
  hearingNeighborsById :Immutable.Map<*, *>,
  isLoadingHearings :boolean,
  loadingError :boolean,
  courtroom :string,
  county :string,
  actions :{
    changeHearingFilters :({ county? :string, courtroom? :string }) => void,
    loadHearingsToday :() => void
  }
};

type State = {
  timeRange :{
    min :number,
    max :number
  }
}

const PENN_ROOM_PREFIX = 'Courtroom ';

class CourtContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      timeRange: {
        min: 0,
        max: 0
      }
    };
  }

  componentDidMount() {
    if (!this.props.hearingsByTime.size || !this.props.hearingNeighborsById.size) {
      this.props.actions.loadHearingsToday();
    }
  }

  renderPersonCard = (person) => {
    const formattedDOB = formatDate(moment(person.getIn([PROPERTY_TYPES.DOB, 0], '')));
    const personObj = {
      identification: person.getIn([PROPERTY_TYPES.PERSON_ID, 0]),
      firstName: person.getIn([PROPERTY_TYPES.FIRST_NAME, 0]),
      lastName: person.getIn([PROPERTY_TYPES.LAST_NAME, 0]),
      dob: formattedDOB,
      photo: person.getIn([PROPERTY_TYPES.PICTURE, 0])
    };
    return <PersonCard key={person.identification} person={personObj} />;
  }

  renderHearingRow = (courtroom, people) => {
    return (
      <HearingRow>
        <Courtroom>{courtroom}</Courtroom>
        <PeopleWrapper>{people.valueSeq().sort(sortPeopleByName).map(this.renderPersonCard)}</PeopleWrapper>
      </HearingRow>
    )
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
        const hearingId = hearing.getIn(['id', 0]);
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
        {hearingsByCourtroom.entrySeq().map(([courtroom, people]) => this.renderHearingRow(courtroom, people)).toJS()}
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

  getTimeAsNum = (time) => {
    const hourSplit = time.split(':');
    if (hourSplit.length > 1) {
      const hour = Number.parseInt(hourSplit[0], 10);
      const minutes = Number.parseInt(hourSplit[1].split(' ')[0], 10);

      if (!Number.isNaN(hour) && !Number.isNaN(minutes)) {
        return (hour * 60) + minutes;
      }
    }
    return 0;
  }

  getNumAsTime = (num) => {
    const hours = Math.floor(num / 60);
    const hourStr = (hours < 10) ? `0${hours}` : hours.toString();

    const mins = (num % 60);
    const minStr = (mins < 10) ? `0${mins}` : mins.toString();

    const a = hours > 11 ? 'pm' : 'am';
    return `${hourStr}:${minStr} ${a}`;
  }

  renderTimeRange = () => {
    return null;
    let minTime;
    let maxTime;
    this.props.hearingsByTime.keySeq().forEach((timeStr) => {
      const time = moment(timeStr, TIME_FORMAT);
      if (!minTime || time.isBefore(minTime)) {
        minTime = time;
      }
      if (!maxTime || time.isAfter(maxTime)) {
        maxTime = time;
      }
    });

    if (minTime && maxTime) {
      const min = this.getTimeAsNum(minTime.format(TIME_FORMAT));
      const max = this.getTimeAsNum(maxTime.format(TIME_FORMAT));

      let { timeRange } = this.state;
      if (timeRange.max === 0) {
        timeRange = { min, max };
        this.setState({ timeRange });
      }

      return (
        <InputRange
            maxValue={max}
            minValue={min}
            step={15}
            formatLabel={this.getNumAsTime}
            value={timeRange}
            onChange={timeRange => this.setState({ timeRange })} />
      );
    }

    return null;

  }

  renderContent = () => {
    if (this.props.isLoadingHearings) {
      return <LoadingSpinner />;
    }

    const timeOptions = this.props.hearingsByTime.keySeq().sort((time1, time2) => {
      return moment(time1, TIME_FORMAT).isSameOrBefore(moment(time2, TIME_FORMAT)) ? -1 : 1;
    });

    return timeOptions.map(this.renderHearingsAtTime);

  }

  render() {
    return (
      <StyledFormViewWrapper>
        <StyledFormWrapper>
          <StyledTitleWrapper>
            <div>Initial Appearances Today</div>
          </StyledTitleWrapper>
          <StyledSectionWrapper>
            {this.renderCountyChoices()}
            {this.renderCourtroomChoices()}
            {this.renderTimeRange()}
            {this.renderContent()}
          </StyledSectionWrapper>
        </StyledFormWrapper>
      </StyledFormViewWrapper>
    );
  }
}

function mapStateToProps(state) {
  const court = state.get('court');
  return {
    hearingsToday: court.get('hearingsToday'),
    hearingsByTime: court.get('hearingsByTime'),
    hearingNeighborsById: court.get('hearingNeighborsById'),
    isLoadingHearings: court.get('isLoadingHearings'),
    loadingError: court.get('loadingError'),
    county: court.get('county'),
    courtroom: court.get('courtroom')
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

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CourtContainer);
