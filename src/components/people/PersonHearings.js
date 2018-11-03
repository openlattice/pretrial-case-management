/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Modal } from 'react-bootstrap';
import { Map } from 'immutable';

import closeX from '../../assets/svg/close-x-gray.svg';
import HearingCardsWithTitle from '../hearings/HearingCardsWithTitle';
import InfoButton from '../buttons/InfoButton';
import NewHearingSection from '../hearings/NewHearingSection';
import LoadingSpinner from '../LoadingSpinner';
import psaHearingConfig from '../../config/formconfig/PSAHearingConfig';
import { FORM_IDS, ID_FIELD_NAMES } from '../../utils/consts/Consts';
import {
  STATE,
  REVIEW,
  COURT
} from '../../utils/consts/FrontEndStateConsts';
import {
  StyledColumn,
  StyledColumnRow,
  StyledColumnRowWrapper,
  Wrapper
} from '../../utils/Layout';

import * as OverrideClassNames from '../../utils/styleoverrides/OverrideClassNames';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as ReviewActionFactory from '../../containers/review/ReviewActionFactory';
import * as CourtActionFactory from '../../containers/court/CourtActionFactory';

const PaddedStyledColumnRow = styled(StyledColumnRow)`
  padding: 30px;
  hr {
    height: 1px;
    overflow: visible;
    width: calc(100% + 60px);
    margin: 0 -30px;
  }
`;
const NoBorderStyledColumnRow = styled(PaddedStyledColumnRow)`
  padding: 30px;
  border: none;
`;

const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CloseModalX = styled.img.attrs({
  alt: '',
  src: closeX
})`
  height: 16px;
  width: 16px;
  margin-left: 40px;

  &:hover {
    cursor: pointer;
  }
`;

const StyledInfoButton = styled(InfoButton)`
  width: 178px;
  height: 40px;
  padding: 0;
`;

