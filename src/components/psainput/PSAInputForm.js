/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { FormGroup, Col } from 'react-bootstrap';

import SectionView from '../SectionView';
import Radio from '../controls/StyledRadio';

import {
  getViolentCharges,
  getPendingCharges,
  getPreviousMisdemeanors,
  getPreviousFelonies,
  getPreviousViolentCharges
} from '../../utils/AutofillUtils';

import {
  PaddedRow,
  TitleLabel,
  SubmitButtonWrapper,
  SubmitButton,
  ErrorMessage,
  Divider
} from '../../utils/Layout';

import { formatValue } from '../../utils/Utils';

import { PSA } from '../../utils/consts/Consts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
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

const StyledFormWrapper = styled.div`
  margin: 0 60px 0 60px;
`;

const PSACol = styled(Col)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const JustificationTitle = styled.div`
  font-size: 16px;
  margin: 10px 0;
  font-style: italic;
  padding-top: 10px;
  border-top: 1px solid #ddd
`;

const FootnoteNumber = styled.span`
  font-weight: bold;
  font-size: 14px;
`;

const NoResultsText = styled.span`
  font-style: italic;
  color: #777;
`;

type Props = {
  handleSingleSelection :(event :Object) => void,
  input :Immutable.Map<*, *>,
  handleSubmit :(event :Object) => void,
  incompleteError :boolean,
  currCharges :Immutable.List<*>,
  currCase :Immutable.Map<*, *>,
  allCharges :Immutable.List<*>,
  allCases :Immutable.List<*>,
  viewOnly? :boolean
};

