/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import CheckboxButton from '../controls/StyledCheckboxButton';
import StyledCheckbox from '../controls/StyledCheckbox';
import StyledInput from '../controls/StyledInput';
import InfoButton from '../buttons/InfoButton';
import ConfirmationModal from '../ConfirmationModal';
import { PrimaryButton, TertiaryButton } from '../../utils/Layout';
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
  border-bottom: ${props => (props.modal ? 'none' : `border-bottom: 1px solid ${OL.GREY11}`)};
`;

const StyledInputWithErrors = styled(StyledInput)`
  border: ${props => (props.invalid ? `1px solid ${OL.RED01}` : 'auto')};
`;

const SubmitButton = styled(InfoButton)`
  width: 120px;
  margin-right: 15px;
`;

const DeleteButton = styled(InfoButton)`
  width: 120px;
  margin-right: 15px;
`;

const CancelButton = styled(TertiaryButton)`
  width: 120px;
  margin-right: 15px;
`;

const ButtonContainer = styled.div`
  margin: 30px 0;
  width: fit-content;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
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
  deleteCharge :(values :{
    entityKeyId :string,
    entitySetId :string,
    entitySetName :string,
  }) => void,
  handleCheckboxChange :() => void,
  handleOnChangeInput :() => void,
  onSubmit :() => void,
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

  renderSubmitButton = () => {
    const { readyToSubmit, onSubmit } = this.props;
    return (
      <SubmitButton disabled={!readyToSubmit} onClick={onSubmit}>
        Submit
      </SubmitButton>
    );
  }

  renderDeleteButton = () => (
    <DeleteButton onClick={this.openConfirmationModal}>
      Delete
    </DeleteButton>
  );

  renderEditButton = () => (
    <PrimaryButton onClick={this.editCharge}>
      Edit Charge
    </PrimaryButton>
  )

  renderCancelButton = () => (
    <CancelButton onClick={this.cancelEditCharge}>
      Cancel
    </CancelButton>
  )

  renderButtons = () => {
    const { editing } = this.state;
    const { creatingNew } = this.props;
    let modifyButtons;
    if (!creatingNew && !editing) {
      modifyButtons = (
        <ButtonContainer>
          { this.renderEditButton() }
        </ButtonContainer>
      );
    }
    else {
      modifyButtons = (
        <ButtonContainer>
          { this.renderSubmitButton() }
          { this.renderCancelButton() }
          { creatingNew
            ? null
            : this.renderDeleteButton()
          }
        </ButtonContainer>
      );
    }
    return modifyButtons;
  }

  renderInput = (name, value) => {
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
    name,
    value,
    checked
  ) => {
    const { editing } = this.state;
    const { handleCheckboxChange, creatingNew } = this.props;
    const disabled = creatingNew ? false : !editing;
    const label = this.formatBooleanLabel(checked);
    return (
      <CheckboxButton
          small
          name={name}
          value={value}
          checked={checked}
          onChange={handleCheckboxChange}
          disabled={disabled}
          label={label} />
    );
  }

  formatBooleanLabel = boolean => (boolean ? 'Yes' : 'No');

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
      : 'CHARGE IS NOT VIOLENT'

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
        {
          (chargeType === CHARGE_TYPES.ARREST)
            ? (
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
            )
            : (
              <InputRow numColumns={3}>
                <InputGroup>
                  <InputLabel>Statute</InputLabel>
                  {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, statute) }
                </InputGroup>
              </InputRow>
            )
        }
        <InputRow numColumns={1}>
          <InputGroup>
            <InputLabel>Description</InputLabel>
            {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, description) }
          </InputGroup>
        </InputRow>
        {
          (chargeType === CHARGE_TYPES.ARREST)
            ? (
              <InputRow numColumns={5}>
                <InputGroup>
                  <InputLabel>Violent</InputLabel>
                  {this.renderCheckboxInput(
                    CHARGE_HEADERS.VIOLENT,
                    PROPERTY_TYPES.CHARGE_IS_VIOLENT,
                    isViolent
                  )}
                </InputGroup>
                <InputGroup>
                  <InputLabel>Step 2</InputLabel>
                  {this.renderCheckboxInput(CHARGE_HEADERS.STEP_2,
                    PROPERTY_TYPES.CHARGE_RCM_STEP_2,
                    isStep2)}
                </InputGroup>
                <InputGroup>
                  <InputLabel>Step 4</InputLabel>
                  {this.renderCheckboxInput(CHARGE_HEADERS.STEP_4,
                    PROPERTY_TYPES.CHARGE_RCM_STEP_4,
                    isStep4)}
                </InputGroup>
                <InputGroup>
                  <InputLabel>BHE</InputLabel>
                  {this.renderCheckboxInput(CHARGE_HEADERS.BHE,
                    PROPERTY_TYPES.BHE,
                    isBHE)}
                </InputGroup>
                <InputGroup>
                  <InputLabel>BRE</InputLabel>
                  {this.renderCheckboxInput(CHARGE_HEADERS.BRE,
                    PROPERTY_TYPES.BRE,
                    isBRE)}
                </InputGroup>
              </InputRow>
            )
            : (
              <InputRow numColumns={5}>
                <InputGroup>
                  <InputLabel>Violent</InputLabel>
                  {this.renderCheckboxInput(
                    CHARGE_HEADERS.VIOLENT,
                    PROPERTY_TYPES.CHARGE_IS_VIOLENT,
                    isViolent
                  )}
                </InputGroup>
              </InputRow>
            )
        }
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
