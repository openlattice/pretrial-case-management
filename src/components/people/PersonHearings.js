/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Constants } from 'lattice';
import type { RequestState } from 'redux-reqseq';
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
import {
  COURT,
  PEOPLE,
  PSA_NEIGHBOR,
  REVIEW
} from '../../utils/consts/FrontEndStateConsts';
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
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';

import { updateHearing } from '../../containers/hearings/HearingsActions';

const { OPENLATTICE_ID_FQN } = Constants;

const { OUTCOMES, PRETRIAL_CASES } = APP_TYPES;

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
  chargeHistory :Map<*, *>,
  defaultBond :Map<*, *>,
  defaultConditions :Map<*, *>,
  defaultDMF :Map<*, *>,
  dmfId :string,
  hearingNeighborsById :Map<*, *>,
  jurisdiction :?string,
  loading :boolean,
  neighbors :Map<*, *>,
  hearings :List<*, *>,
  personEKID :?string,
  personId :?string,
  psaEntityKeyId :Map<*, *>,
  psaId :?string,
  psaIdsRefreshing :List<*, *>,
  refreshHearingAndNeighborsReqState :RequestState,
  refreshingPersonNeighbors :boolean,
  actions :{
    deleteEntity :(values :{
      entitySetId :string,
      entityKeyId :string
    }) => void,
    refreshPSANeighbors :({ id :string }) => void,
    refreshPersonNeighbors :(values :{ personId :string }) => void,
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
    const {
      chargeHistory,
      defaultBond,
      defaultConditions,
      defaultDMF,
      dmfId,
      hearingNeighborsById,
      refreshHearingAndNeighborsReqState,
      jurisdiction,
      neighbors,
      psaEntityKeyId,
      psaIdsRefreshing,
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
    const refreshingNeighbors = psaIdsRefreshing.has(psaEntityKeyId);
    const refreshingHearingAndNeighbors = requestIsPending(refreshHearingAndNeighborsReqState);
    const refreshing = (refreshingHearingAndNeighbors || refreshingNeighbors);

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
          refreshing={refreshing}
          onClose={this.onClose}
          personId={personId}
          psaEntityKeyId={psaEntityKeyId}
          psaId={psaId}
          selectedHearing={hearing} />
    );
  }


  renderScheduledAndPastHearings = () => {
    const {
      hearings,
      hearingNeighborsById,
      refreshingPersonNeighbors
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
              refreshingPersonNeighbors={refreshingPersonNeighbors}
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
  const court = state.get(STATE.COURT);
  const hearings = state.get(STATE.HEARINGS);
  const review = state.get(STATE.REVIEW);
  const people = state.get(STATE.PEOPLE);
  return {
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),

    // Hearings
    refreshHearingAndNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS),
    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),

    [PEOPLE.REFRESHING_PERSON_NEIGHBORS]: people.get(PEOPLE.REFRESHING_PERSON_NEIGHBORS),

    [REVIEW.SCORES]: review.get(REVIEW.SCORES),
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.PSA_IDS_REFRESHING]: review.get(REVIEW.PSA_IDS_REFRESHING),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [REVIEW.ERROR]: review.get(REVIEW.ERROR)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  actions.updateHearing = updateHearing;

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonHearings);