const PSAInputForm = ({
  handleSingleSelection,
  input,
  handleSubmit,
  incompleteError,
  isReview,
  currCharges,
  currCase,
  allCharges,
  allCases,
  viewOnly
} :Props) => {

  const noPriorConvictions = input.get(PRIOR_MISDEMEANOR) === 'false' && input.get(PRIOR_FELONY) === 'false';

  const renderItem = (valueList) => {
    if (!valueList.size) return <NoResultsText>No matching charges found in Odyssey</NoResultsText>;
    return <span>{formatValue(valueList)}</span>;
  };

  const renderAutofillJustifications = () => {
    const currCaseNum = currCase.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
    const arrestDate = currCase.getIn([PROPERTY_TYPES.FILE_DATE, 0], currCase.getIn([PROPERTY_TYPES.FILE_DATE, 0], ''));
    const mostSeriousCharge = currCase.getIn([PROPERTY_TYPES.MOST_SERIOUS_CHARGE_NO, 0], '');

    const currentViolentCharges = getViolentCharges(currCharges, mostSeriousCharge);
    const pendingCharges = getPendingCharges(currCaseNum, arrestDate, allCases, allCharges);
    const priorMisdemeanors = getPreviousMisdemeanors(allCharges);
    const priorFelonies = getPreviousFelonies(allCharges);
    const priorViolentConvictions = getPreviousViolentCharges(allCharges);

    return (
      <div>
        <JustificationTitle>Autofill Logic</JustificationTitle>
        <div>
          <FootnoteNumber>2: </FootnoteNumber>
          <span>{renderItem(currentViolentCharges)}</span>
        </div>
        <div>
          <FootnoteNumber>3: </FootnoteNumber>
          <span>{renderItem(pendingCharges)}</span>
        </div>
        <div>
          <FootnoteNumber>4: </FootnoteNumber>
          <span>{renderItem(priorMisdemeanors)}</span>
        </div>
        <div>
          <FootnoteNumber>5: </FootnoteNumber>
          <span>{renderItem(priorFelonies)}</span>
        </div>
        <div>
          <FootnoteNumber>6: </FootnoteNumber>
          <span>{renderItem(priorViolentConvictions)}</span>
        </div>
      </div>
    );
  };

  const renderRadio = (name, value, label, disabledField) => (
    <Radio
        name={name}
        value={`${value}`}
        checked={input.get(name) === `${value}`}
        onChange={handleSingleSelection}
        disabled={viewOnly || (disabledField && disabledField !== undefined)}
        label={label} />
  );

  const renderTrueFalseRadio = (name, header, disabledField) => (
    <PSACol lg={4}>
      <TitleLabel>{header}</TitleLabel>
      <FormGroup>
        {renderRadio(name, false, 'No', disabledField)}
        {renderRadio(name, true, 'Yes', disabledField)}
      </FormGroup>
    </PSACol>
  );

  return (
    <div>
      <Divider />
      <StyledFormWrapper>
        <form onSubmit={handleSubmit}>
          <SectionView header="PSA Information">

            <PaddedRow>
              <PSACol lg={4}>
                <TitleLabel>{CURRENT_AGE_PROMPT}</TitleLabel>
                <FormGroup>
                  {renderRadio(AGE_AT_CURRENT_ARREST, 0, '20 or younger')}
                  {renderRadio(AGE_AT_CURRENT_ARREST, 1, '21 or 22')}
                  {renderRadio(AGE_AT_CURRENT_ARREST, 2, '23 or older')}
                </FormGroup>
              </PSACol>

              {renderTrueFalseRadio(CURRENT_VIOLENT_OFFENSE, CURRENT_VIOLENT_OFFENSE_PROMPT)}

              {renderTrueFalseRadio(PENDING_CHARGE, PENDING_CHARGE_PROMPT)}

            </PaddedRow>

            <PaddedRow>

              {renderTrueFalseRadio(PRIOR_MISDEMEANOR, PRIOR_MISDEMEANOR_PROMPT)}

              {renderTrueFalseRadio(PRIOR_FELONY, PRIOR_FELONY_PROMPT)}

              <PSACol lg={4}>
                <TitleLabel>{PRIOR_VIOLENT_CONVICTION_PROMPT}</TitleLabel>
                <FormGroup>
                  {renderRadio(PRIOR_VIOLENT_CONVICTION, 0, '0', noPriorConvictions)}
                  {renderRadio(PRIOR_VIOLENT_CONVICTION, 1, '1', noPriorConvictions)}
                  {renderRadio(PRIOR_VIOLENT_CONVICTION, 2, '2', noPriorConvictions)}
                  {renderRadio(PRIOR_VIOLENT_CONVICTION, 3, '3 or more', noPriorConvictions)}
                </FormGroup>
              </PSACol>

            </PaddedRow>

            <PaddedRow>
              <PSACol lg={4}>
                <TitleLabel>{PRIOR_FAILURE_TO_APPEAR_RECENT_PROMPT}</TitleLabel>
                <FormGroup>
                  {renderRadio(PRIOR_FAILURE_TO_APPEAR_RECENT, 0, '0')}
                  {renderRadio(PRIOR_FAILURE_TO_APPEAR_RECENT, 1, '1')}
                  {renderRadio(PRIOR_FAILURE_TO_APPEAR_RECENT, 2, '2 or more')}
                </FormGroup>
              </PSACol>

              {renderTrueFalseRadio(PRIOR_FAILURE_TO_APPEAR_OLD, PRIOR_FAILURE_TO_APPEAR_OLD_PROMPT)}

              {renderTrueFalseRadio(
                PRIOR_SENTENCE_TO_INCARCERATION,
                PRIOR_SENTENCE_TO_INCARCERATION_PROMPT,
                noPriorConvictions
              )}

            </PaddedRow>

            {
              isReview ? null : renderAutofillJustifications()
            }

            {
              incompleteError ? <ErrorMessage>All fields must be filled out.</ErrorMessage> : null
            }

          </SectionView>
          {
            viewOnly ? null : (
              <SubmitButtonWrapper>
                <SubmitButton type="submit" bsStyle="primary" bsSize="lg">Score & Submit</SubmitButton>
              </SubmitButtonWrapper>
            )
          }
        </form>
      </StyledFormWrapper>
    </div>
  );
};

PSAInputForm.defaultProps = {
  viewOnly: false
};

export default PSAInputForm;
