/*
 * @flow
 */

import React from 'react';
import { Map, List } from 'immutable';
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
  selectedPersonData :Map<*, *>,
  isFetchingPersonData :boolean,
  loadingPSAData :boolean,
  loadingPSAResults :boolean,
  mostRecentPSA :Map<*, *>,
  mostRecentPSAEntityKeyId :string,
  neighbors :Map<*, *>,
  psaNeighborsById :Map<*, *>,
  actions :{
    getPersonData :(personId :string) => void,
    getPersonNeighbors :(value :{
      personId :string
    }) => void,
    loadCaseHistory :(values :{
      personId :string,
      neighbors :Map<*, *>
    }) => void,
    downloadPSAReviewPDF :(values :{
      neighbors :Map<*, *>,
      scores :Map<*, *>
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
    const psaIds = nextProps.neighbors.get(ENTITY_SETS.PSA_SCORES, List())
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

    const scoreSeq = neighbors.get(ENTITY_SETS.PSA_SCORES, Map())
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
  const review = state.get(STATE.REVIEW);
  const people = state.get(STATE.PEOPLE);

  return {
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
