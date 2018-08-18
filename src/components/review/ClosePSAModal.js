/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Modal } from 'react-bootstrap';

import RadioButton from '../controls/StyledRadioButton';
import Checkbox from '../controls/StyledCheckbox';
import StyledInput from '../../components/controls/StyledInput';
import InfoButton from '../buttons/InfoButton';
import closeX from '../../assets/svg/close-x-gray.svg';
import { CenteredContainer } from '../../utils/Layout';
import { PSA_STATUSES, PSA_FAILURE_REASONS } from '../../utils/consts/Consts';


const ModalWrapper = styled(CenteredContainer)`
  margin-top: -15px;
  padding: 15px;
  width: 100%;
  color: #555e6f;
  font-family: 'Open Sans', sans-serif;
  justify-content: center;
  h1, h2, h3 {
    width: 100%;
    text-align: left;
  }
  h1 {
    font-size: 18px;
    margin: 30px 0;
  }
  h2 {
    font-size: 16px;
    margin: 20px 0;
  }
  h3 {
    font-size: 14px;
    margin: 10px 0;
  }
`;

const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SubmitButton = styled(InfoButton)`
  width: 340px;
  height: 43px;
  margin-top: 30px;
`;

const CloseModalX = styled.img.attrs({
  alt: '',
  src: closeX
})`
  height: 16px;
  width: 16px;
  margin-left: 40px;

  &:hover {
    cursor: pointer;
  }
`;

const StatusNotes = styled.div`
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RadioWrapper = styled.div`
  display: flex;
  flex-grow: 1;
`;

export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => (`repeat(${props.numColumns}, 1fr)`)};
  grid-gap: ${props => (`${props.gap}px`)};
`;

const FailureReasonsWrapper = styled.div`
  font-size: 16px;
  text-align: left;
  color: #555e6f;
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

export default class ClosePSAModal extends React.Component<Props, State> {

  static defaultProps = {
    defaultStatus: '',
    defaultFailureReasons: [],
    defaultStatusNotes: ''
  }

  mapOptionsToRadioButtons = (options :{}, field :string) => Object.values(options).map(option => (
    <RadioWrapper key={option}>
      <RadioButton
          name={field}
          value={option}
          checked={this.state[field] === option}
          onChange={this.onStatusChange}
          disabled={this.state.disabled}
          label={option} />
    </RadioWrapper>
  ))

  mapOptionsToCheckboxes = (options :{}, field :string) => Object.values(options).map(option => (
    <RadioWrapper key={option}>
      <Checkbox
          name={field}
          value={option}
          checked={this.state[field].includes(option)}
          onChange={this.handleCheckboxChange}
          disabled={this.state.disabled}
          label={option} />
    </RadioWrapper>
  ))

  constructor(props :Props) {
    super(props);
    this.state = {
      status: props.defaultStatus,
      failureReason: props.defaultFailureReasons,
      statusNotes: props.defaultStatusNotes
    };
  }

  onStatusChange = (e) => {
    const { status } = this.state;
    const { name, value } = e.target;
    const failureReason = status !== PSA_STATUSES.FAILURE ? [] : this.state.failureReason;
    const state :State = Object.assign({}, this.state, {
      [name]: value,
      failureReason
    });
    this.setState(state);
  }

  handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    const values = this.state[name];

    if (checked && !values.includes(value)) {
      values.push(value);
    }
    if (!checked && values.includes(value)) {
      values.splice(values.indexOf(value), 1);
    }

    this.setState({ [name]: values });
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
    const { status, statusNotes } = this.state;
    return (
      <Modal show={this.props.open} onHide={this.props.onClose}>
        <Modal.Body>
          <ModalWrapper>
            <TitleWrapper>
              <h1>Select PSA Resolution</h1>
              <CloseModalX onClick={this.props.onClose} />
            </TitleWrapper>
            <OptionsGrid numColumns={3} gap={5}>
              {this.mapOptionsToRadioButtons(PSA_STATUSES, 'status')}
            </OptionsGrid>
            { status === PSA_STATUSES.FAILURE
              ? (
                <FailureReasonsWrapper>
                  <h2>Reason(s) for failure</h2>
                  <OptionsGrid numColumns={2} gap={10}>
                    {this.mapOptionsToCheckboxes(PSA_FAILURE_REASONS, 'failureReason')}
                  </OptionsGrid>
                </FailureReasonsWrapper>
              )
              : null
            }
            <h3>Notes</h3>
            <StatusNotes>
              <StyledInput value={statusNotes} onChange={this.onStatusNotesChange} />
            </StatusNotes>
            <SubmitButton disabled={!this.isReadyToSubmit()} onClick={this.submit}>Update</SubmitButton>
          </ModalWrapper>
        </Modal.Body>
      </Modal>
    );
  }
}
