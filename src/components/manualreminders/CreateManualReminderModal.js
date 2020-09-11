/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Modal } from 'lattice-ui-kit';
import { Map } from 'immutable';

import ManualRemindersForm from '../../containers/manualreminders/ManualRemindersForm';

const ModalBody = styled.div`
  width: 750px;
  height: max-content;
  padding-bottom: 30px;
`;

type Props = {
  person :Map,
  open :boolean,
  onClose :() => void,
  submitCallback :() => void
}

const ManualReminderModal = ({
  onClose,
  open,
  person,
  submitCallback
} :Props) => (
  <Modal
      isVisible={open}
      onClose={onClose}
      shouldCloseOnOutsideClick
      textTitle="Record Communication (Manual Reminder)"
      viewportScrolling>
    <ModalBody>
      <ManualRemindersForm person={person} submitCallback={submitCallback} />
    </ModalBody>
  </Modal>
);

export default ManualReminderModal;
