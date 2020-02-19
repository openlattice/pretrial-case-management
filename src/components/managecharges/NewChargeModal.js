/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
// $FlowFixMe
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';

import NewChargeForm from '../../containers/charges/NewChargeForm';
import { Wrapper, TitleWrapper, CloseModalX } from '../../utils/Layout';

const MODAL_WIDTH = '800px';

const Body = styled.div`
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  margin: 0 -15px;
  width: calc(100% + 30px);
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
  <Wrapper>
    <ModalTransition>
      {
        open
        && (
          <Modal
              scrollBehavior="outside"
              onClose={() => onClose()}
              width={MODAL_WIDTH}
              shouldCloseOnOverlayClick
              stackIndex={1}>
            <TitleWrapper>
              <h1>{ charge.size ? 'Update Charge' : 'Create New Charge'}</h1>
              <div>
                <CloseModalX onClick={onClose} />
              </div>
            </TitleWrapper>
            <Body>
              <NewChargeForm
                  chargeType={chargeType}
                  charge={charge}
                  onClose={onClose}
                  modal />
            </Body>
          </Modal>
        )
      }
    </ModalTransition>
  </Wrapper>
);

NewChargeModal.defaultProps = {
  charge: Map()
};

// $FlowFixMe
export default NewChargeModal;
