/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { FormGroup, ControlLabel, FormControl, Col } from 'react-bootstrap';

import { Header } from '../SectionView';
import StyledButton from '../buttons/StyledButton';
import ExpandableText from '../controls/ExpandableText';
import Radio from '../controls/StyledRadio';

import {
  getViolentCharges,
  getPendingCharges,
  getPreviousMisdemeanors,
  getPreviousFelonies,
  getPreviousViolentCharges
} from '../../utils/AutofillUtils';
import { getSentenceToIncarcerationCaseNums } from '../../utils/consts/SentenceConsts';
import { CONTEXT, getAllStepTwoCharges, getAllStepFourCharges } from '../../utils/consts/DMFConsts';

import {
  PaddedRow,
  UnpaddedRow,
  TitleLabel,
  SubmitButtonWrapper,
  SubmitButton,
  ErrorMessage,
  Divider
} from '../../utils/Layout';

import { formatValue } from '../../utils/Utils';

import { PSA, NOTES, DMF } from '../../utils/consts/Consts';
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
  PRIOR_SENTENCE_TO_INCARCERATION_PROMPT,
  EXTRADITED_PROMPT,
  STEP_2_CHARGES_PROMPT,
  STEP_4_CHARGES_PROMPT,
  COURT_OR_BOOKING_PROMPT
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

const {
  EXTRADITED,
  STEP_2_CHARGES,
  STEP_4_CHARGES,
  COURT_OR_BOOKING
} = DMF;

const StyledSectionView = styled.div`
  padding: 30px 0;
`;

const StyledFormWrapper = styled.div`
  margin: 0 60px 0 60px;
`;

const QuestionRow = styled(PaddedRow)`
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
`;

const LastQuestionRow = styled(QuestionRow)`
  border-bottom: 1px solid #bbb;
`;

const PSACol = styled(Col)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const NotesCol = styled(Col)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const NoteContainer = styled(UnpaddedRow)`
  flex-direction: column;
`;

const PaddedExpandableText = styled(ExpandableText)`
  margin: 5px 0 10px 0;
`;

const NotesLabel = styled(ControlLabel)`
  margin-top: -10px;
`;

const JustificationLabel = styled(ControlLabel)`
  margin-top: 10px;
`;

type Props = {
  handleInputChange :(event :Object) => void,
  input :Immutable.Map<*, *>,
  handleSubmit :(event :Object) => void,
  incompleteError :boolean,
  currCharges :Immutable.List<*>,
  currCase :Immutable.Map<*, *>,
  allCharges :Immutable.List<*>,
  allSentences :Immutable.List<*>,
  allCases :Immutable.List<*>,
  viewOnly? :boolean
};

