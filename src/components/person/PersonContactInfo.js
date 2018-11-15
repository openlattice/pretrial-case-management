/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import Checkbox from '../controls/StyledCheckbox';
import StyledInput from '../controls/StyledInput';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import {
  FormSection,
  InputRow,
  InputGroup,
  InputLabel,
  PaddedRow,
  SubRow,
  SubHeader
} from './PersonFormTags';

const StyledFormSection = styled(FormSection)`
  border-bottom: ${props => (props.noBorder ? 'none' : `border-bottom: 1px solid ${OL.GREY11}`)};
`;

const StyledInputWithErrors = styled(StyledInput)`
  border: ${props => (props.invalid ? `1px solid ${OL.RED01}` : 'auto')};
`;

const InputLabelWithWarning = styled(InputLabel)`
  color: ${props => (props.invalid ? OL.RED01 : OL.GREY15)};
`;

type Props = {
  email :string,
  emailIsValid :boolean,
  handleCheckboxChange :() => void,
  handleOnChangeInput :() => void,
  isMobile :boolean,
  noBorder :boolean,
  phone :string,
  phoneIsValid :boolean,
}

class PersonContactInfo extends React.Component<Props, *> {

  renderPhoneInput = () => {
    const { phone, handleOnChangeInput, phoneIsValid } = this.props;
    return (
      <StyledInputWithErrors
          invalid={phoneIsValid}
          type="tel"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          name={PROPERTY_TYPES.PHONE}
          value={phone}
          onChange={handleOnChangeInput} />
    );
  }
  renderEmailInput = () => {
    const { email, handleOnChangeInput, emailIsValid } = this.props;
    return (
      <StyledInputWithErrors
          invalid={emailIsValid}
          type="email"
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
          name={PROPERTY_TYPES.EMAIL}
          value={email}
          onChange={handleOnChangeInput} />
    );
  }

  render() {
    const {
      emailIsValid,
      handleCheckboxChange,
      isMobile,
      noBorder,
      phoneIsValid,
    } = this.props;
    return (
      <StyledFormSection noBorder={noBorder}>
        <PaddedRow>
          <SubHeader>Contact Information</SubHeader>
        </PaddedRow>

        <InputRow numColumns={2}>
          <InputGroup>
            <InputLabelWithWarning invalid={emailIsValid}>Email</InputLabelWithWarning>
            {this.renderEmailInput()}
          </InputGroup>
          <SubRow>
            <InputGroup>
              <InputLabelWithWarning invalid={phoneIsValid}>Phone</InputLabelWithWarning>
              {this.renderPhoneInput()}
            </InputGroup>
            <Checkbox
                value=""
                name="mobileCheckBox"
                label="Mobile?"
                checked={isMobile}
                onChange={handleCheckboxChange} />
          </SubRow>
        </InputRow>
      </StyledFormSection>
    );
  }
}

export default PersonContactInfo;
