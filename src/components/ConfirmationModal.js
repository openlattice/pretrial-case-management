/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';
// $FlowFixMe
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';

import { Wrapper } from '../utils/Layout';

const ModalBody = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 30px 0;
`;

const MessageBody = styled.div`
  text-align: center;
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

type Props = {
  customText ?:string;
  confirmationType :string;
  confirmationAction :() => void;
  disabled ?:boolean;
  objectType :string;
  open :boolean;
  onClose :() => void
}

const MODAL_WIDTH = '300px';
const MODAL_HEIGHT = '200px';

const ConfirmationModal = ({
  confirmationAction,
  confirmationType,
  customText,
  disabled,
  open,
  onClose,
  objectType
} :Props) => {
  const confirmationText = customText || `Are you sure you want to ${confirmationType} this ${objectType}?`;

  const buttons = customText
    ? <Button color="secondary" disabled={disabled} onClick={onClose}>OK</Button>
    : (
      <>
        <Button color="secondary" disabled={disabled} onClick={confirmationAction}>Yes</Button>
        <Button disabled={disabled} onClick={onClose}>No</Button>
      </>
    );
  return (
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
                stackIndex={30}>
              <ModalBody>
                <MessageBody>{confirmationText}</MessageBody>
                <ButtonContainer>
                  { buttons }
                </ButtonContainer>
              </ModalBody>
            </Modal>
          )
        }
      </ModalTransition>
    </Wrapper>
  );
};

ConfirmationModal.defaultProps = {
  customText: '',
  disabled: false
};

export default ConfirmationModal;
