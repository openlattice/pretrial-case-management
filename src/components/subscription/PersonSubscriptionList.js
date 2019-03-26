/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CreateManualReminderModal from '../manualreminders/CreateManualReminderModal';
import ManageSubscriptionModal from '../../containers/subscription/ManageSubscriptionModal';
import PersonSubcriptionRow from './PersonSubscriptionRow';
import LogoLoader from '../LogoLoader';
import { NoResults } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { SEARCH, STATE } from '../../utils/consts/FrontEndStateConsts';
import { formatPeopleInfo, sortPeopleByName } from '../../utils/PeopleUtils';

import * as SubscriptionsActionFactory from '../../containers/subscription/SubscriptionsActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as ManualRemindersActionFactory from '../../containers/manualreminders/ManualRemindersActionFactory';

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

const ModalContainer = styled.div`
  height: 0;
`;

class PersonSubscriptionList extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      person: Map(),
      manageSubscriptionModalOpen: false,
      creatingManualReminder: false
    };
  }


  onClose = () => {
    const { actions } = this.props;
    const { clearSubmit, clearSubscriptionModal, clearManualRemindersForm } = actions;
    this.setState({
      manageSubscriptionModalOpen: false,
      creatingManualReminder: false
    });
    clearSubscriptionModal();
    clearManualRemindersForm();
    clearSubmit();
  }

  openManageSubscriptionModal = (person) => {
    const { actions } = this.props;
    const { loadSubcriptionModal } = actions;
    const { entityKeyId } = formatPeopleInfo(person);
    loadSubcriptionModal({ personId: entityKeyId });
    this.setState({
      manageSubscriptionModalOpen: true,
      person
    });
  };

  renderManageSubscriptionModal = () => {
    const { manageSubscriptionModalOpen, person } = this.state;
    return (
      <ManageSubscriptionModal
          person={person}
          open={manageSubscriptionModalOpen}
          onClose={this.onClose} />
    );
  }

  openCreateManualReminderModal = (person) => {
    const { actions } = this.props;
    const { loadManualRemindersForm } = actions;
    const { entityKeyId } = formatPeopleInfo(person);
    loadManualRemindersForm({ personId: entityKeyId });
    this.setState({
      creatingManualReminder: true,
      person
    });
  };

  renderCreateManualReminderModal = () => {
    const { submitCallback } = this.props;
    const { creatingManualReminder, person } = this.state;
    return (
      <CreateManualReminderModal
          person={person}
          submitCallback={submitCallback}
          open={creatingManualReminder}
          onClose={this.onClose} />
    );
  }

  renderBodyElements = () => {
    const {
      contactResults,
      peopleIdsToContactIds,
      includeContact,
      people
    } = this.props;
    return people.valueSeq().sort(sortPeopleByName).map((person) => {
      const { indentification } = formatPeopleInfo(person);
      let contact;
      if (includeContact) {
        const contactId = peopleIdsToContactIds.getIn([indentification, 0], '');
        contact = contactResults.get(contactId, Map());
      }
      return (
        <PersonSubcriptionRow
            key={indentification}
            contact={contact}
            person={person}
            openManageSubscriptionModal={this.openManageSubscriptionModal}
            openCreateManualReminderModal={this.openCreateManualReminderModal}
            onClose={this.onClose} />
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
        <ModalContainer>
          { this.renderManageSubscriptionModal() }
          { this.renderCreateManualReminderModal() }
        </ModalContainer>
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

  Object.keys(ManualRemindersActionFactory).forEach((action :string) => {
    actions[action] = ManualRemindersActionFactory[action];
  });

  Object.keys(SubscriptionsActionFactory).forEach((action :string) => {
    actions[action] = SubscriptionsActionFactory[action];
  });

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonSubscriptionList);
