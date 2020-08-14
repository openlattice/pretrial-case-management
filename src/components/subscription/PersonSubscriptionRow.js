/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPaperPlane } from '@fortawesome/pro-light-svg-icons';
import { faBell } from '@fortawesome/pro-solid-svg-icons';

import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { formatPeopleInfo } from '../../utils/PeopleUtils';

const Row = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: ${(props) => (props.includeContact ? '45% 25% 30%' : '62% 38%')};
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

const ManageSubscriptionButton = styled(Button)`
  width: 100%;
  padding: 5px 0;
  font-size: 12px;
`;

const OpenCreateManualReminderButton = styled(ManageSubscriptionButton)`
  width: 30%;
  margin-right: 10px;
`;

class PersonSubscriptionRow extends React.Component<Props, State> {

  renderManageSubscriptionButton = () => {
    const { person, openManageSubscriptionModal } = this.props;
    return (
      <ManageSubscriptionButton onClick={() => openManageSubscriptionModal(person)}>
        <FontAwesomeIcon icon={faCog} height="12px" />
        {' Settings'}
      </ManageSubscriptionButton>
    );
  }
  renderManualReminderButton = () => {
    const { person, openCreateManualReminderModal } = this.props;
    return (
      <OpenCreateManualReminderButton onClick={() => openCreateManualReminderModal(person)}>
        <FontAwesomeIcon icon={faPaperPlane} height="12px" />
      </OpenCreateManualReminderButton>
    );
  }
  render() {
    const { contact, person, includeManualRemindersButton } = this.props;
    const { lastFirstMid, isReceivingReminders } = formatPeopleInfo(person);
    const phone = contact
      ? contact.getIn([PROPERTY_TYPES.PHONE, 0], 'N/A')
      : undefined;
    return (
      <Row includeContact={phone}>
        <BodyElement>
          {lastFirstMid}
          {
            isReceivingReminders
              ? <BodyElement><FontAwesomeIcon icon={faBell} color={OL.ORANGE01} height="12px" /></BodyElement>
              : null
          }
        </BodyElement>
        { phone ? <BodyElement>{phone}</BodyElement> : null }
        <BodyElement>
          { includeManualRemindersButton ? this.renderManualReminderButton() : null }
          {this.renderManageSubscriptionButton()}
        </BodyElement>
      </Row>
    );
  }
}

export default PersonSubscriptionRow;
