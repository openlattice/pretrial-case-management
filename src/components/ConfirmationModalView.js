import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

import { ButtonWrapper } from '../utils/Layout';

function getTitle(submissionStatus) {
  if (submissionStatus) {
    return 'Success!';
  }
  return 'Error Submitting Report';
}

function getBody(submissionStatus) {
  if (submissionStatus) {
    return 'Your psa report has been submitted.';
  }
  return `There was an error submitting your report. Please try again.
  If there continues to be an issue, contact help@openlattice.com.`;
}

function ConfirmationModal({ submissionStatus, handleModalButtonClick }) {
  return (
    <div className="static-modal">
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>
            { getTitle(submissionStatus) }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { getBody(submissionStatus) }
        </Modal.Body>
        <Modal.Footer>
          <ButtonWrapper>
            <Button bsStyle="primary" onClick={handleModalButtonClick}>OK</Button>
          </ButtonWrapper>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
}

ConfirmationModal.propTypes = {
  submissionStatus: PropTypes.bool.isRequired,
  handleModalButtonClick: PropTypes.func.isRequired
};

export default ConfirmationModal;
