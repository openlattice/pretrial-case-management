/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPaperPlane } from '@fortawesome/pro-light-svg-icons';

import ManageSubscriptionModal from '../../containers/subscription/ManageSubscriptionModal';
import CreateManualReminderModal from '../reminders/CreateManualReminderModal';
import StyledButton from '../buttons/StyledButton';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatPeopleInfo } from '../../utils/PeopleUtils';

const { OPENLATTICE_ID_FQN } = Constants;

const Row = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: ${props => (props.includeContact ? '45% 25% 30%' : '62% 38%')};
  grid-auto-flow: column;
  border-bottom: 1px solid ${OL.GREY11};

  &:last-child {
    border-bottom: none;
  }
`;

const BodyElement = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  color: ${OL.GREY15};
  text-align: left;
  padding: 5px;
`;

const ManageSubscriptionButton = styled(StyledButton)`
  width: 100%;
  padding: 5px 0;
  font-size: 12px;
`;

const OpenCreateManualReminderButton = styled(ManageSubscriptionButton)`
  width: 30%;
  margin-right: 10px;
`;

class PersonSubscriptionRow extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      manageSubscriptionModalOpen: false,
      creatingManualReminder: false
    };
  }

  onClose = () => {
    const { onClose } = this.props;
    this.setState({
      manageSubscriptionModalOpen: false,
      creatingManualReminder: false
    });
    onClose();
  };

  onCreateSubscriptionClose = () => {
    this.setState({ creatingManualReminder: false });
  }

  openManageSubscriptionModal = () => {
    const { person, loadNeighbors } = this.props;
    const personId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
    loadNeighbors({ personId });
    this.setState({ manageSubscriptionModalOpen: true });
  };

  renderManageSubscriptionModal = () => {
    const { manageSubscriptionModalOpen } = this.state;
    const { person } = this.props;
    return (
      <ManageSubscriptionModal
          person={person}
          open={manageSubscriptionModalOpen}
          onClose={this.onClose} />
    );
  }

  openCreateManualReminderModal = () => {
    const { person, loadManualRemindersForm } = this.props;
    const personId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
    loadManualRemindersForm({ personId });
    this.setState({ creatingManualReminder: true });
  };

  renderCreateManualReminderModal = () => {
    const { creatingManualReminder } = this.state;
    const { person } = this.props;
    return (
      <CreateManualReminderModal
          person={person}
          open={creatingManualReminder}
          onClose={this.onClose} />
    );
  }

  renderManageSubscriptionButton = () => (
    <ManageSubscriptionButton onClick={this.openManageSubscriptionModal}>
      <FontAwesomeIcon icon={faCog} height="12px" />
      {' Settings'}
    </ManageSubscriptionButton>
  )

  renderManualReminderButton = () => (
    <OpenCreateManualReminderButton onClick={this.openCreateManualReminderModal}>
      <FontAwesomeIcon icon={faPaperPlane} height="12px" />
    </OpenCreateManualReminderButton>
  )

  render() {
    const { contact, person } = this.props;
    const { lastFirstMid } = formatPeopleInfo(person);
    const phone = contact
      ? contact.getIn([PROPERTY_TYPES.PHONE, 0], 'N/A')
      : undefined;
    return (
      <Row includeContact={phone}>
        <BodyElement>
          {lastFirstMid}
          { this.renderManageSubscriptionModal() }
          { this.renderCreateManualReminderModal() }
        </BodyElement>
        { phone ? <BodyElement>{phone}</BodyElement> : null }
        <BodyElement>
          {this.renderManualReminderButton()}
          {this.renderManageSubscriptionButton()}
        </BodyElement>
      </Row>
    );
  }
}

export default PersonSubscriptionRow;
