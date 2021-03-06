/*
 * @flow
 */

import React from 'react';
import { Modal, ModalFooter } from 'lattice-ui-kit';

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
} :Props) => (
  <Modal
      isVisible={open}
      onClose={onClose}
      withFooter={(
        <ModalFooter
            isPendingPrimary={disabled}
            isDisabledSecondary={disabled}
            onClickPrimary={confirmationAction}
            onClickSecondary={onClose}
            shouldStretchButtons
            textPrimary="Yes"
            textSecondary="No" />
      )}
      viewportScrolling>
    { customText || `Are you sure you want to ${confirmationType} this ${objectType}?` }
  </Modal>
);

ConfirmationModal.defaultProps = {
  customText: '',
  disabled: false
};

export default ConfirmationModal;
