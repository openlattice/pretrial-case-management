/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import moment from 'moment';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import InfoButton from '../../components/buttons/InfoButton';
import BasicButton from '../../components/buttons/BasicButton';
import DatePicker from '../../components/controls/StyledDatePicker';
import SearchableSelect from '../../components/controls/SearchableSelect';
import HearingCardsHolder from '../../components/hearings/HearingCardsHolder';
import psaHearingConfig from '../../config/formconfig/PSAHearingConfig';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { FORM_IDS, ID_FIELD_NAMES, HEARING } from '../../utils/consts/Consts';
import { getCourtroomOptions } from '../../utils/consts/HearingConsts';
import { getTimeOptions } from '../../utils/consts/DateTimeConsts';
import { STATE, REVIEW } from '../../utils/consts/FrontEndStateConsts';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';


const Container = styled.div`
  padding: 30px;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 20px 0;

  span {
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    font-weight: normal;
    color: #555e6f;
  }
`;

const CenteredContainer = styled.div`
  width: 100%;
  text-align: center;
`;

const StyledSearchableSelect = styled(SearchableSelect)`
  input {
    width: 100%;
  }
`;

const CreateButton = styled(InfoButton)`
  width: 210px;
  height: 40px;
  padding-left: 0;
  padding-right: 0;
`;

const ExistingButton = styled(BasicButton)`
  width: 210px;
  height: 40px;
  padding-left: 0;
  padding-right: 0;
`;

const InputRow = styled.div`
  display: inline-flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;

  section {
    width: 25%;
    padding: 0 2.5% 0 2.5%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`;

const InputLabel = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  text-align: left;
  color: #555e6f;
  margin-bottom: 10px;
`;

type Props = {
  personId :string,
  psaId :string,
  psaEntityKeyId? :string,
  hearings :Immutable.List<*, *>,
  actions :{
    submit :(values :{
      config :Immutable.Map<*, *>,
      values :Immutable.Map<*, *>,
      callback :() => void
    }) => void,
    refreshPSANeighbors :({ id :string }) => void
  },
  onSubmit? :(hearing :Object) => void
}

type State = {
  manuallyCreatingHearing :boolean,
  newHearingDate :?string,
  newHearingTime :?string,
  newHearingCourtroom :?string
};

class SelectHearingsContainer extends React.Component<Props, State> {

  static defaultProps = {
    onSubmit: () => {}
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      manuallyCreatingHearing: false,
      newHearingDate: undefined,
      newHearingTime: undefined,
      newHearingCourtroom: undefined
    };
  }

  onInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  getSortedHearings = () => this.props.hearings.sort((h1, h2) =>
    (moment(h1.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')).isBefore(h2.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''))
      ? 1 : -1))

  isReadyToSubmit = () => this.state.newHearingCourtroom && this.state.newHearingDate && this.state.newHearingTime

  selectHearing = (hearingDetails) => {
    const { psaId, personId, psaEntityKeyId } = this.props;
    const values = Object.assign({}, hearingDetails, {
      [ID_FIELD_NAMES.PSA_ID]: psaId,
      [FORM_IDS.PERSON_ID]: personId
    });

    const callback = psaEntityKeyId ? () => this.props.actions.refreshPSANeighbors({ id: psaEntityKeyId }) : () => {};
    this.props.actions.submit({
      values,
      config: psaHearingConfig,
      callback
    });
  }

  selectCurrentHearing = () => {
    const dateFormat = 'MM/DD/YYYY';
    const timeFormat = 'hh:mm a';
    const date = moment(this.state.newHearingDate);
    const time = moment(this.state.newHearingTime, timeFormat);
    if (date.isValid() && time.isValid()) {
      const datetime = moment(`${date.format(dateFormat)} ${time.format(timeFormat)}`, `${dateFormat} ${timeFormat}`);
      const hearing = {
        [ID_FIELD_NAMES.HEARING_ID]: randomUUID(),
        [HEARING.DATE_TIME]: datetime.toISOString(true),
        [HEARING.COURTROOM]: this.state.newHearingCourtroom,
        [PROPERTY_TYPES.HEARING_TYPE]: 'Initial Appearance'
      };

      this.selectHearing(hearing);
      this.props.onSubmit(hearing);
    }
  }

  selectExistingHearing = (row, hearingId) => {
    const hearingWithOnlyId = { [ID_FIELD_NAMES.HEARING_ID]: hearingId };
    this.selectHearing(hearingWithOnlyId);
    this.props.onSubmit(Object.assign({}, hearingWithOnlyId, {
      [HEARING.DATE_TIME]: row.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''),
      [HEARING.COURTROOM]: row.getIn([PROPERTY_TYPES.COURTROOM, 0], '')
    }));
  }

  renderNewHearingSection = () => (
    <CenteredContainer>
      <InputRow>
        <section>
          <InputLabel>Date</InputLabel>
          <DatePicker
              value={this.state.newHearingDate}
              onChange={newHearingDate => this.setState({ newHearingDate })}
              clearButton={false} />
        </section>
        <section>
          <InputLabel>Time</InputLabel>
          <StyledSearchableSelect
              options={getTimeOptions()}
              value={this.state.newHearingTime}
              onSelect={newHearingTime => this.setState({ newHearingTime })}
              short />
        </section>
        <section>
          <InputLabel>Courtroom</InputLabel>
          <StyledSearchableSelect
              options={getCourtroomOptions()}
              value={this.state.newHearingCourtroom}
              onSelect={newHearingCourtroom => this.setState({ newHearingCourtroom })}
              short />
        </section>
        <section>
          <InputLabel />
          <CreateButton disabled={!this.isReadyToSubmit()} onClick={this.selectCurrentHearing}>
            Create New
          </CreateButton>
        </section>
      </InputRow>
    </CenteredContainer>
  )

  switchView = () => this.setState({ manuallyCreatingHearing: !this.state.manuallyCreatingHearing });

  render() {
    const { manuallyCreatingHearing } = this.state;

    if (manuallyCreatingHearing) {
      return (
        <Container>
          <Header>
            <span>Create New Hearing</span>
            <ExistingButton onClick={this.switchView}>Select from Existing</ExistingButton>
          </Header>
          {this.renderNewHearingSection()}
        </Container>
      );
    }

    return (
      <Container>
        <Header>
          <span>Select a Hearing</span>
          <CreateButton onClick={this.switchView}>Create New Hearing</CreateButton>
        </Header>
        <HearingCardsHolder hearings={this.getSortedHearings()} handleSelect={this.selectExistingHearing} />
      </Container>
    );
  }
}

function mapStateToProps(state) {
  const review = state.get(STATE.REVIEW);
  return {
    [REVIEW.SCORES]: review.get(REVIEW.SCORES),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.ERROR]: review.get(REVIEW.ERROR)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
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

export default connect(mapStateToProps, mapDispatchToProps)(SelectHearingsContainer);