const PSAInputForm = ({
  handleInputChange,
  input,
  handleSubmit,
  incompleteError,
  currCharges,
  currCase,
  allCharges,
  allSentences,
  allCases,
  viewOnly
} :Props) => {

  const noPriorConvictions = input.get(PRIOR_MISDEMEANOR) === 'false' && input.get(PRIOR_FELONY) === 'false';

  const renderRadio = (name, value, label, disabledField) => (
    <Radio
        name={name}
        value={`${value}`}
        checked={input.get(name) === `${value}`}
        onChange={handleInputChange}
        disabled={viewOnly || (disabledField && disabledField !== undefined)}
        label={label} />
  );

  const renderTrueFalseRadio = (name, header, disabledField) => (
    <PSACol lg={6}>
      <TitleLabel>{header}</TitleLabel>
      <FormGroup>
        {renderRadio(name, false, 'No', disabledField)}
        {renderRadio(name, true, 'Yes', disabledField)}
      </FormGroup>
    </PSACol>
  );

  const renderNotesAndJustifications = (name, autofillJustifications) => {
    let justifications = null;
    if (autofillJustifications) {
      const justificationText = autofillJustifications.size
        ? formatValue(autofillJustifications) : 'No matching charges.';
      justifications = (
        <NoteContainer>
          <JustificationLabel>Autofill Justification</JustificationLabel>
          <PaddedExpandableText text={justificationText} maxLength={250} />
        </NoteContainer>
      );
    }
    return (
      <NotesCol lg={6}>
        <NoteContainer>
          <NotesLabel>Notes</NotesLabel>
          <FormControl
              type="text"
              name={name}
              value={input.get(name)}
              onChange={handleInputChange}
              disabled={viewOnly} />
        </NoteContainer>
        {justifications}
      </NotesCol>
    );
  };

  const currCaseNum = currCase.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
  const arrestDate = currCase.getIn([PROPERTY_TYPES.FILE_DATE, 0], currCase.getIn([PROPERTY_TYPES.FILE_DATE, 0], ''));
  const mostSeriousCharge = currCase.getIn([PROPERTY_TYPES.MOST_SERIOUS_CHARGE_NO, 0], '');

  const currentViolentCharges = getViolentCharges(currCharges, mostSeriousCharge);
  const pendingCharges = getPendingCharges(currCaseNum, arrestDate, allCases, allCharges);
  const priorMisdemeanors = getPreviousMisdemeanors(allCharges);
  const priorFelonies = getPreviousFelonies(allCharges);
  const priorViolentConvictions = getPreviousViolentCharges(allCharges);
  const priorSentenceToIncarceration = getSentenceToIncarcerationCaseNums(allSentences);

  const step2Charges = getAllStepTwoCharges(currCharges);
  const step4Charges = getAllStepFourCharges(currCharges);

  return (
    <div>
      <Divider />
      <StyledFormWrapper>
        <form onSubmit={handleSubmit}>
          <StyledSectionView>
            <Header>PSA Information</Header>

            <QuestionRow>
              <PSACol lg={6}>
                <TitleLabel>{CURRENT_AGE_PROMPT}</TitleLabel>
                <FormGroup>
                  {renderRadio(AGE_AT_CURRENT_ARREST, 0, '20 or younger')}
                  {renderRadio(AGE_AT_CURRENT_ARREST, 1, '21 or 22')}
                  {renderRadio(AGE_AT_CURRENT_ARREST, 2, '23 or older')}
                </FormGroup>
              </PSACol>
              {renderNotesAndJustifications(NOTES[AGE_AT_CURRENT_ARREST])}
            </QuestionRow>

            <QuestionRow>
              {renderTrueFalseRadio(CURRENT_VIOLENT_OFFENSE, CURRENT_VIOLENT_OFFENSE_PROMPT)}
              {renderNotesAndJustifications(NOTES[CURRENT_VIOLENT_OFFENSE], currentViolentCharges)}
            </QuestionRow>

            <QuestionRow>
              {renderTrueFalseRadio(PENDING_CHARGE, PENDING_CHARGE_PROMPT)}
              {renderNotesAndJustifications(NOTES[PENDING_CHARGE], pendingCharges)}
            </QuestionRow>

            <QuestionRow>
              {renderTrueFalseRadio(PRIOR_MISDEMEANOR, PRIOR_MISDEMEANOR_PROMPT)}
              {renderNotesAndJustifications(NOTES[PRIOR_MISDEMEANOR], priorMisdemeanors)}
            </QuestionRow>

            <QuestionRow>
              {renderTrueFalseRadio(PRIOR_FELONY, PRIOR_FELONY_PROMPT)}
              {renderNotesAndJustifications(NOTES[PRIOR_FELONY], priorFelonies)}
            </QuestionRow>

            <QuestionRow>
              <PSACol lg={6}>
                <TitleLabel>{PRIOR_VIOLENT_CONVICTION_PROMPT}</TitleLabel>
                <FormGroup>
                  {renderRadio(PRIOR_VIOLENT_CONVICTION, 0, '0', noPriorConvictions)}
                  {renderRadio(PRIOR_VIOLENT_CONVICTION, 1, '1', noPriorConvictions)}
                  {renderRadio(PRIOR_VIOLENT_CONVICTION, 2, '2', noPriorConvictions)}
                  {renderRadio(PRIOR_VIOLENT_CONVICTION, 3, '3 or more', noPriorConvictions)}
                </FormGroup>
              </PSACol>
              {renderNotesAndJustifications(NOTES[PRIOR_VIOLENT_CONVICTION], priorViolentConvictions)}
            </QuestionRow>

            <QuestionRow>
              <PSACol lg={6}>
                <TitleLabel>{PRIOR_FAILURE_TO_APPEAR_RECENT_PROMPT}</TitleLabel>
                <FormGroup>
                  {renderRadio(PRIOR_FAILURE_TO_APPEAR_RECENT, 0, '0')}
                  {renderRadio(PRIOR_FAILURE_TO_APPEAR_RECENT, 1, '1')}
                  {renderRadio(PRIOR_FAILURE_TO_APPEAR_RECENT, 2, '2 or more')}
                </FormGroup>
              </PSACol>
              {renderNotesAndJustifications(NOTES[PRIOR_FAILURE_TO_APPEAR_RECENT])}
            </QuestionRow>

            <QuestionRow>
              {renderTrueFalseRadio(PRIOR_FAILURE_TO_APPEAR_OLD, PRIOR_FAILURE_TO_APPEAR_OLD_PROMPT)}
              {renderNotesAndJustifications(NOTES[PRIOR_FAILURE_TO_APPEAR_OLD])}
            </QuestionRow>

            <LastQuestionRow>
              {renderTrueFalseRadio(
                PRIOR_SENTENCE_TO_INCARCERATION,
                PRIOR_SENTENCE_TO_INCARCERATION_PROMPT,
                noPriorConvictions
              )}
              {renderNotesAndJustifications(NOTES[PRIOR_SENTENCE_TO_INCARCERATION], priorSentenceToIncarceration)}
            </LastQuestionRow>

            <Header>DMF Information</Header>

            <QuestionRow>
              {renderTrueFalseRadio(EXTRADITED, EXTRADITED_PROMPT)}
              {renderNotesAndJustifications(NOTES[EXTRADITED])}
            </QuestionRow>

            <QuestionRow>
              {renderTrueFalseRadio(STEP_2_CHARGES, STEP_2_CHARGES_PROMPT)}
              {renderNotesAndJustifications(NOTES[STEP_2_CHARGES], step2Charges)}
            </QuestionRow>

            <QuestionRow>
              {renderTrueFalseRadio(STEP_4_CHARGES, STEP_4_CHARGES_PROMPT)}
              {renderNotesAndJustifications(NOTES[STEP_4_CHARGES], step4Charges)}
            </QuestionRow>

            <QuestionRow>
              <PSACol lg={6}>
                <TitleLabel>{COURT_OR_BOOKING_PROMPT}</TitleLabel>
                <FormGroup>
                  {renderRadio(COURT_OR_BOOKING, CONTEXT.BOOKING, CONTEXT.BOOKING)}
                  {renderRadio(COURT_OR_BOOKING, CONTEXT.COURT, CONTEXT.COURT)}
                </FormGroup>
              </PSACol>
            </QuestionRow>

            {
              incompleteError ? <ErrorMessage>All fields must be filled out.</ErrorMessage> : null
            }

          </StyledSectionView>
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
