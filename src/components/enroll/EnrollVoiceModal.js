/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';


import EnrollVoice from '../../containers/enroll/EnrollVoice';
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
  personId :string,
  personEntityKeyId :string,
  personName :string,
  open :() => void,
  onClose :() => void
}

const MODAL_WIDTH = '750px';
const MODAL_HEIGHT = 'max-content';

const EnrollVoiceModal = ({
  personId,
  personEntityKeyId,
  personName,
  onClose,
  open
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
                  <h2>Enroll Voice Profile</h2>
                  <div>
                    <CloseModalX onClick={onClose} />
                  </div>
                </TitleWrapper>
              </ColumnRow>
              <ColumnRow>
                <EnrollVoice
                    open={open}
                    onClose={onClose}
                    personId={personId}
                    personEntityKeyId={personEntityKeyId}
                    personName={personName} />
              </ColumnRow>
            </ModalBody>
          </Modal>
        )
      }
    </ModalTransition>
  </Wrapper>
);

export default EnrollVoiceModal;
