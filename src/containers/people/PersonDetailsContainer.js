import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { getPersonData } from './PeopleActionFactory';
import PersonDetails from '../../components/people/PersonDetails';
import { PERSON_FQNS } from '../../utils/consts/Consts';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDOB } from '../../utils/Helpers';


class PersonDetailsContainer extends React.Component {
  static propTypes = {
    selectedPersonData: ImmutablePropTypes.mapContains({
      [PERSON_FQNS.ID]: PropTypes.string,
      [PERSON_FQNS.DOB]: PropTypes.string,
      [PERSON_FQNS.FIRST_NAME]: PropTypes.string,
      [PERSON_FQNS.LAST_NAME]: PropTypes.string,
      [PERSON_FQNS.SSN]: PropTypes.string,
      [PERSON_FQNS.SUBJECT_ID]: PropTypes.string,
      [PERSON_FQNS.PHOTO]: PropTypes.string,
      [PERSON_FQNS.SEX]: PropTypes.string
    }).isRequired,
    isFetchingPersonData: PropTypes.bool.isRequired,
    actions: PropTypes.shape({
      getPersonData: PropTypes.func.isRequired
    }).isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        personId: PropTypes.node
      }).isRequired
    }).isRequired
  }

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
  selectedPersonData = selectedPersonData.map((value) => {
    return value.get(0);
  });
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
