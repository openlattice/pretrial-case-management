/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { List, Map, fromJS } from 'immutable';
import { Constants } from 'lattice';

import closeX from '../../assets/svg/close-x-gray.svg';
import HearingCardsWithTitle from '../hearings/HearingCardsWithTitle';
import InfoButton from '../buttons/InfoButton';
import NewHearingSection from '../hearings/NewHearingSection';
import HearingsTable from '../hearings/HearingsTable';
import ReleaseConditionsModal from '../../containers/hearings/ReleaseConditionsModal';
import LogoLoader from '../../assets/LogoLoader';
import psaHearingConfig from '../../config/formconfig/PSAHearingConfig';
import { getEntitySetId } from '../../utils/AppUtils';
import { FORM_IDS, ID_FIELD_NAMES } from '../../utils/consts/Consts';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  APP,
  COURT,
  EDM,
  PSA_NEIGHBOR,
  REVIEW,
  STATE
} from '../../utils/consts/FrontEndStateConsts';
import {
  Count,
  StyledColumn,
  StyledColumnRow,
  StyledColumnRowWrapper,
  Title,
  Wrapper
} from '../../utils/Layout';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as ReviewActionFactory from '../../containers/review/ReviewActionFactory';
import * as CourtActionFactory from '../../containers/court/CourtActionFactory';
import * as PeopleActionFactory from '../../containers/people/PeopleActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

let { HEARINGS, OUTCOMES, PRETRIAL_CASES } = APP_TYPES_FQNS;

HEARINGS = HEARINGS.toString();
OUTCOMES = OUTCOMES.toString();
PRETRIAL_CASES = PRETRIAL_CASES.toString();

const ColumnWrapper = styled(StyledColumnRowWrapper)`
  background: transparent;
`;

const PaddedStyledColumnRow = styled(StyledColumnRow)`
  display: block;
  padding: 30px;
  margin-bottom: 15px;
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
  justify-content: flex-start;
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
  margin: 0;
`;

