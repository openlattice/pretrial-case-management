/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Button, Checkbox } from 'lattice-ui-kit';

import StyledCheckbox from '../controls/StyledCheckbox';
import StyledInput from '../controls/StyledInput';
import ConfirmationModal from '../ConfirmationModal';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CHARGE_TYPES, CHARGE_HEADERS } from '../../utils/consts/ChargeConsts';
import { CONFIRMATION_ACTION_TYPES, CONFIRMATION_OBJECT_TYPES } from '../../utils/consts/Consts';
import { OL } from '../../utils/consts/Colors';
import {
  FormSection,
  InputRow,
  InputGroup,
  InputLabel
} from '../person/PersonFormTags';

const StyledFormSection = styled(FormSection)`
  border-bottom: ${(props :Object) => (props.modal ? 'none' : `border-bottom: 1px solid ${OL.GREY11}`)};
`;

const StyledInputWithErrors = styled(StyledInput)`
  border: ${(props) => (props.invalid ? `1px solid ${OL.RED01}` : 'auto')};
`;

const ButtonContainer = styled.div`
  margin: 30px 0;
  width: fit-content;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  button {
    margin-right: 10px;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 30px 0 0;

  label {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: ${OL.GREY02};
  }
`;

type Props = {
  statute :string,
  chargeType :string,
  confirmViolentCharge :boolean,
  creatingNew :boolean,
  description :string,
  degree :string,
  degreeShort :string,
  isViolent :boolean,
  isStep2 :boolean,
  isStep4 :boolean,
  isBHE :boolean,
  isBRE :boolean,
  readyToSubmit :boolean,
  deleteCharge :() => void,
  handleCheckboxChange :(e :SyntheticInputEvent<HTMLInputElement>) => void,
  handleOnChangeInput :(e :SyntheticInputEvent<HTMLInputElement>) => void,
  onSubmit :() => void,
}

type State = {
  editing :boolean;
  confirmationModalOpen :boolean;
}

