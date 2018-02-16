/*
 * @flow
 */

import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
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

import { PSA } from '../../utils/consts/Consts';
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

const {
  AGE_AT_CURRENT_ARREST,
  CURRENT_VIOLENT_OFFENSE,
  PENDING_CHARGE,
  PRIOR_MISDEMEANOR,
  PRIOR_FELONY,
  PRIOR_VIOLENT_CONVICTION,
  PRIOR_FAILURE_TO_APPEAR_RECENT,
  PRIOR_FAILURE_TO_APPEAR_OLD,
  PRIOR_SENTENCE_TO_INCARCERATION
} = PSA;

const PSAInputForm = ({
  handleSingleSelection,
  input,
  handleSubmit,
  incompleteError
}) => {

  const noPriorConvictions = input.get(PRIOR_MISDEMEANOR) === 'false' && input.get(PRIOR_FELONY) === 'false';

  const renderHeader = header => (
    <Col lg={4}>
      <TitleLabel>{header}</TitleLabel>
    </Col>
  );

  const renderHeaders = (header1, header2, header3) => (
    <UnpaddedRow>
      {renderHeader(header1)}
      {renderHeader(header2)}
      {renderHeader(header3)}
    </UnpaddedRow>
  );

  const renderRadio = (name, value, label, disabledField) => (
    <Radio
        name={name}
        value={`${value}`}
        checked={input.get(name) === `${value}`}
        onChange={handleSingleSelection}
        disabled={disabledField && disabledField !== undefined}
        label={label} />
  );

  const renderTrueFalseRadio = (name, disabledField) => (
    <Col lg={4}>
      <FormGroup>
        {renderRadio(name, false, 'No', disabledField)}
        {renderRadio(name, true, 'Yes', disabledField)}
      </FormGroup>
    </Col>
  );

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
                  {renderRadio(AGE_AT_CURRENT_ARREST, 0, '20 or younger')}
                  {renderRadio(AGE_AT_CURRENT_ARREST, 1, '21 or 22')}
                  {renderRadio(AGE_AT_CURRENT_ARREST, 2, '23 or older')}
                </FormGroup>
              </Col>

              {renderTrueFalseRadio(CURRENT_VIOLENT_OFFENSE)}

              {renderTrueFalseRadio(PENDING_CHARGE)}

            </PaddedRow>

            {renderHeaders(PRIOR_MISDEMEANOR_PROMPT, PRIOR_FELONY_PROMPT, PRIOR_VIOLENT_CONVICTION_PROMPT)}

            <PaddedRow>

              {renderTrueFalseRadio(PRIOR_MISDEMEANOR)}

              {renderTrueFalseRadio(PRIOR_FELONY)}

              <Col lg={4}>
                <FormGroup>
                  {renderRadio(PRIOR_VIOLENT_CONVICTION, 0, '0', noPriorConvictions)}
                  {renderRadio(PRIOR_VIOLENT_CONVICTION, 1, '1', noPriorConvictions)}
                  {renderRadio(PRIOR_VIOLENT_CONVICTION, 2, '2', noPriorConvictions)}
                  {renderRadio(PRIOR_VIOLENT_CONVICTION, 3, '3 or more', noPriorConvictions)}
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
                  {renderRadio(PRIOR_FAILURE_TO_APPEAR_RECENT, 0, '0')}
                  {renderRadio(PRIOR_FAILURE_TO_APPEAR_RECENT, 1, '1')}
                  {renderRadio(PRIOR_FAILURE_TO_APPEAR_RECENT, 2, '2 or more')}
                </FormGroup>
              </Col>

              {renderTrueFalseRadio(PRIOR_FAILURE_TO_APPEAR_OLD)}

              {renderTrueFalseRadio(PRIOR_SENTENCE_TO_INCARCERATION, noPriorConvictions)}

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
  handleSingleSelection: PropTypes.func.isRequired,
  input: PropTypes.instanceOf(Immutable.Map).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  incompleteError: PropTypes.bool.isRequired
};

export default PSAInputForm;
