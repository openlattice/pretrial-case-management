/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { Map } from 'immutable';


import ManualRemindersForm from '../../containers/manualreminders/ManualRemindersForm';
import {
  CloseModalX,
  PaddedStyledColumnRow,
  TitleWrapper,
  Wrapper
} from '../../utils/Layout';

const ModalBody = styled.div`
  width: 100%;
  padding: 0 30px;
`;

const ColumnRow = styled(PaddedStyledColumnRow)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

type Props = {
  person :Map<*, *>,
  open :() => void,
  onClose :() => void,
  submitCallback :() => void
}

const MODAL_WIDTH = '750px';
const MODAL_HEIGHT = 'max-content';

const ManualReminderModal = ({
  onClose,
  open,
  person,
  submitCallback
} :Props) => (
  <Wrapper>
    <ModalTransition>
      {
        open
        && (
          <Modal
              scrollBehavior="outside"
              onClose={onClose}
              width={MODAL_WIDTH}
              height={MODAL_HEIGHT}
              max-height={MODAL_HEIGHT}
              shouldCloseOnOverlayClick
              stackIndex={20}>
            <ModalBody>
              <ColumnRow>
                <TitleWrapper noPadding>
                  <h2>Record Communication (Manual Reminder)</h2>
                  <div>
                    <CloseModalX onClick={onClose} />
                  </div>
                </TitleWrapper>
              </ColumnRow>
              <ColumnRow>
                <ManualRemindersForm person={person} submitCallback={submitCallback} />
              </ColumnRow>
            </ModalBody>
          </Modal>
        )
      }
    </ModalTransition>
  </Wrapper>
);

export default ManualReminderModal;
