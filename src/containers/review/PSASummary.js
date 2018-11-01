/*
 * @flow
 */
import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Constants } from 'lattice';

import ArrestCard from '../../components/arrest/ArrestCard';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import ContentBlock from '../../components/ContentBlock';
import PersonCardSummary from '../../components/person/PersonCardSummary';
import PSAModal from './PSAModal';
import ClosePSAModal from '../../components/review/ClosePSAModal';
import PSAReportDownloadButton from '../../components/review/PSAReportDownloadButton';
import PSAStats from '../../components/review/PSAStats';
import SummaryDMFDetails from '../../components/dmf/SummaryDMFDetails';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatDateTimeList } from '../../utils/FormattingUtils';
import { getEntityKeyId, getTimeStamp, getNeighborDetailsForEntitySet } from '../../utils/DataUtils';
import { OL } from '../../utils/consts/Colors';
import { Title } from '../../utils/Layout';
import {
  STATE,
  REVIEW,
  SUBMIT,
  PEOPLE,
  COURT,
  PSA_NEIGHBOR,
  PSA_ASSOCIATION
} from '../../utils/consts/FrontEndStateConsts';

import * as Routes from '../../core/router/Routes';
import * as PeopleActionFactory from '../people/PeopleActionFactory';
import * as CourtActionFactory from '../court/CourtActionFactory';
import * as ReviewActionFactory from './ReviewActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;


const SummaryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  hr {
    width: 100%;
    height: 1px;
    margin: 0;
  }
`;

const NoStyleWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const RowWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 66% 33%;
  margin: 30px 0;
`;

const ScoresContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: ${props => (props.border ? `solid 1px ${OL.GREY28}` : 'none')};
`;

const ScoreContent = styled.div`
  padding: 20px 30px 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const PSADetails = styled.div`
  margin-top: 20px;
  width: 100%;
  display: grid;
  grid-template-columns: 25% 25% 46%;
  grid-column-gap: 2%;
`;

const DownloadButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const ScoreTitle = styled.div`
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  padding: 0 30px;
  font-size: 16px;
  font-weight: 600;
  color: ${OL.GREY01};
`;

const NotesTitle = styled(Title)`
  margin-top: 0;
`

const NotesWrapper = styled.div`
  width: 100%;
  padding: ${props => (props.profile ? '0 30px 0' : '0 30px 30px')};
  border-right: ${props => (props.profile ? `solid 1px ${OL.GREY28}` : 'none')};
`;

type Props = {
  notes :string,
  scores :Immutable.Map<*, *>,
  neighbors :Immutable.Map<*, *>,
  profile :boolean,
  actions :{
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Immutable.Map<*, *>
    }) => void,
    loadHearingNeighbors :(hearingIds :string[]) => void,
    loadJudges :() => void,
    checkPSAPermissions :() => void,
    refreshPSANeighbors :({ id :string }) => void,
    submit :(value :{ config :Object, values :Object}) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
    deleteEntity :(value :{ entitySetName :string, entityKeyId :string }) => void,
    clearSubmit :() => void,
  },
};

class PSASummary extends React.Component<Props, *> {

  renderArrestInfo = () => {
    const { neighbors, profile } = this.props;
    const component = profile ? `${CONTENT_CONSTS.PROFILE}|${CONTENT_CONSTS.ARREST}` : CONTENT_CONSTS.ARREST;
    const pretrialCase = getNeighborDetailsForEntitySet(neighbors, ENTITY_SETS.MANUAL_PRETRIAL_CASES);
    return (
      <ArrestCard profile arrest={pretrialCase} component={component} />
    );
  };

  renderNotes = () => {
    const { notes, profile } = this.props;
    return (
      <NotesWrapper profile={profile}>
        <NotesTitle withSubtitle><span>Notes</span></NotesTitle>
        {notes || 'No Notes'}
      </NotesWrapper>
    );
  }

  renderPersonInfo = () => {
    const { neighbors } = this.props;
    const person = getNeighborDetailsForEntitySet(neighbors, ENTITY_SETS.PEOPLE);
    return (
      <PersonCardSummary person={person} />
    );
  }

  renderProfileHeader = () => {

  }

