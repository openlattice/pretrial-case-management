/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Constants } from 'lattice';

import AboutPerson from '../../components/people/AboutPerson';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  STATE,
  PEOPLE,
  REVIEW,
  PSA_NEIGHBOR,
  PSA_ASSOCIATION
} from '../../utils/consts/FrontEndStateConsts';

import * as PeopleActionFactory from './PeopleActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

type Props = {
  selectedPersonData :Immutable.Map<*, *>,
  isFetchingPersonData :boolean,
  neighbors :Immutable.Map<*, *>,
  psaNeighborsById :Immutable.Map<*, *>,
  mostRecentPSA :Immutable.Map<*, *>,
  mostRecentPSAEntityKeyId :string,
  actions :{
    getPersonData :(personId :string) => void,
    getPersonNeighbors :(value :{
      personId :string
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Immutable.Map<*, *>
    }) => void,
    downloadPSAReviewPDF :(values :{
      neighbors :Immutable.Map<*, *>,
      scores :Immutable.Map<*, *>
    }) => void,
    loadPSAData :(psaIds :string[]) => void
  },
  match :{
    params :{
      personId :string
    }
  }
};

class PersonDetailsContainer extends React.Component<Props, State> {

  componentDidMount() {
    const { match, actions } = this.props;
    const { personId } = match.params;
    actions.getPersonData(personId);
    actions.getPersonNeighbors({ personId });
  }

  componentWillReceiveProps(nextProps) {
    const { neighbors, actions } = this.props;
    const psaIds = nextProps.neighbors.get(ENTITY_SETS.PSA_SCORES, Immutable.List())
      .map(neighbor => neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]))
      .filter(id => !!id)
      .toJS();
    if (psaIds.length && !neighbors.size && nextProps.neighbors.size) {
      actions.loadPSAData(psaIds);
    }
  }

  render() {
    const {
      isFetchingPersonData,
      loadingPSAData,
      loadingPSAResults,
      mostRecentPSA,
      mostRecentPSAEntityKeyId,
      neighbors,
      psaNeighborsById,
      selectedPersonData
    } = this.props;
    const arrestDate = psaNeighborsById
      .getIn(
        [
          mostRecentPSAEntityKeyId,
          ENTITY_SETS.MANUAL_PRETRIAL_CASES,
          PSA_NEIGHBOR.DETAILS,
          PROPERTY_TYPES.ARREST_DATE_TIME,
          0
        ],
        ''
      );
    const lastEditDateForPSA = psaNeighborsById.getIn(
      [mostRecentPSAEntityKeyId, ENTITY_SETS.STAFF, 0, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.DATE_TIME, 0],
      ''
    );

    const scoreSeq = neighbors.get(ENTITY_SETS.PSA_SCORES, Immutable.Map())
      .filter(neighbor => !!neighbor.get(PSA_NEIGHBOR.DETAILS))
      .map(neighbor => [neighbor
        .getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]), neighbor.get(PSA_NEIGHBOR.DETAILS)]);

    const isLoading = (loadingPSAData || loadingPSAResults || isFetchingPersonData);
    return (
      <div>
        {
          isFetchingPersonData
            ? <LoadingSpinner />
            : (
              <AboutPerson
                  loading={isLoading}
                  loadingPSAResults={loadingPSAResults}
                  lastEditDateForPSA={lastEditDateForPSA}
                  arrestDate={arrestDate}
                  mostRecentPSA={mostRecentPSA}
                  mostRecentPSAEntityKeyId={mostRecentPSAEntityKeyId}
                  selectedPersonData={selectedPersonData}
                  isFetchingPersonData={isFetchingPersonData}
                  scoreSeq={scoreSeq}
                  neighbors={neighbors} />
            )
        }
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { personId } = ownProps.match.params;
  const psaNeighborsById = state.getIn([STATE.REVIEW, REVIEW.NEIGHBORS_BY_ID], true);
  const loadingPSAData = state.getIn([STATE.REVIEW, REVIEW.LOADING_DATA], true);
  const loadingPSAResults = state.getIn([STATE.REVIEW, REVIEW.LOADING_RESULTS], true);
  const isFetchingPersonData = state.getIn([STATE.PEOPLE, PEOPLE.FETCHING_PERSON_DATA], true);
  const selectedPersonData = state.getIn([STATE.PEOPLE, PEOPLE.PERSON_DATA], Immutable.List());
  const neighbors = state.getIn([STATE.PEOPLE, PEOPLE.NEIGHBORS, personId], Immutable.Map());
  const mostRecentPSA = state.getIn([STATE.PEOPLE, PEOPLE.MOST_RECENT_PSA], Immutable.Map());
  const mostRecentPSAEntityKeyId = state.getIn([STATE.PEOPLE, PEOPLE.MOST_RECENT_PSA_ENTITY_KEY], '');

  return {
    loadingPSAData,
    loadingPSAResults,
    psaNeighborsById,
    selectedPersonData,
    isFetchingPersonData,
    neighbors,
    mostRecentPSA,
    mostRecentPSAEntityKeyId
  };
}

function mapDispatchToProps(dispatch) {
  const actions :{ [string] :Function } = {};

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

export default connect(mapStateToProps, mapDispatchToProps)(PersonDetailsContainer);
