/*
 * @flow
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, Col } from 'react-bootstrap';
import DatePicker from 'react-bootstrap-date-picker';

import SectionView from '../SectionView';

import { PaddedRow, FormWrapper, TitleLabel, SubmitButtonWrapper, SubmitButton } from '../../utils/Layout';

const PersonFormView = ({
  section, handleTextInput, handleDateInput, input, handleSubmit
}) => (
  <FormWrapper>
    <form onSubmit={handleSubmit}>
      <SectionView header="Person Information">
        <PaddedRow>
          <Col lg={3}>
            <TitleLabel>Last Name</TitleLabel>
            <FormControl data-section={section} name="lastName" value={input.lastName} onChange={handleTextInput} />
          </Col>
          <Col lg={3}>
            <TitleLabel>First Name</TitleLabel>
            <FormControl data-section={section} name="firstName" value={input.firstName} onChange={handleTextInput} />
          </Col>
          <Col lg={3}>
            <TitleLabel>Middle Name</TitleLabel>
            <FormControl
                data-section={section}
                name="middleName"
                value={input.middleName}
                onChange={handleTextInput} />
          </Col>
          <Col lg={3}>
            <TitleLabel>Person ID</TitleLabel>
            <FormControl data-section={section} name="id" value={input.id} onChange={handleTextInput} />
          </Col>
        </PaddedRow>

        <PaddedRow>
          <Col lg={3}>
            <TitleLabel>Date of Birth</TitleLabel>
            <DatePicker
                value={input.dob}
                onChange={(e) => {
                  handleDateInput(e, section, 'dob');
                }} />
          </Col>
          <Col lg={3}>
            <TitleLabel>Sex</TitleLabel>
            <FormControl data-section={section} name="sex" value={input.sex} onChange={handleTextInput} />
          </Col>
          <Col lg={3}>
            <TitleLabel>Race</TitleLabel>
            <FormControl data-section={section} name="race" value={input.race} onChange={handleTextInput} />
          </Col>
          <Col lg={3}>
            <TitleLabel>Ethnicity</TitleLabel>
            <FormControl data-section={section} name="ethnicity" value={input.ethnicity} onChange={handleTextInput} />
          </Col>
        </PaddedRow>
      </SectionView>
      <SubmitButtonWrapper>
        <SubmitButton type="submit" bsStyle="primary" bsSize="lg">Search</SubmitButton>
      </SubmitButtonWrapper>
    </form>
  </FormWrapper>
);

PersonFormView.propTypes = {
  handleTextInput: PropTypes.func.isRequired,
  handleDateInput: PropTypes.func.isRequired,
  input: PropTypes.object.isRequired,
  section: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired
};

export default PersonFormView;
