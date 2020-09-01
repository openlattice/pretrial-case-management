/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Button, Modal } from 'lattice-ui-kit';
// $FlowFixMe

import { Wrapper } from '../utils/Layout';

const ModalBody = styled.div`
  width: 300px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: 30px 0;
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
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
    ? <Button color="secondary" disabled={disabled} onClick={onClose}>Ok</Button>
    : (
      <>
        <Button color="secondary" disabled={disabled} onClick={confirmationAction}>Yes</Button>
        <Button disabled={disabled} onClick={onClose}>No</Button>
      </>
    );
  return (
    <Wrapper>
      <Modal
          isVisible={open}
          onClose={onClose}
          onClicckSecondary={onClose}
          onClickPrimary={confirmationAction}
          shouldStretchButtons
          textPrimary="Yes"
          textSecondary="No"
          textTitle={confirmationText}
          viewportScrolling />
    </Wrapper>
  );
};

ConfirmationModal.defaultProps = {
  customText: '',
  disabled: false
};

export default ConfirmationModal;
