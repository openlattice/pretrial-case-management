/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PersonSubcriptionRow from './PersonSubscriptionRow';
import LoadingSpinner from '../LoadingSpinner';
import { NoResults } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { sortPeopleByName } from '../../utils/PSAUtils';

import * as SubscriptionsActionFactory from '../../containers/subscription/SubscriptionsActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

const Table = styled.div`
  width: 100%;
  border: 1px solid ${OL.GREY08};
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`;

class PersonSubscriptionList extends React.Component<Props, State> {

  renderBodyElements = () => {
    const { actions, people } = this.props;
    return people.valueSeq().sort(sortPeopleByName).map((person => (
      <PersonSubcriptionRow
          key={person.getIn([OPENLATTICE_ID_FQN, 0], '')}
          person={person}
          loadNeighbors={actions.loadSubcriptionModal}
          onClose={actions.clearSubscriptionModal} />
    )));
  };

  render() {
    const { noResults, noResultsText, loading } = this.props;

    const noResultsDisplay = (noResults && !loading)
      ? <NoResults>{ noResultsText }</NoResults>
      : null;
    return (
      <>
        <Table>
          { loading ? null : this.renderBodyElements() }
        </Table>
        { loading
          ? <NoResults><LoadingSpinner /></NoResults>
          : noResultsDisplay
        }
      </>
    );
  }
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(SubscriptionsActionFactory).forEach((action :string) => {
    actions[action] = SubscriptionsActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(null, mapDispatchToProps)(PersonSubscriptionList);
