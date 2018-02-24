/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { getPersonData } from './PeopleActionFactory';
import PersonDetails from '../../components/people/PersonDetails';
import { PERSON_FQNS } from '../../utils/consts/Consts';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDOB } from '../../utils/Helpers';

type Props = {
  selectedPersonData :Immutable.Map<*, *>,
  isFetchingPersonData :boolean,
  actions :{
    getPersonData :(personId :string) => void
  },
  match :{
    params :{
      personId :string
    }
  }
};

class PersonDetailsContainer extends React.Component<Props> {

  componentDidMount() {
    this.props.actions.getPersonData(this.props.match.params.personId);
  }

  render() {
    return (
      <div>
        {
          this.props.isFetchingPersonData
            ? <LoadingSpinner />
            : <PersonDetails
                selectedPersonData={this.props.selectedPersonData}
                isFetchingPersonData={this.props.isFetchingPersonData} />
        }
      </div>
    );
  }
}


function mapStateToProps(state) {
  const isFetchingPersonData = state.getIn(['people', 'isFetchingPersonData'], true);

  // Format person data
  let selectedPersonData = state.getIn(['people', 'selectedPersonData'], Immutable.Map());
  selectedPersonData = selectedPersonData.map(value => value.get(0));
  const dob = formatDOB(selectedPersonData.get(PERSON_FQNS.DOB));
  selectedPersonData = selectedPersonData.set(
    PERSON_FQNS.DOB,
    dob
  );

  return {
    selectedPersonData,
    isFetchingPersonData
  };
}

function mapDispatchToProps(dispatch) {

  return {
    actions: bindActionCreators({ getPersonData }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonDetailsContainer);
