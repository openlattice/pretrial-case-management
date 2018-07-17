/*
 * @flow
 */

import React from 'react';
import FontAwesome from 'react-fontawesome';
import Immutable from 'immutable';
import moment from 'moment';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import InfoButton from '../../components/buttons/InfoButton';
import LoadingSpinner from '../../components/LoadingSpinner';
import DateTimePicker from '../../components/controls/StyledDateTimePicker';
import SearchableSelect from '../../components/controls/SearchableSelect';
import HearingsTable from '../../components/hearings/HearingsTable';
import psaHearingConfig from '../../config/formconfig/PSAHearingConfig';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { FORM_IDS, ID_FIELD_NAMES, HEARING } from '../../utils/consts/Consts';
import { getCourtroomOptions } from '../../utils/consts/HearingConsts';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';

const Header = styled.div`
  width: 100%;
  text-align: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  margin: 20px 0;
`;

const DividerOr = styled(Header)`
  font-size: 14px;
  color: #8e929b;
`;

const CenteredContainer = styled.div`
  width: 100%;
  text-align: center;
`;

const InputRow = styled.div`
  display: inline-flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 700px;

  section {
    width: 30%;
  }
`;

type Props = {
  personId :string,
  psaId :string,
  hearings :Immutable.List<*, *>,
  scoresAsMap :Immutable.Map<*, *>,
  loadingResults :boolean,
  errorMessage :string,
  actions :{
    submit :(values :{
      config :Immutable.Map<*, *>,
      values :Immutable.Map<*, *>,
      callback :() => void
    }) => void,
    refreshPSANeighbors :({ id :string }) => void
  }
}

type State = {
  manuallyCreatingHearing :boolean,
  newHearingDateTime :?string,
  newHearingCourtroom :?string
};

class SelectHearingsContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      manuallyCreatingHearing: false,
      newHearingDateTime: null,
      newHearingCourtroom: null
    };
  }

  onInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  getSortedHearings = () => this.props.hearings.sort((h1, h2) =>
    (moment(h1.getIn([PROPERTY_TYPES.DATE_TIME, 0], '')).isBefore(h2.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''))
      ? 1 : -1))

  isReadyToSubmit = () => this.state.newHearingCourtroom && this.state.newHearingDateTime

  selectHearing = (hearingDetails) => {
    const { psaId, personId, psaEntityKeyId } = this.props;
    const values = Object.assign({}, hearingDetails, {
      [ID_FIELD_NAMES.PSA_ID]: psaId,
      [FORM_IDS.PERSON_ID]: personId
    });

    this.props.actions.submit({
      values,
      config: psaHearingConfig,
      callback: () => this.props.actions.refreshPSANeighbors({ id: psaEntityKeyId })
    });
  }

  selectCurrentHearing = () => {
    this.selectHearing({
      [ID_FIELD_NAMES.HEARING_ID]: randomUUID(),
      [HEARING.DATE_TIME]: this.state.newHearingDateTime.toISOString(true),
      [HEARING.COURTROOM]: this.state.newHearingCourtroom
    });
  }

  selectExistingHearing = (row, hearingId) => {
    this.selectHearing({ [ID_FIELD_NAMES.HEARING_ID]: hearingId });
  }

  renderNewHearingSection = () => {
    return this.state.manuallyCreatingHearing ? (
      <CenteredContainer>
        <InputRow>
          <section>
            <DateTimePicker
                value={this.state.newHearingDateTime}
                onChange={newHearingDateTime => this.setState({ newHearingDateTime })} />
          </section>
          <section>
            <SearchableSelect
                options={getCourtroomOptions()}
                value={this.state.newHearingCourtroom}
                onSelect={newHearingCourtroom => this.setState({ newHearingCourtroom })}
                short />
          </section>
          <section>
            <InfoButton disabled={!this.isReadyToSubmit()} onClick={this.selectCurrentHearing}>Select</InfoButton>
          </section>
        </InputRow>
      </CenteredContainer>
    ) : (
      <CenteredContainer>
        <InfoButton onClick={() => this.setState({ manuallyCreatingHearing: true })}>New</InfoButton>
      </CenteredContainer>
    );
  }

  render() {
    return (
      <div>
        <Header>Create new hearing</Header>
        {this.renderNewHearingSection()}
        <DividerOr>OR</DividerOr>
        <Header>Select existing hearing</Header>
        <HearingsTable rows={this.getSortedHearings()} handleSelect={this.selectExistingHearing} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const review = state.get('review');
  return {
    scoresAsMap: review.get('scoresAsMap'),
    psaNeighborsById: review.get('psaNeighborsById'),
    loadingResults: review.get('loadingResults'),
    errorMessage: review.get('errorMessage')
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
