/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { ButtonToolbar, Modal, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import StyledButton from '../buttons/StyledButton';
import { CenteredContainer } from '../../utils/Layout';
import { PSA_STATUSES, PSA_FAILURE_REASONS } from '../../utils/consts/Consts';

const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatusButton = styled(ToggleButton)`
  -webkit-appearance: none !important;
`;

const FailureReasonText = styled.div`
  font-size: 14px;
  margin: 15px 0 5px 0;
`;

const CloseButton = styled(StyledButton)`
  margin-top: 15px;
`;

type Props = {
  open :boolean,
  onClose :() => void,
  defaultStatus? :?string,
  defaultFailureReasons? :string[],
  onSubmit :(status :string, failureReason :string[]) => void
};

type State = {
  status :?string,
  failureReason :string[]
};

const StatusPicker = ({ status, onStatusChange }) => (
  <StatusContainer>
    <ButtonToolbar>
      <ToggleButtonGroup
          type="radio"
          name="statusPicker"
          value={status}
          onChange={onStatusChange}>
        <StatusButton value={PSA_STATUSES.SUCCESS}>{PSA_STATUSES.SUCCESS}</StatusButton>
        <StatusButton value={PSA_STATUSES.FAILURE}>{PSA_STATUSES.FAILURE}</StatusButton>
      </ToggleButtonGroup>
    </ButtonToolbar>
  </StatusContainer>
);

const FailureReasonPicker = ({ failureReason, onFailureReasonChange }) => (
  <StatusContainer>
    <FailureReasonText>Reason for Failure:</FailureReasonText>
    <ButtonToolbar>
      <ToggleButtonGroup
          type="checkbox"
          name="failureReasonPicker"
          value={failureReason}
          onChange={onFailureReasonChange}>
        <StatusButton value={PSA_FAILURE_REASONS.FTA}>{PSA_FAILURE_REASONS.FTA}</StatusButton>
        <StatusButton value={PSA_FAILURE_REASONS.REARREST}>{PSA_FAILURE_REASONS.REARREST}</StatusButton>
        <StatusButton value={PSA_FAILURE_REASONS.NONCOMPLIANCE}>{PSA_FAILURE_REASONS.NONCOMPLIANCE}</StatusButton>
        <StatusButton value={PSA_FAILURE_REASONS.OTHER}>{PSA_FAILURE_REASONS.OTHER}</StatusButton>
      </ToggleButtonGroup>
    </ButtonToolbar>
  </StatusContainer>
);

export default class ClosePSAModal extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      status: props.defaultStatus,
      failureReason: props.defaultFailureReasons
    };
  }

  onStatusChange = (status :string) => {
    const failureReason = status === PSA_STATUSES.SUCCESS ? [] : this.state.failureReason;
    this.setState({ status, failureReason });
  }

  onFailureReasonChange = (failureReason :string[]) => {
    this.setState({ failureReason });
  }

  isReadyToSubmit = () => {
    let isReady = !!this.state.status;
    if (this.state.status === PSA_STATUSES.FAILURE && !this.state.failureReason) {
      isReady = false;
    }
    return isReady;
  }

  submit = () => {
    if (!this.state.status) return;

    this.props.onSubmit(this.state.status, this.state.failureReason);
    this.props.onClose();
  }

  render() {
    const { status, failureReason } = this.state;
    return (
      <Modal show={this.props.open} onHide={this.props.onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Select PSA Resolution</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CenteredContainer>
            <StatusPicker status={status} onStatusChange={this.onStatusChange} />
            { status === PSA_STATUSES.FAILURE
              ? <FailureReasonPicker failureReason={failureReason} onFailureReasonChange={this.onFailureReasonChange} />
              : null
            }
            <CloseButton disabled={!this.isReadyToSubmit()} onClick={this.submit}>Submit</CloseButton>
          </CenteredContainer>
        </Modal.Body>
      </Modal>
    );
  }
}
