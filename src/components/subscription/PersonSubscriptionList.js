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

import * as SubscriptionActions from '../../containers/subscription/SubscriptionActions';
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
    const { personEntityKeyId } = formatPeopleInfo(person);
    loadSubcriptionModal({ personEntityKeyId });
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
    const { personEntityKeyId } = formatPeopleInfo(person);
    loadManualRemindersForm({ personEntityKeyId });
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
      people,
      includeManualRemindersButton
    } = this.props;
    return people.valueSeq().sort(sortPeopleByName).map((person) => {
      const { personEntityKeyId } = formatPeopleInfo(person);
      let contact;
      if (includeContact) {
        const contactId = peopleIdsToContactIds.getIn([personEntityKeyId, 0], '');
        contact = contactResults.get(contactId, Map());
      }
      return (
        <PersonSubcriptionRow
            key={personEntityKeyId}
            contact={contact}
            includeManualRemindersButton={includeManualRemindersButton}
            person={person}
            openManageSubscriptionModal={this.openManageSubscriptionModal}
            openCreateManualReminderModal={this.openCreateManualReminderModal}
            onClose={this.onClose} />
      );
    });
  };

  render() {
    const {
      noResults,
      noResultsText,
      loading
    } = this.props;

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

  Object.keys(SubscriptionActions).forEach((action :string) => {
    actions[action] = SubscriptionActions[action];
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
