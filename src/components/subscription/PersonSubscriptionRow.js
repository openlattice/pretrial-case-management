/*
 * @flow
 */
import React from 'react';

import styled from 'styled-components';
import { faCog, faPaperPlane } from '@fortawesome/pro-light-svg-icons';
import { faBell } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { Button } from 'lattice-ui-kit';

import { formatPeopleInfo } from '../../utils/PeopleUtils';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const Row = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 3fr 2fr 1fr;
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
  font-size: 11px;
  color: ${OL.GREY15};
  text-align: left;
  padding: 5px;
`;

const ButtonContainer = styled(BodyElement)`
  justify-content: flex-end;
`;

const ManageSubscriptionButton = styled(Button)`
  width: 30px;
  padding: 5px 0;
  font-size: 12px;
`;

const OpenCreateManualReminderButton = styled(ManageSubscriptionButton)`
  margin-right: 10px;
`;

type Props = {
  contact :Map;
  includeManualRemindersButton :boolean;
  openManageSubscriptionModal :(person :Map) => void;
  openCreateManualReminderModal :(person :Map) => void;
  person :Map;
}

class PersonSubscriptionRow extends React.Component<Props> {

  renderManageSubscriptionButton = () => {
    const { person, openManageSubscriptionModal } = this.props;
    return (
      <ManageSubscriptionButton size="small" onClick={() => openManageSubscriptionModal(person)}>
        <FontAwesomeIcon icon={faCog} />
      </ManageSubscriptionButton>
    );
  }
  renderManualReminderButton = () => {
    const { person, openCreateManualReminderModal } = this.props;
    return (
      <OpenCreateManualReminderButton size="small" onClick={() => openCreateManualReminderModal(person)}>
        <FontAwesomeIcon icon={faPaperPlane} />
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
        { phone ? <BodyElement>{phone}</BodyElement> : <div /> }
        <ButtonContainer>
          { includeManualRemindersButton ? this.renderManualReminderButton() : null }
          {this.renderManageSubscriptionButton()}
        </ButtonContainer>
      </Row>
    );
  }
}

export default PersonSubscriptionRow;
