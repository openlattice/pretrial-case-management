/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Modal } from 'lattice-ui-kit';

import EnrollVoice from '../../containers/enroll/EnrollVoice';
import { PaddedStyledColumnRow, TitleWrapper } from '../../utils/Layout';

const ModalBody = styled.div`
  width: 750px;
  height: max-content;
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
  open :boolean,
  onClose :() => void
}

const EnrollVoiceModal = ({
  personId,
  personEntityKeyId,
  onClose,
  open
} :Props) => (
  <Modal
      isVisible={open}
      viewportScrolling
      onClose={onClose}>
    <ModalBody>
      <ColumnRow>
        <TitleWrapper noPadding>
          <h2>Enroll Voice Profile</h2>
        </TitleWrapper>
      </ColumnRow>
      <ColumnRow>
        <EnrollVoice
            onClose={onClose}
            personId={personId}
            personEntityKeyId={personEntityKeyId} />
      </ColumnRow>
    </ModalBody>
  </Modal>
);

export default EnrollVoiceModal;
