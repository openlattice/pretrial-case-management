/*
 * @flow
 */

import React from 'react';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';

const MODAL_WIDTH = '1010px';
const MODAL_HEIGHT = 'max-content';

function getBody(submissionStatus, pageContent) {
  if (submissionStatus) {
    return pageContent();
  }
  return `There was an error submitting your report. Please try again.
  If there continues to be an issue, contact help@openlattice.com.`;
}

type Props = {
  pageContent :() => void;
  submissionStatus :boolean;
  open :boolean;
}
function ConfirmationModal({ submissionStatus, pageContent, open } :Props) {
  return (
    <ModalTransition>
      {
        open
        && (
          <Modal
              scrollBehavior="outside"
              width={MODAL_WIDTH}
              height={MODAL_HEIGHT}
              max-height={MODAL_HEIGHT}
              shouldCloseOnOverlayClick
              stackIndex={1}>
            { getBody(submissionStatus, pageContent) }
          </Modal>
        )
      }
    </ModalTransition>
  );
}

export default ConfirmationModal;
