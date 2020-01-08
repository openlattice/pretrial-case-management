/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';

import BasicButton from './buttons/BasicButton';
import { Wrapper } from '../utils/Layout';
import { OL } from '../utils/consts/Colors';

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


const StyledBasicButton = styled(BasicButton)`
  width: 120px;
  height: 40px;
  background-color: ${(props) => (props.yes ? OL.PURPLE02 : OL.GREY08)};
  color: ${(props) => (props.yes ? OL.WHITE : OL.GREY02)};
`;

type Props = {
  customText :string,
  confirmationType :string,
  confirmationAction :() => void,
  disabled :boolean,
  objectType :string,
  open :() => void,
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
    ? <StyledBasicButton disabled={disabled} onClick={onClose} yes>OK</StyledBasicButton>
    : (
      <>
        <StyledBasicButton disabled={disabled} onClick={confirmationAction} yes>Yes</StyledBasicButton>
        <StyledBasicButton disabled={disabled} onClick={onClose}>No</StyledBasicButton>
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

export default ConfirmationModal;
