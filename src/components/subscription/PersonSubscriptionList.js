/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Constants } from 'lattice';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PersonSubcriptionRow from './PersonSubscriptionRow';
import LogoLoader from '../../assets/LogoLoader';
import { NoResults } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { SEARCH, STATE } from '../../utils/consts/FrontEndStateConsts';
import { sortPeopleByName } from '../../utils/PeopleUtils';

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
    const {
      actions,
      contactResults,
      peopleIdsToContactIds,
      includeContact,
      people
    } = this.props;
    return people.valueSeq().sort(sortPeopleByName).map((person) => {
      const personId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
      let contact;
      if (includeContact) {
        const contactId = peopleIdsToContactIds.getIn([personId, 0], '');
        contact = contactResults.get(contactId, Map());
      }
      return (
        <PersonSubcriptionRow
            key={personId}
            contact={contact}
            person={person}
            loadNeighbors={actions.loadSubcriptionModal}
            onClose={actions.clearSubscriptionModal} />
      );
    });
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
          ? <LogoLoader size={30} loadingText="Loading People..." />
          : noResultsDisplay
        }
      </>
    );
  }
}


function mapStateToProps(state) {
  const search = state.get(STATE.SEARCH);

  return {
    [SEARCH.CONTACTS]: search.get(SEARCH.CONTACTS),
    [SEARCH.RESULTS_TO_CONTACTS]: search.get(SEARCH.RESULTS_TO_CONTACTS)
  };
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

export default connect(mapStateToProps, mapDispatchToProps)(PersonSubscriptionList);
