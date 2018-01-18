/*
 * @flow
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormGroup, Col } from 'react-bootstrap';

import SectionView from '../SectionView';
import Radio from '../controls/StyledRadio';

import {
  PaddedRow,
  UnpaddedRow,
  FormWrapper,
  TitleLabel,
  SubmitButtonWrapper,
  SubmitButton,
  ErrorMessage,
  Divider
} from '../../utils/Layout';

import {
  CURRENT_AGE_PROMPT,
  CURRENT_VIOLENT_OFFENSE_PROMPT,
  PENDING_CHARGE_PROMPT,
  PRIOR_MISDEMEANOR_PROMPT,
  PRIOR_FELONY_PROMPT,
  PRIOR_VIOLENT_CONVICTION_PROMPT,
  PRIOR_FAILURE_TO_APPEAR_RECENT_PROMPT,
  PRIOR_FAILURE_TO_APPEAR_OLD_PROMPT,
  PRIOR_SENTENCE_TO_INCARCERATION_PROMPT
} from '../../utils/consts/FormPromptConsts';

const PSAInputForm = ({ section, handleSingleSelection, input, handleSubmit, incompleteError }) => {

  const noPriorConvictions = input.priorMisdemeanor === 'false' && input.priorFelony === 'false';

  const renderHeader = (header) => {
    return (
      <Col lg={4}>
        <TitleLabel>{header}</TitleLabel>
      </Col>
    );
  }

  const renderHeaders = (header1, header2, header3) => {
    return (
      <UnpaddedRow>
        {renderHeader(header1)}
        {renderHeader(header2)}
        {renderHeader(header3)}
      </UnpaddedRow>
    )
  }

  const renderRadio = (name, value, label, disabledField) => {
    return (
      <Radio
          dataSection={section}
          name={name}
          value={`${value}`}
          checked={input[name] === `${value}`}
          onChange={handleSingleSelection}
          disabled={disabledField && disabledField !== undefined}
          label={label} />
    );
  }

  const renderTrueFalseRadio = (name, disabledField) => {
    return (
      <Col lg={4}>
        <FormGroup>
          {renderRadio(name, false, 'No', disabledField)}
          {renderRadio(name, true, 'Yes', disabledField)}
        </FormGroup>
      </Col>
    );
  };

  return (
    <div>
      <Divider />
      <FormWrapper>
        <form onSubmit={handleSubmit}>
          <SectionView header="PSA Information">

            {renderHeaders(CURRENT_AGE_PROMPT, CURRENT_VIOLENT_OFFENSE_PROMPT, PENDING_CHARGE_PROMPT)}

            <PaddedRow>
              <Col lg={4}>
                <FormGroup>
                  {renderRadio('ageAtCurrentArrest', 0, '20 or younger')}
                  {renderRadio('ageAtCurrentArrest', 1, '21 or 22')}
                  {renderRadio('ageAtCurrentArrest', 2, '23 or older')}
                </FormGroup>
              </Col>

              {renderTrueFalseRadio('currentViolentOffense')}

              {renderTrueFalseRadio('pendingCharge')}

            </PaddedRow>

            {renderHeaders(PRIOR_MISDEMEANOR_PROMPT, PRIOR_FELONY_PROMPT, PRIOR_VIOLENT_CONVICTION_PROMPT)}

            <PaddedRow>

              {renderTrueFalseRadio('priorMisdemeanor')}

              {renderTrueFalseRadio('priorFelony')}

              <Col lg={4}>
                <FormGroup>
                  {renderRadio('priorViolentConviction', 0, '0', noPriorConvictions)}
                  {renderRadio('priorViolentConviction', 1, '1', noPriorConvictions)}
                  {renderRadio('priorViolentConviction', 2, '2', noPriorConvictions)}
                  {renderRadio('priorViolentConviction', 3, '3 or more', noPriorConvictions)}
                </FormGroup>
              </Col>

            </PaddedRow>

            {renderHeaders(
              PRIOR_FAILURE_TO_APPEAR_RECENT_PROMPT,
              PRIOR_FAILURE_TO_APPEAR_OLD_PROMPT,
              PRIOR_SENTENCE_TO_INCARCERATION_PROMPT
            )}


            <PaddedRow>
              <Col lg={4}>
                <FormGroup>
                  {renderRadio('priorFailureToAppearRecent', 0, '0')}
                  {renderRadio('priorFailureToAppearRecent', 1, '1')}
                  {renderRadio('priorFailureToAppearRecent', 2, '2 or more')}
                </FormGroup>
              </Col>

              {renderTrueFalseRadio('priorFailureToAppearOld')}

              {renderTrueFalseRadio('priorSentenceToIncarceration', noPriorConvictions)}

            </PaddedRow>
            {
              incompleteError ? <ErrorMessage>All fields must be filled out.</ErrorMessage> : null
            }

          </SectionView>
          <SubmitButtonWrapper>
            <SubmitButton type="submit" bsStyle="primary" bsSize="lg">Score & Submit</SubmitButton>
          </SubmitButtonWrapper>
        </form>
      </FormWrapper>
    </div>
  );
};

PSAInputForm.propTypes = {
  section: PropTypes.string.isRequired,
  handleSingleSelection: PropTypes.func.isRequired,
  input: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  incompleteError: PropTypes.bool.isRequired
};

export default PSAInputForm;
