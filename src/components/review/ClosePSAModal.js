/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { ButtonToolbar, Modal, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import StyledButton from '../buttons/StyledButton';
import StyledInput from '../../components/controls/StyledInput';
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

const TextLabel = styled.div`
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
  defaultStatusNotes? :?string,
  onSubmit :(status :string, failureReason :string[], statusNotes :?string) => void
};

type State = {
  status :?string,
  failureReason :string[],
  statusNotes :?string
};

const StatusPicker = ({ status, onStatusChange }) => (
  <StatusContainer>
    <ButtonToolbar>
      <ToggleButtonGroup
          type="radio"
          name="statusPicker"
          value={status}
          onChange={onStatusChange}>
        {Object.values(PSA_STATUSES).map(value => <StatusButton value={value} key={value}>{value}</StatusButton>)}
      </ToggleButtonGroup>
    </ButtonToolbar>
  </StatusContainer>
);

const FailureReasonPicker = ({ failureReason, onFailureReasonChange }) => (
  <StatusContainer>
    <TextLabel>Reason for Failure:</TextLabel>
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

const StatusNotes = ({ statusNotes, onStatusNotesChange }) => (
  <StatusContainer>
    <TextLabel>Notes</TextLabel>
    <StyledInput value={statusNotes} onChange={onStatusNotesChange} />
  </StatusContainer>
);

export default class ClosePSAModal extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      status: props.defaultStatus,
      failureReason: props.defaultFailureReasons,
      statusNotes: props.defaultStatusNotes
    };
  }

  onStatusChange = (status :string) => {
    const failureReason = status !== PSA_STATUSES.FAILURE ? [] : this.state.failureReason;
    this.setState({ status, failureReason });
  }

  onFailureReasonChange = (failureReason :string[]) => {
    this.setState({ failureReason });
  }

  onStatusNotesChange = (e) => {
    this.setState({ statusNotes: e.target.value });
  }

  isReadyToSubmit = () => {
    const { status, failureReason } = this.state;
    let isReady = !!status;
    if (status === PSA_STATUSES.FAILURE && !failureReason.length) {
      isReady = false;
    }
    return isReady;
  }

  submit = () => {
    if (!this.state.status) return;
    let { statusNotes } = this.state;
    if (!statusNotes || !statusNotes.length) {
      statusNotes = null;
    }

    this.props.onSubmit(this.state.status, this.state.failureReason, this.state.statusNotes);
    this.props.onClose();
  }

  render() {
    const { status, failureReason, statusNotes } = this.state;
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
            <StatusNotes statusNotes={statusNotes} onStatusNotesChange={this.onStatusNotesChange} />
            <CloseButton disabled={!this.isReadyToSubmit()} onClick={this.submit}>Submit</CloseButton>
          </CenteredContainer>
        </Modal.Body>
      </Modal>
    );
  }
}
