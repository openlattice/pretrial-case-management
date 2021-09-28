/*
 * @flow
 */
import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';

import PersonSubcriptionRow from './PersonSubscriptionRow';

import CreateManualReminderModal from '../manualreminders/CreateManualReminderModal';
import LogoLoader from '../LogoLoader';
import ManageSubscriptionModal from '../../containers/subscription/ManageSubscriptionModal';
import {
  clearManualRemindersForm,
  loadManualRemindersForm
} from '../../containers/manualreminders/ManualRemindersActions';
import { clearSubscriptionModal, loadSubcriptionModal } from '../../containers/subscription/SubscriptionActions';
import { getEntityKeyId } from '../../utils/DataUtils';
import { NoResults } from '../../utils/Layout';
import { formatPeopleInfo, sortPeopleByName } from '../../utils/PeopleUtils';
import { OL } from '../../utils/consts/Colors';
import { SEARCH } from '../../utils/consts/FrontEndStateConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';

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

type Props = {
  actions :{
    clearManualRemindersForm :() => void;
    loadManualRemindersForm :RequestSequence;
    clearSubscriptionModal :() => void;
    loadSubcriptionModal :RequestSequence;
  };
  contactResults :Map;
  includeContact :boolean;
  includeManualRemindersButton :boolean;
  loading :boolean;
  noResults :boolean;
  noResultsText :string;
  people :Map;
  peopleIdsToContactIds :Map;
  submitCallback :() => void;
}

class PersonSubscriptionList extends React.Component<Props, *> {
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
    this.setState({
      manageSubscriptionModalOpen: false,
      creatingManualReminder: false
    });
    actions.clearSubscriptionModal();
    actions.clearManualRemindersForm();
  }

  openManageSubscriptionModal = (person :Map) => {
    const { actions } = this.props;
    const personEntityKeyId :UUID = getEntityKeyId(person);
    actions.loadSubcriptionModal({ personEntityKeyId });
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
          isOpen={manageSubscriptionModalOpen}
          onClose={this.onClose} />
    );
  }

  openCreateManualReminderModal = (person :Map) => {
    const { actions } = this.props;
    const { personEntityKeyId } = formatPeopleInfo(person);
    actions.loadManualRemindersForm({ personEntityKeyId });
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
        {
          loading
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

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Manual Reminder Actions
    clearManualRemindersForm,
    loadManualRemindersForm,
    // Subscriptions Actions
    clearSubscriptionModal,
    loadSubcriptionModal
  }, dispatch)
});
// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(PersonSubscriptionList);
