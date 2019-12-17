/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Constants } from 'lattice';
import {
  List,
  Map,
  fromJS,
  Set
} from 'immutable';

import HearingCardsWithTitle from '../hearings/HearingCardsWithTitle';
import HearingsTable from '../hearings/HearingsTable';
import ReleaseConditionsModal from '../releaseconditions/ReleaseConditionsModal';
import LogoLoader from '../LogoLoader';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { REVIEW } from '../../utils/consts/FrontEndStateConsts';
import {
  Count,
  StyledColumn,
  StyledColumnRow,
  StyledColumnRowWrapper,
  Title,
  Wrapper
} from '../../utils/Layout';


import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState } from '../../utils/consts/redux/ReduxUtils';

import { updateHearing } from '../../containers/hearings/HearingsActions';

const { OPENLATTICE_ID_FQN } = Constants;

const { OUTCOMES } = APP_TYPES;

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


const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

type Props = {
  actions :{
    updateHearing :RequestSequence;
  };
  hearingNeighborsById :Map,
  hearings :List,
  loading :boolean,
  personEKID :?string,
  updateHearingReqState :RequestState,
}

type State = {
  jurisdiction :?string,
  personEKID :?string,
  selectedHearing :Object,
  selectingReleaseConditions :boolean
};

class PersonHearings extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      releaseConditionsModalOpen: false,
      selectedHearing: Map()
    };
  }

  cancelHearing = (oldHearing) => {
    const { actions, personEKID } = this.props;
    const newHearing = { [PROPERTY_TYPES.HEARING_INACTIVE]: [true] };
    actions.updateHearing({
      newHearing,
      oldHearing,
      personEKID
    });
  }

  onClose = () => this.setState({
    releaseConditionsModalOpen: false
  })

  selectingReleaseConditions = (row, hearingId, entityKeyId) => {
    this.setState({
      releaseConditionsModalOpen: true,
      selectedHearing: fromJS({ row, hearingId, entityKeyId })
    });
  };

  renderReleaseConditionsModal = () => {
    const { hearingNeighborsById } = this.props;
    const { releaseConditionsModalOpen, selectedHearing } = this.state;
    const selectedHearingEntityKeyId = selectedHearing.get('entityKeyId', '');

    return (
      <ReleaseConditionsModal
          open={releaseConditionsModalOpen}
          hearingEntityKeyId={selectedHearingEntityKeyId}
          hearingNeighborsById={hearingNeighborsById}
          onClose={this.onClose} />
    );
  }


  renderScheduledAndPastHearings = () => {
    const {
      hearings,
      hearingNeighborsById,
      updateHearingReqState
    } = this.props;
    let hearingsWithOutcomesIds = Set();
    const hearingsWithOutcomes = hearings.filter((hearing) => {
      const id = hearing.getIn([OPENLATTICE_ID_FQN, 0], '');
      const hasOutcome = !!hearingNeighborsById.getIn([id, OUTCOMES]);
      if (hasOutcome) hearingsWithOutcomesIds = hearingsWithOutcomesIds.add(id);
      return hasOutcome;
    });
    return (
      <ColumnWrapper>
        <PaddedStyledColumnRow>
          <HearingCardsWithTitle
              title="Hearings With Outcomes"
              hearings={hearingsWithOutcomes}
              handleSelect={this.selectingReleaseConditions}
              hearingsWithOutcomes={hearingsWithOutcomesIds} />
        </PaddedStyledColumnRow>
        <PaddedStyledColumnRow>
          <TitleWrapper>
            <Title withSubtitle><span>All Hearings</span></Title>
            <Count>{hearings.size}</Count>
          </TitleWrapper>
          <HearingsTable
              maxHeight={400}
              rows={hearings}
              updateHearingReqState={updateHearingReqState}
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
          { this.renderReleaseConditionsModal() }
        </StyledColumn>
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const hearings = state.get(STATE.HEARINGS);
  const review = state.get(STATE.REVIEW);
  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Hearings
    refreshHearingAndNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS),
    updateHearingReqState: getReqState(hearings, HEARINGS_ACTIONS.UPDATE_HEARING),
    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),

    [REVIEW.SCORES]: review.get(REVIEW.SCORES),
    [REVIEW.PSA_NEIGHBORS_BY_ID]: review.get(REVIEW.PSA_NEIGHBORS_BY_ID),
    [REVIEW.PSA_IDS_REFRESHING]: review.get(REVIEW.PSA_IDS_REFRESHING),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.ERROR]: review.get(REVIEW.ERROR)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    updateHearing
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(PersonHearings);
