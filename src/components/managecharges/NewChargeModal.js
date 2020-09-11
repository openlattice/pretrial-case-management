/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Modal } from 'lattice-ui-kit';

import NewChargeForm from '../../containers/charges/NewChargeForm';

const Body = styled.div`
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  width: 800px;
`;

type Props = {
  charge ?:Map;
  chargeType :string;
  onClose :() => void;
  open :boolean;
}

const NewChargeModal = ({
  charge,
  chargeType,
  open,
  onClose,
} :Props) => (
  <Modal
      isVisible={open}
      onClose={onClose}
      shouldCloseOnOutsideClick
      textTitle={charge.size ? 'Update Charge' : 'Create New Charge'}
      viewportScrolling>
    <Body>
      <NewChargeForm
          chargeType={chargeType}
          charge={charge}
          onClose={onClose}
          modal />
    </Body>
  </Modal>
);

NewChargeModal.defaultProps = {
  charge: Map()
};

// $FlowFixMe
export default NewChargeModal;
