import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';

import { ButtonWrapper } from '../utils/Layout';

import { isSubmitted } from '../containers/psa/FormReducer';

function getTitle() {
  if (isSubmitted) {
    return 'Success!';
  }
  return 'Error Submitting Report';
}

function getBody() {
  if (isSubmitted) {
    return 'Your psa report has been submitted.';
  }
  return `There was an error submitting your report. Please try again.
  If there continues to be an issue, contact help@openlattice.com.`;
}

function ConfirmationModal({ handleModalButtonClick }) {
  return (
    <div className="static-modal">
      <Modal.Dialog>
        <Modal.Header>
          <Modal.Title>
            { getTitle() }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { getBody() }
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
  handleModalButtonClick: PropTypes.func.isRequired
};

export default ConfirmationModal;
