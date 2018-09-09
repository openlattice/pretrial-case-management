import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

import * as OverrideClassNames from '../utils/styleoverrides/OverrideClassNames';

function getBody(submissionStatus, pageContent) {
  if (submissionStatus) {
    return pageContent();
  }
  return `There was an error submitting your report. Please try again.
  If there continues to be an issue, contact help@openlattice.com.`;
}

function ConfirmationModal({ open, submissionStatus, pageContent }) {
  return (
    <Modal show={open} dialogClassName={OverrideClassNames.PSA_REVIEW_MODAL}>
      <Modal.Body>
        { getBody(submissionStatus, pageContent) }
      </Modal.Body>
    </Modal>
  );
}

ConfirmationModal.propTypes = {
  pageContent: PropTypes.func.isRequired,
  submissionStatus: PropTypes.bool.isRequired,
  open: PropTypes.bool.isRequired
};

export default ConfirmationModal;
