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
import { ENTITY_SETS } from '../../utils/consts/DataModelConsts';
import { STATE, PEOPLE, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import * as PeopleActionFactory from './PeopleActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

type Props = {
  selectedPersonData :Immutable.Map<*, *>,
  isFetchingPersonData :boolean,
  neighbors :Immutable.Map<*, *>,
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
    const psaIds = nextProps.neighbors.get(ENTITY_SETS.PSA_SCORES, Immutable.List())
      .map(neighbor => neighbor.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]))
      .filter(id => !!id)
      .toJS();
    if (!this.props.neighbors.size && nextProps.neighbors.size) {
      this.props.actions.loadPSAData(psaIds);
    }
  }

  render() {
    const {
      neighbors,
      isFetchingPersonData,
      selectedPersonData
    } = this.props;
    const scoreSeq = neighbors.get(ENTITY_SETS.PSA_SCORES, Immutable.Map())
      .filter(neighbor => !!neighbor.get(PSA_NEIGHBOR.DETAILS))
      .map(neighbor => [neighbor
        .getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0]), neighbor.get(PSA_NEIGHBOR.DETAILS)]);
    return (
      <div>
        {
          isFetchingPersonData
            ? <LoadingSpinner /> :
            (
              <AboutPerson
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
  const isFetchingPersonData = state.getIn([STATE.PEOPLE, PEOPLE.FETCHING_PERSON_DATA], true);
  const selectedPersonData = state.getIn([STATE.PEOPLE, PEOPLE.PERSON_DATA], Immutable.List());
  const neighbors = state.getIn([STATE.PEOPLE, PEOPLE.NEIGHBORS, personId], Immutable.Map());

  return {
    selectedPersonData,
    isFetchingPersonData,
    neighbors
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
