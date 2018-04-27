/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import PersonDetails from '../../components/people/PersonDetails';
import LoadingSpinner from '../../components/LoadingSpinner';
import * as PeopleActionFactory from './PeopleActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';

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
  },
  match :{
    params :{
      personId :string
    }
  }
};

class PersonDetailsContainer extends React.Component<Props> {

  componentDidMount() {
    const { match, actions } = this.props;
    const { personId } = match.params;
    actions.getPersonData(personId);
    actions.getPersonNeighbors({ personId });
  }

  render() {
    return (
      <div>
        {
          this.props.isFetchingPersonData
            ? <LoadingSpinner /> :
            <PersonDetails
                selectedPersonId={this.props.match.params.personId}
                selectedPersonData={this.props.selectedPersonData}
                isFetchingPersonData={this.props.isFetchingPersonData}
                neighbors={this.props.neighbors} />
        }
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { personId } = ownProps.match.params;

  const isFetchingPersonData = state.getIn(['people', 'isFetchingPersonData'], true);

  const selectedPersonData = state.getIn(['people', 'selectedPersonData'], Immutable.List());
  const neighbors = state.getIn(['people', 'peopleNeighbors', personId], Immutable.Map());

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
