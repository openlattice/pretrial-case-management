/*
 * @flow
 */

import React, { Component } from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, CardSegment, Input } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/pro-light-svg-icons';

import { clearSubmittedContact, submitContact } from './ContactInfoActions';
import { phoneIsValid, emailIsValid, formatPhoneNumber } from '../../utils/ContactInfoUtils';
import { getReqState, requestIsPending, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { CONTACT_INFO_ACTIONS } from '../../utils/consts/redux/ContactInformationConsts';
import { CONTACT_METHODS } from '../../utils/consts/ContactInfoConsts';

const {
  CONTACT_INFO_GIVEN_ID,
  EMAIL,
  GENERAL_ID,
  IS_MOBILE,
  IS_PREFERRED,
  PHONE
} = PROPERTY_TYPES;

const AddNewContactSection = styled(CardSegment)`
  align-items: center;
  border-bottom: none;
  margin: 0 -30px;
  max-width: 672px;
  min-width: 572px;
`;

const AddNewContactElementsWrapper = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: 21px 1fr 157px;
  width: 100%;
`;

const StyledInputWithErrors = styled(Input)`
  :focus {
    border: ${(props) => (props.invalid ? `1px solid ${OL.RED01}` : ` 1px solid ${OL.PURPLE02}`)};
  }
`;

const PlusWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`;

type Props = {
  actions :{
    clearSubmittedContact :RequestSequence;
    submitContact :RequestSequence;
  };
  personEKID :UUID;
  submitContactReqState :RequestState;
}


type State = {
  contact :string;
  contactMethod :string;
  EMAIL :string;
  PHONE :string;
};

const INITIAL_STATE = {
  contact: '',
  contactMethod: '',
  [EMAIL]: '',
  [PHONE]: ''
};

class NewContactForm extends Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidUpdate() {
    const { actions, submitContactReqState } = this.props;
    const contactSubmitSuccess = requestIsSuccess(submitContactReqState);
    if (contactSubmitSuccess) {
      actions.clearSubmittedContact();
      this.clearInput();
    }
  }

  clearInput = () => {
    this.setState({ contact: '' });
  }

  contactIsValid = () => {
    const { state } = this;
    const { contact } = state;
    const phone = state[PHONE];
    const email = state[EMAIL];
    return (contact === '') || phone || email;
  }

  setContactData = (e :SyntheticEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    if (emailIsValid(value)) {
      this.setState({
        [EMAIL]: value,
        [PHONE]: '',
        contactMethod: CONTACT_METHODS.EMAIL
      });
    }
    else if (phoneIsValid(value)) {
      this.setState({
        [EMAIL]: '',
        [PHONE]: formatPhoneNumber(value),
        contactMethod: CONTACT_METHODS.PHONE
      });
    }
    this.setState({ [name]: value });
  }

  createNewContact = () => {
    const { state } = this;
    const { actions, personEKID } = this.props;

    const email = state[EMAIL];
    const phone = state[PHONE];

    let newContactFields;
    if (phone) {
      newContactFields = {
        [PHONE]: [phone],
        [GENERAL_ID]: [phone],
        [CONTACT_INFO_GIVEN_ID]: [phone],
        [IS_MOBILE]: [false],
        [IS_PREFERRED]: [false]
      };
    }
    else if (email) {
      newContactFields = {
        [EMAIL]: [email],
        [GENERAL_ID]: [email],
        [CONTACT_INFO_GIVEN_ID]: [email],
        [IS_PREFERRED]: [false]
      };
    }

    if (newContactFields && (email.length || phone.length)) {
      actions.submitContact({ contactEntity: newContactFields, personEKID });
    }
  }

  render() {
    const { submitContactReqState } = this.props;
    const { contact } = this.state;
    const submittingContactInfo = requestIsPending(submitContactReqState);
    return (
      <AddNewContactSection
          noBleed={false}
          padding="25px 30px 40px 30px">
        <AddNewContactElementsWrapper>
          <PlusWrapper>
            <FontAwesomeIcon color={OL.GREY03} icon={faPlus} size="2x" />
          </PlusWrapper>
          <StyledInputWithErrors
              disabled={submittingContactInfo}
              invalid={!this.contactIsValid()}
              name="contact"
              onChange={this.setContactData}
              value={contact} />
          <Button
              disabled={submittingContactInfo}
              isLoading={submittingContactInfo}
              onClick={this.createNewContact}>
            Add New Contact
          </Button>
        </AddNewContactElementsWrapper>
      </AddNewContactSection>
    );
  }
}

function mapStateToProps(state) {
  const contactInfo = state.get(STATE.CONTACT_INFO);
  return {
    submitContactReqState: getReqState(contactInfo, CONTACT_INFO_ACTIONS.SUBMIT_CONTACT),
  };
}


const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    clearSubmittedContact,
    submitContact
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(NewContactForm);