class PersonContactInfo extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      editing: false,
      confirmationModalOpen: false
    };
  }

  editCharge = () => (this.setState({ editing: true }));
  cancelEditCharge = () => (this.setState({ editing: false }))

  openConfirmationModal = () => this.setState({ confirmationModalOpen: true });
  closeConfirmationModal = () => this.setState({ confirmationModalOpen: false });

  renderButtons = () => {
    const { editing } = this.state;
    const { creatingNew, readyToSubmit, onSubmit } = this.props;
    let modifyButtons;
    if (!creatingNew && !editing) {
      modifyButtons = (
        <ButtonContainer>
          <Button mode="primary" onClick={this.editCharge}>Edit Charge</Button>
        </ButtonContainer>
      );
    }
    else {
      modifyButtons = (
        <ButtonContainer>
          <Button mode="primary" disabled={!readyToSubmit} onClick={onSubmit}>Submit</Button>
          <Button mode="secondary" onClick={this.cancelEditCharge}>Cancel</Button>
          {
            creatingNew
              ? null
              : <Button mode="negative" onClick={this.openConfirmationModal}>Delete</Button>
          }
        </ButtonContainer>
      );
    }
    return modifyButtons;
  }

  renderInput = (name :string, value :string) => {
    const { editing } = this.state;
    const { handleOnChangeInput, creatingNew } = this.props;
    let input;
    if (editing || creatingNew) {
      input = (
        <StyledInputWithErrors
            name={name}
            value={value}
            onChange={handleOnChangeInput} />
      );
    }
    else {
      input = <div>{value}</div>;
    }
    return input;
  }

  renderCheckboxInput = (
    name :string,
    value :string,
    checked :boolean
  ) => {
    const { editing } = this.state;
    const { handleCheckboxChange, creatingNew } = this.props;
    const disabled = creatingNew ? false : !editing;
    const label = this.formatBooleanLabel(checked);
    return (
      <Checkbox
          mode="button"
          name={name}
          value={value}
          checked={checked}
          onChange={handleCheckboxChange}
          disabled={disabled}
          label={label} />
    );
  }

  formatBooleanLabel = (boolean :boolean) => (boolean ? 'Yes' : 'No');

  renderConfirmationModal = () => {
    const { deleteCharge } = this.props;
    const { confirmationModalOpen } = this.state;

    return (
      <ConfirmationModal
          confirmationType={CONFIRMATION_ACTION_TYPES.DELETE}
          objectType={CONFIRMATION_OBJECT_TYPES.CHARGE}
          onClose={this.closeConfirmationModal}
          open={confirmationModalOpen}
          confirmationAction={deleteCharge} />
    );
  }

  render() {
    const { chargeType, confirmViolentCharge, handleCheckboxChange } = this.props;
    let {
      description,
      degree,
      degreeShort,
      isViolent,
      isStep2,
      isStep4,
      isBHE,
      isBRE,
      statute
    } = this.props;

    const confirmViolentText = isViolent
      ? 'CHARGE IS VIOLENT'
      : 'CHARGE IS NOT VIOLENT';

    const confirmViolentDisabled = !(statute && description);

    description = description || '';
    degree = degree || '';
    degreeShort = degreeShort || '';
    statute = statute || '';

    isViolent = isViolent || false;
    isStep2 = isStep2 || false;
    isStep4 = isStep4 || false;
    isBHE = isBHE || false;
    isBRE = isBRE || false;

    return (
      <StyledFormSection modal>
        <InputRow numColumns={3}>
          <InputGroup>
            <InputLabel>Statute</InputLabel>
            {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, statute) }
          </InputGroup>
          <InputGroup>
            <InputLabel>Degree</InputLabel>
            {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL, degree) }
          </InputGroup>
          <InputGroup>
            <InputLabel>Degree (Short)</InputLabel>
            {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE, degreeShort) }
          </InputGroup>
        </InputRow>
        <InputRow numColumns={1}>
          <InputGroup>
            <InputLabel>Description</InputLabel>
            {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, description) }
          </InputGroup>
        </InputRow>
        <InputRow numColumns={5}>
          <InputGroup>
            <InputLabel>Violent</InputLabel>
            {this.renderCheckboxInput(CHARGE_HEADERS.VIOLENT, PROPERTY_TYPES.CHARGE_IS_VIOLENT, isViolent)}
          </InputGroup>
          <InputGroup>
            <InputLabel>Max Increase</InputLabel>
            {this.renderCheckboxInput(CHARGE_HEADERS.STEP_2, PROPERTY_TYPES.CHARGE_RCM_STEP_2, isStep2)}
          </InputGroup>
          <InputGroup>
            <InputLabel>Single Increase</InputLabel>
            {this.renderCheckboxInput(CHARGE_HEADERS.STEP_4, PROPERTY_TYPES.CHARGE_RCM_STEP_4, isStep4)}
          </InputGroup>
          {
            (chargeType === CHARGE_TYPES.ARREST)
              ? (
                <>
                  <InputGroup>
                    <InputLabel>BHE</InputLabel>
                    {this.renderCheckboxInput(CHARGE_HEADERS.BHE, PROPERTY_TYPES.BHE, isBHE)}
                  </InputGroup>
                  <InputGroup>
                    <InputLabel>BRE</InputLabel>
                    {this.renderCheckboxInput(CHARGE_HEADERS.BRE, PROPERTY_TYPES.BRE, isBRE)}
                  </InputGroup>
                </>
              )
              : null
          }
        </InputRow>
        <InputRow>
          <CheckboxContainer>
            <StyledCheckbox
                name="confirmViolentCharge"
                label={confirmViolentText}
                checked={confirmViolentCharge}
                value="confirmViolentCharge"
                onChange={handleCheckboxChange}
                disabled={confirmViolentDisabled} />
          </CheckboxContainer>
        </InputRow>
        { this.renderButtons() }
        { this.renderConfirmationModal() }
      </StyledFormSection>
    );
  }
}

export default PersonContactInfo;
