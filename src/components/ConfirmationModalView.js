import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

import { ButtonWrapper } from '../utils/Layout';
import * as OverrideClassNames from '../utils/styleoverrides/OverrideClassNames';

function getTitle(submissionStatus) {
  if (submissionStatus) {
    return 'Success!';
  }
  return 'Error Submitting Report';
}

function getBody(submissionStatus, pageContent) {
  if (submissionStatus) {
    return pageContent();
  }
  return `There was an error submitting your report. Please try again.
  If there continues to be an issue, contact help@openlattice.com.`;
}

function ConfirmationModal({ submissionStatus, pageContent, handleModalButtonClick }) {
  const open = true;
  return (
    <Modal show={open} dialogClassName={OverrideClassNames.PSA_REVIEW_MODAL}>
      <Modal.Header>
        <Modal.Title>
          { getTitle(submissionStatus) }
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        { getBody(submissionStatus, pageContent) }
      </Modal.Body>
      <Modal.Footer>
        <ButtonWrapper>
          <Button bsStyle="primary" onClick={handleModalButtonClick}>OK</Button>
        </ButtonWrapper>
      </Modal.Footer>
    </Modal>
  );
}

ConfirmationModal.propTypes = {
  pageContent: PropTypes.func.isRequired,
  submissionStatus: PropTypes.bool.isRequired,
  handleModalButtonClick: PropTypes.func.isRequired
};

export default ConfirmationModal;