type Props = {
  jurisdiction :?string,
  loading :boolean,
  scheduledHearings :List<*, *>,
  pastHearings :List<*, *>,
  hearingsWithOutcomes :List<*, *>,
  availableHearings :List<*, *>,
  personId :?string,
  psaEntityKeyId :Map<*, *>,
  psaId :?string,
  actions :{
    deleteEntity :(values :{
      entitySetId :string,
      entityKeyId :string
    }) => void,
    loadHearingNeighbors :(hearingIds :string[]) => void,
    submit :(values :{
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
    refreshPSANeighbors :({ id :string }) => void,
    refreshHearingNeighbors :({ id :string }) => void,
    replaceAssociation :(values :{
      associationEntity :Map<*, *>,
      associationEntityName :string,
      associationEntityKeyId :string,
      srcEntityName :string,
      srcEntityKeyId :string,
      dstEntityName :string,
      dstEntityKeyId :string,
      callback :() => void
    }) => void
  }
}

type State = {
  jurisdiction :?string,
  personId :?string,
  psaId :?string,
  selectedHearing :Object,
  selectingReleaseConditions :boolean
};

class PersonHearings extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      manuallyCreatingHearing: false,
      newHearingModalOpen: false,
      selectingReleaseConditions: false
    };
  }

  openNewHearingModal = () => this.setState({ newHearingModalOpen: true })

  onClose = () => this.setState({
    newHearingModalOpen: false,
    manuallyCreatingHearing: false
  })

  manuallyCreatingHearing = () => this.setState({ manuallyCreatingHearing: true })

  renderCreateHearingButton = () => (
    <StyledInfoButton onClick={this.manuallyCreatingHearing}>Create New Hearing</StyledInfoButton>
  )

  renderAddHearingButton = () => (
    <StyledInfoButton onClick={this.openNewHearingModal}>Add New Hearing</StyledInfoButton>
  )

  selectHearing = (hearingDetails) => {
    const {
      psaId,
      personId,
      psaEntityKeyId,
      actions
    } = this.props;

    const values = Object.assign({}, hearingDetails, {
      [ID_FIELD_NAMES.PSA_ID]: psaId,
      [FORM_IDS.PERSON_ID]: personId
    });

    const callback = psaEntityKeyId ? () => actions.refreshPSANeighbors({ id: psaEntityKeyId }) : () => {};
    actions.submit({
      values,
      config: psaHearingConfig,
      callback
    });
  }

  selectExistingHearing = (row, hearingId) => {
    const hearingWithOnlyId = { [ID_FIELD_NAMES.HEARING_ID]: hearingId };
    this.selectHearing(hearingWithOnlyId);
  }

  renderNewHearingModal = () => {
    const {
      jurisdiction,
      availableHearings,
      personId,
      psaId,
      psaEntityKeyId
    } = this.props;
    const { newHearingModalOpen, manuallyCreatingHearing } = this.state;

    return (
      <Modal
          show={newHearingModalOpen}
          onHide={this.onClose}
          dialogClassName={OverrideClassNames.PSA_REVIEW_MODAL}>
        <Modal.Body>
          <NoBorderStyledColumnRow>
            <TitleWrapper>
              <h1>Add New Hearing</h1>
              <div>
                { manuallyCreatingHearing ? null : this.renderCreateHearingButton() }
                <CloseModalX onClick={this.onClose} />
              </div>
            </TitleWrapper>
            {
              manuallyCreatingHearing
                ? (
                  <NewHearingSection
                      personId={personId}
                      psaEntityKeyId={psaEntityKeyId}
                      psaId={psaId}
                      manuallyCreatingHearing
                      jurisdiction={jurisdiction}
                      afterSubmit={this.onClose} />
                )
                : (
                  <HearingCardsWithTitle
                      title="Available Hearings"
                      subtitle="Select a hearing ato add it to the defendant's schedule"
                      hearings={availableHearings}
                      handleSelect={this.selectExistingHearing} />
                )
            }
          </NoBorderStyledColumnRow>
        </Modal.Body>
      </Modal>
    );
  }


  renderScheduledAndPastHearings = () => {
    const {
      hearingsWithOutcomes,
      scheduledHearings,
      pastHearings
    } = this.props;

    return (
      <StyledColumnRowWrapper>
        <PaddedStyledColumnRow>
          <TitleWrapper>
            <h1>Hearings</h1>
            { this.renderAddHearingButton() }
          </TitleWrapper>
          <HearingCardsWithTitle
              title="Scheduled Hearings"
              hearings={scheduledHearings}
              handleSelect={this.selectingReleaseConditions}
              hearingsWithOutcomes={hearingsWithOutcomes} />
          <hr />
          <HearingCardsWithTitle
              title="Past Hearings"
              hearings={pastHearings}
              handleSelect={this.selectingReleaseConditions}
              hearingsWithOutcomes={hearingsWithOutcomes} />
        </PaddedStyledColumnRow>
      </StyledColumnRowWrapper>
    );
  }

  render() {
    const { loading } = this.props;

    if (loading) {
      return <LoadingSpinner />;
    }
    return (
      <Wrapper>
        <StyledColumn>
          { this.renderScheduledAndPastHearings() }
          { this.renderNewHearingModal() }
        </StyledColumn>
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const review = state.get(STATE.REVIEW);
  const court = state.get(STATE.COURT);
  return {
    [REVIEW.SCORES]: review.get(REVIEW.SCORES),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [COURT.LOADING_HEARING_NEIGHBORS]: court.get(COURT.LOADING_HEARING_NEIGHBORS),
    [COURT.HEARINGS_NEIGHBORS_BY_ID]: court.get(COURT.HEARINGS_NEIGHBORS_BY_ID),
    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),
    [COURT.HEARING_IDS_REFRESHING]: court.get(COURT.HEARING_IDS_REFRESHING),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.ERROR]: review.get(REVIEW.ERROR)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
  });

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  Object.keys(CourtActionFactory).forEach((action :string) => {
    actions[action] = CourtActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonHearings);