type Props = {
  app :Map<*, *>,
  availableHearings :List<*, *>,
  defaultBond :Map<*, *>,
  defaultConditions :Map<*, *>,
  defaultDMF :Map<*, *>,
  dmfId :string,
  fqnToIdMap :Map<*, *>,
  hearingNeighborsById :Map<*, *>,
  hearingsWithOutcomes :List<*, *>,
  jurisdiction :?string,
  loading :boolean,
  neighbors :Map<*, *>,
  pastHearings :List<*, *>,
  personId :?string,
  psaEntityKeyId :Map<*, *>,
  psaId :?string,
  selectedOrganizationId :string,
  scheduledHearings :List<*, *>,
  actions :{
    deleteEntity :(values :{
      entitySetId :string,
      entityKeyId :string
    }) => void,
    loadHearingNeighbors :(hearingIds :string[]) => void,
    submit :(values :{
      app :Map<*, *>,
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
    refreshPSANeighbors :({ id :string }) => void,
    refreshPersonNeighbors :(values :{ personId :string }) => void,
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

const MODAL_WIDTH = '975px';
const MODAL_HEIGHT = 'max-content';

class PersonHearings extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      manuallyCreatingHearing: false,
      newHearingModalOpen: false,
      releaseConditionsModalOpen: false,
      selectedHearing: Map()
    };
  }

  refreshPersonNeighborsCallback = () => {
    const { actions, personId } = this.props;
    actions.refreshPersonNeighbors({ personId });
  }

  cancelHearing = (entityKeyId) => {
    const {
      actions,
      app,
      fqnToIdMap,
      selectedOrganizationId
    } = this.props;
    const entitySetId = getEntitySetId(app, HEARINGS, selectedOrganizationId);
    const values = {
      [entityKeyId]: {
        [fqnToIdMap.get(PROPERTY_TYPES.HEARING_INACTIVE)]: [true]
      }
    };
    actions.updateEntity({
      entitySetId,
      entities: values,
      updateType: 'PartialReplace',
      callback: this.refreshPersonNeighborsCallback
    });
  }

  openNewHearingModal = () => this.setState({ newHearingModalOpen: true })

  onClose = () => this.setState({
    newHearingModalOpen: false,
    releaseConditionsModalOpen: false,
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
      app,
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
      app,
      values,
      config: psaHearingConfig,
      callback
    });
  }

  selectExistingHearing = (row, hearingId) => {
    const hearingWithOnlyId = { [ID_FIELD_NAMES.HEARING_ID]: hearingId };
    this.selectHearing(hearingWithOnlyId);
  }

  selectingReleaseConditions = (row, hearingId, entityKeyId) => {
    this.setState({
      manuallyCreatingHearing: false,
      releaseConditionsModalOpen: true,
      selectedHearing: fromJS({ row, hearingId, entityKeyId })
    });
  };

  renderReleaseConditionsModal = () => {
    const {
      chargeHistory,
      defaultBond,
      defaultConditions,
      defaultDMF,
      dmfId,
      hearingNeighborsById,
      jurisdiction,
      loading,
      neighbors,
      psaEntityKeyId,
      psaId,
      personId,
    } = this.props;
    const { releaseConditionsModalOpen, selectedHearing } = this.state;
    const selectedHearingEntityKeyId = selectedHearing.get('entityKeyId', '');
    const selectedHearingId = selectedHearing.get('hearingId', '');
    const hearing = selectedHearing.get('row', Map());
    let caseHistory = hearingNeighborsById
      .getIn([selectedHearingEntityKeyId, PRETRIAL_CASES, PSA_NEIGHBOR.DETAILS], Map());
    caseHistory = caseHistory.size ? fromJS([caseHistory]) : List();

    return (
      <ReleaseConditionsModal
          chargeHistory={chargeHistory}
          caseHistory={caseHistory}
          open={releaseConditionsModalOpen}
          defaultBond={defaultBond}
          defaultConditions={defaultConditions}
          defaultDMF={defaultDMF}
          dmfId={dmfId}
          hearingId={selectedHearingId}
          hearingEntityKeyId={selectedHearingEntityKeyId}
          hearingNeighborsById={hearingNeighborsById}
          jurisdiction={jurisdiction}
          neighbors={neighbors}
          loading={loading}
          onClose={this.onClose}
          personId={personId}
          psaEntityKeyId={psaEntityKeyId}
          psaId={psaId}
          selectedHearing={hearing} />
    );
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
      <ModalTransition>
        {
          newHearingModalOpen
          && (
            <Modal
                scrollBehavior="outside"
                onClose={() => this.onClose()}
                width={MODAL_WIDTH}
                height={MODAL_HEIGHT}
                max-height={MODAL_HEIGHT}
                shouldCloseOnOverlayClick
                stackIndex={2}>
              <NoBorderStyledColumnRow>
                <TitleWrapper>
                  <h1>Add New Hearing</h1>
                  <div>
                    {/* { manuallyCreatingHearing ? null : this.renderCreateHearingButton() } */}
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
                          subtitle="Select a hearing to add it to the defendant's schedule"
                          hearings={availableHearings}
                          handleSelect={this.selectExistingHearing} />
                    )
                }
              </NoBorderStyledColumnRow>
            </Modal>
          )
        }
      </ModalTransition>
    );
  }


  renderScheduledAndPastHearings = () => {
    const {
      hearings,
      hearingsWithOutcomes,
      hearingNeighborsById,
      scheduledHearings,
      pastHearings
    } = this.props;
    const scheduledHearingsWithOutcomes = scheduledHearings.filter((hearing) => {
      const id = hearing.getIn([OPENLATTICE_ID_FQN, 0], '');
      const hasOutcome = !!hearingNeighborsById.getIn([id, OUTCOMES]);
      return hasOutcome;
    });
    const pastHearingsWithOutcomes = pastHearings.filter((hearing) => {
      const id = hearing.getIn([OPENLATTICE_ID_FQN, 0], '');
      const hasOutcome = !!hearingNeighborsById.getIn([id, OUTCOMES]);
      return hasOutcome;
    });
    return (
      <ColumnWrapper>
        <PaddedStyledColumnRow>
          <HearingCardsWithTitle
              title="Hearings With Outcomes"
              hearings={pastHearingsWithOutcomes}
              handleSelect={this.selectingReleaseConditions}
              hearingsWithOutcomes={hearingsWithOutcomes} />
        </PaddedStyledColumnRow>
        <PaddedStyledColumnRow>
          <TitleWrapper>
            <Title withSubtitle><span>All Hearings</span></Title>
            <Count>{hearings.size}</Count>
          </TitleWrapper>
          <HearingsTable
              maxHeight={400}
              rows={hearings}
              hearingsWithOutcomes={hearingsWithOutcomes}
              hearingNeighborsById={hearingNeighborsById}
              cancelFn={this.cancelHearing} />
        </PaddedStyledColumnRow>
      </ColumnWrapper>
    );
  }

  render() {
    const { loading } = this.props;

    if (loading) {
      return <LogoLoader loadingText="Loading..." />;
    }
    return (
      <Wrapper>
        <StyledColumn>
          { this.renderScheduledAndPastHearings() }
          { this.renderNewHearingModal() }
          { this.renderReleaseConditionsModal() }
        </StyledColumn>
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const review = state.get(STATE.REVIEW);
  const court = state.get(STATE.COURT);
  return {
    app,
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),

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

  Object.keys(PeopleActionFactory).forEach((action :string) => {
    actions[action] = PeopleActionFactory[action];
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
