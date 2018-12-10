/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import CheckboxButton from '../controls/StyledCheckboxButton';
import StyledInput from '../controls/StyledInput';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { CHARGE_HEADERS } from '../../utils/consts/ChargeConsts';
import { OL } from '../../utils/consts/Colors';
import {
  FormSection,
  InputRow,
  InputGroup,
  InputLabel,
  PaddedRow,
  SubHeader
} from '../person/PersonFormTags';

const StyledFormSection = styled(FormSection)`
  border-bottom: ${props => (props.modal ? 'none' : `border-bottom: 1px solid ${OL.GREY11}`)};
`;

const StyledInputWithErrors = styled(StyledInput)`
  border: ${props => (props.invalid ? `1px solid ${OL.RED01}` : 'auto')};
`;

type Props = {
  statute :string,
  description :string,
  degree :string,
  degreeShort :string,
  disabled :boolean,
  isViolent :boolean,
  isStep2 :boolean,
  isStep4 :boolean,
  isBHE :boolean,
  isBRE :boolean,
  handleCheckboxChange :() => void,
  handleOnChangeInput :() => void,
}

class PersonContactInfo extends React.Component<Props, *> {

  renderInput = (name, value) => {
    const { handleOnChangeInput } = this.props;
    return (
      <StyledInputWithErrors
          name={name}
          value={value}
          onChange={handleOnChangeInput} />
    );
  }

  renderCheckboxInput = (
    name,
    checked
  ) => {
    const { disabled, handleCheckboxChange } = this.props;
    const label = this.formatBooleanLabel(checked);
    return (
      <CheckboxButton
          xSmall
          name={name}
          value={name}
          checked={checked}
          onChange={handleCheckboxChange}
          disabled={disabled}
          label={label} />
    );
  }

  formatBooleanLabel = boolean => (boolean ? 'Yes' : 'No');

  renderHeader = () => (
    <PaddedRow>
      <SubHeader>Charge</SubHeader>
    </PaddedRow>
  );

  render() {
    const {
      statute,
      description,
      degree,
      degreeShort,
      isViolent,
      isStep2,
      isStep4,
      isBHE,
      isBRE
    } = this.props;
    return (
      <StyledFormSection modal>
        { this.renderHeader() }

        <InputRow numColumns={3}>
          <InputGroup>
            <InputLabel>Statute</InputLabel>
            {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, statute) }
          </InputGroup>
          <InputGroup>
            <InputLabel>Degree</InputLabel>
            {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE, degree) }
          </InputGroup>
          <InputGroup>
            <InputLabel>Degree (Short)</InputLabel>
            {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL, degreeShort) }
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
            {this.renderCheckboxInput(CHARGE_HEADERS.VIOLENT, isViolent) }
          </InputGroup>
          <InputGroup>
            {this.renderCheckboxInput(CHARGE_HEADERS.STEP_2, isStep2) }
          </InputGroup>
          <InputGroup>
            {this.renderCheckboxInput(CHARGE_HEADERS.STEP_4, isStep4) }
          </InputGroup>
          <InputGroup>
            {this.renderCheckboxInput(CHARGE_HEADERS.BHE, isBHE) }
          </InputGroup>
          <InputGroup>
            {this.renderCheckboxInput(CHARGE_HEADERS.BRE, isBRE) }
          </InputGroup>
        </InputRow>
      </StyledFormSection>
    );
  }
}

export default PersonContactInfo;