  openDetailsModal = () => {
    const { neighbors, actions } = this.props;
    const { loadCaseHistory, loadHearingNeighbors } = actions;
    const hearingIds = neighbors.get(ENTITY_SETS.HEARINGS, Immutable.List())
      .map(neighbor => neighbor.getIn([OPENLATTICE_ID_FQN, 0]))
      .filter(id => !!id)
      .toJS();
    const personId = getEntityKeyId(neighbors, ENTITY_SETS.PEOPLE);
    loadCaseHistory({ personId, neighbors });
    loadHearingNeighbors({ hearingIds, loadPersonData: false });
    this.setState({
      open: true
    });
  }

  renderPSADetails = () => {
    const { neighbors, actions, scores } = this.props;
    const { downloadPSAReviewPDF } = actions;
    let filer;
    const psaDate = formatDateTimeList(getTimeStamp(neighbors, ENTITY_SETS.PSA_RISK_FACTORS));
    neighbors.get(ENTITY_SETS.STAFF, Immutable.List()).forEach((neighbor) => {
      const associationEntitySetName = neighbor.getIn([PSA_ASSOCIATION.ENTITY_SET, 'name']);
      const personId = neighbor.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0], '');
      if (associationEntitySetName === ENTITY_SETS.ASSESSED_BY) {
        filer = personId;
      }
    });
    return (
      <PSADetails>
        <ContentBlock
            contentBlock={{ label: 'psa date', content: [psaDate] }}
            component={CONTENT_CONSTS.SUMMARY} />
        <ContentBlock
            contentBlock={{ label: 'filer', content: [filer] }}
            component={CONTENT_CONSTS.SUMMARY} />
        <DownloadButtonWrapper>
          <PSAReportDownloadButton
              downloadFn={downloadPSAReviewPDF}
              neighbors={neighbors}
              scores={scores} />
        </DownloadButtonWrapper>
      </PSADetails>
    );
  }

  render() {
    const {
      neighbors,
      notes,
      scores,
      profile
    } = this.props;

    const topRow = profile ? <Title withSubtitle>PSA Summary</Title>
      : (
        <NoStyleWrapper>
          <RowWrapper>
            {this.renderPersonInfo()}
            {this.renderArrestInfo()}
          </RowWrapper>
          <hr />
        </NoStyleWrapper>
      );

    const bottomRow = !profile ? null
      : (
        <RowWrapper>
          {this.renderNotes()}
          {this.renderArrestInfo()}
        </RowWrapper>
      );

    return (
      <SummaryWrapper>
        { topRow }
        <RowWrapper>
          <ScoresContainer border>
            <ScoreTitle>PSA</ScoreTitle>
            <ScoreContent>
              <PSAStats scores={scores} />
              {this.renderPSADetails()}
            </ScoreContent>
          </ScoresContainer>
          <ScoresContainer>
            <ScoreTitle>DMF</ScoreTitle>
            <SummaryDMFDetails neighbors={neighbors} scores={scores} />
          </ScoresContainer>
        </RowWrapper>
        <hr />
        {(!profile && notes) ? this.renderNotes() : null}
        {(!profile && notes) ? <hr /> : null}
        { bottomRow }
      </SummaryWrapper>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { personId } = ownProps.match.params;
  const review = state.get(STATE.REVIEW);
  const people = state.get(STATE.PEOPLE);

  return {
    personId,
    [REVIEW.NEIGHBORS_BY_ID]: review.get(REVIEW.NEIGHBORS_BY_ID),
    [REVIEW.LOADING_DATA]: review.get(REVIEW.LOADING_DATA),
    [REVIEW.LOADING_RESULTS]: review.get(REVIEW.LOADING_RESULTS),
    [PEOPLE.FETCHING_PERSON_DATA]: people.get(PEOPLE.FETCHING_PERSON_DATA),
    [PEOPLE.PERSON_DATA]: people.get(PEOPLE.PERSON_DATA),
    [PEOPLE.NEIGHBORS]: people.getIn([PEOPLE.NEIGHBORS, personId], Map()),
    [PEOPLE.MOST_RECENT_PSA]: people.get(PEOPLE.MOST_RECENT_PSA),
    [PEOPLE.MOST_RECENT_PSA_ENTITY_KEY]: people.get(PEOPLE.MOST_RECENT_PSA_ENTITY_KEY)
  };
}

function mapDispatchToProps(dispatch) {
  const actions :{ [string] :Function } = {};

  Object.keys(CourtActionFactory).forEach((action :string) => {
    actions[action] = CourtActionFactory[action];
  });

  Object.keys(PeopleActionFactory).forEach((action :string) => {
    actions[action] = PeopleActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  return {
    actions: bindActionCreators(actions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PSASummary);
