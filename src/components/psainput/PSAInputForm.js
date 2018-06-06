/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { FormGroup, ControlLabel, FormControl, Col } from 'react-bootstrap';

import { Header } from '../SectionView';
import StyledCheckbox from '../controls/StyledCheckbox';
import ExpandableText from '../controls/ExpandableText';
import Radio from '../controls/StyledRadio';

import {
  getPendingCharges,
  getPreviousMisdemeanors,
  getPreviousFelonies,
  getPreviousViolentCharges
} from '../../utils/AutofillUtils';
import { getSentenceToIncarcerationCaseNums } from '../../utils/consts/SentenceConsts';
import {
  getAllViolentCharges,
  getAllStepTwoCharges,
  getAllStepFourCharges
} from '../../utils/consts/ArrestChargeConsts';

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
import { getRecentFTAs, getOldFTAs } from '../../utils/FTAUtils';

import { CONTEXT, DMF, NOTES, PSA } from '../../utils/consts/Consts';
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
  COURT_OR_BOOKING_PROMPT,
  SECONDARY_RELEASE_CHARGES_PROMPT
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
  COURT_OR_BOOKING,
  SECONDARY_RELEASE_CHARGES
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

const SubmitContainer = styled(SubmitButtonWrapper)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CheckboxContainer = styled.div`
  display: inline-block;
  margin: -50px 0 15px 0;
`;

type Props = {
  handleInputChange :(event :Object) => void,
  input :Immutable.Map<*, *>,
  handleSubmit :(event :Object) => void,
  currCharges :Immutable.List<*>,
  currCase :Immutable.Map<*, *>,
  allCharges :Immutable.List<*>,
  allSentences :Immutable.List<*>,
  allCases :Immutable.List<*>,
  allFTAs :Immutable.List<*>,
  viewOnly? :boolean
};

type State = {
  iiiChecked :boolean,
  incomplete :boolean
};

export default class PSAInputForm extends React.Component<Props, State> {

  static defaultProps = {
    viewOnly: false
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      iiiChecked: false,
      incomplete: false
    };
  }

  renderNotesAndJustifications = (name, autofillJustifications) => {
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
              value={this.props.input.get(name)}
              onChange={this.props.handleInputChange}
              disabled={this.props.viewOnly} />
        </NoteContainer>
        {justifications}
      </NotesCol>
    );
  };

  renderRadio = (name, value, label, disabledField) => (
    <Radio
        name={name}
        value={`${value}`}
        checked={this.props.input.get(name) === `${value}`}
        onChange={this.props.handleInputChange}
        disabled={this.props.viewOnly || (disabledField && disabledField !== undefined)}
        label={label} />
  );

  renderTrueFalseRadio = (name, header, disabledField) => (
    <PSACol lg={6}>
      <TitleLabel>{header}</TitleLabel>
      <FormGroup>
        {this.renderRadio(name, false, 'No', disabledField)}
        {this.renderRadio(name, true, 'Yes', disabledField)}
      </FormGroup>
    </PSACol>
  );

  handleCheckboxChange = (event) => {
    this.setState({ iiiChecked: event.target.checked });
  }

  invalidValue = (val :string) => val === null || val === undefined || val === 'null' || val === 'undefined';

  handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = (this.props.input.get(DMF.COURT_OR_BOOKING) === CONTEXT.BOOKING)
      ? this.props.input : this.props.input.remove(DMF.SECONDARY_RELEASE_CHARGES);

    if (requiredFields.valueSeq().filter(this.invalidValue).toList().size) {
      this.setState({ incomplete: true });
    }
    else {
      this.props.handleSubmit(e);
      this.setState({ incomplete: false });
    }
  }

  render() {
    const {
      input,
      currCharges,
      currCase,
      allCharges,
      allSentences,
      allCases,
      allFTAs,
      viewOnly
    } = this.props;

    const noPriorConvictions = input.get(PRIOR_MISDEMEANOR) === 'false' && input.get(PRIOR_FELONY) === 'false';

    const currCaseNum = currCase.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
    const arrestDate = currCase.getIn([PROPERTY_TYPES.ARREST_DATE_TIME, 0],
      currCase.getIn([PROPERTY_TYPES.ARREST_DATE, 0],
        currCase.getIn([PROPERTY_TYPES.FILE_DATE, 0], '')));

    const currentViolentCharges = getAllViolentCharges(currCharges);
    const pendingCharges = getPendingCharges(currCaseNum, arrestDate, allCases, allCharges);
    const priorMisdemeanors = getPreviousMisdemeanors(allCharges);
    const priorFelonies = getPreviousFelonies(allCharges);
    const priorViolentConvictions = getPreviousViolentCharges(allCharges);
    const recentFTAs = getRecentFTAs(allFTAs);
    const oldFTAs = getOldFTAs(allFTAs);
    const priorSentenceToIncarceration = getSentenceToIncarcerationCaseNums(allSentences);

    const step2Charges = getAllStepTwoCharges(currCharges);
    const step4Charges = getAllStepFourCharges(currCharges);

    return (
      <div>
        <Divider />
        <StyledFormWrapper>
          <form onSubmit={this.handleSubmit}>
            <StyledSectionView>
              <Header>PSA Information</Header>

              <QuestionRow>
                <PSACol lg={6}>
                  <TitleLabel>{CURRENT_AGE_PROMPT}</TitleLabel>
                  <FormGroup>
                    {this.renderRadio(AGE_AT_CURRENT_ARREST, 0, '20 or younger')}
                    {this.renderRadio(AGE_AT_CURRENT_ARREST, 1, '21 or 22')}
                    {this.renderRadio(AGE_AT_CURRENT_ARREST, 2, '23 or older')}
                  </FormGroup>
                </PSACol>
                {this.renderNotesAndJustifications(NOTES[AGE_AT_CURRENT_ARREST])}
              </QuestionRow>

              <QuestionRow>
                {this.renderTrueFalseRadio(CURRENT_VIOLENT_OFFENSE, CURRENT_VIOLENT_OFFENSE_PROMPT)}
                {this.renderNotesAndJustifications(NOTES[CURRENT_VIOLENT_OFFENSE], currentViolentCharges)}
              </QuestionRow>

              <QuestionRow>
                {this.renderTrueFalseRadio(PENDING_CHARGE, PENDING_CHARGE_PROMPT)}
                {this.renderNotesAndJustifications(NOTES[PENDING_CHARGE], pendingCharges)}
              </QuestionRow>

              <QuestionRow>
                {this.renderTrueFalseRadio(PRIOR_MISDEMEANOR, PRIOR_MISDEMEANOR_PROMPT)}
                {this.renderNotesAndJustifications(NOTES[PRIOR_MISDEMEANOR], priorMisdemeanors)}
              </QuestionRow>

              <QuestionRow>
                {this.renderTrueFalseRadio(PRIOR_FELONY, PRIOR_FELONY_PROMPT)}
                {this.renderNotesAndJustifications(NOTES[PRIOR_FELONY], priorFelonies)}
              </QuestionRow>

              <QuestionRow>
                <PSACol lg={6}>
                  <TitleLabel>{PRIOR_VIOLENT_CONVICTION_PROMPT}</TitleLabel>
                  <FormGroup>
                    {this.renderRadio(PRIOR_VIOLENT_CONVICTION, 0, '0', noPriorConvictions)}
                    {this.renderRadio(PRIOR_VIOLENT_CONVICTION, 1, '1', noPriorConvictions)}
                    {this.renderRadio(PRIOR_VIOLENT_CONVICTION, 2, '2', noPriorConvictions)}
                    {this.renderRadio(PRIOR_VIOLENT_CONVICTION, 3, '3 or more', noPriorConvictions)}
                  </FormGroup>
                </PSACol>
                {this.renderNotesAndJustifications(NOTES[PRIOR_VIOLENT_CONVICTION], priorViolentConvictions)}
              </QuestionRow>

              <QuestionRow>
                <PSACol lg={6}>
                  <TitleLabel>{PRIOR_FAILURE_TO_APPEAR_RECENT_PROMPT}</TitleLabel>
                  <FormGroup>
                    {this.renderRadio(PRIOR_FAILURE_TO_APPEAR_RECENT, 0, '0')}
                    {this.renderRadio(PRIOR_FAILURE_TO_APPEAR_RECENT, 1, '1')}
                    {this.renderRadio(PRIOR_FAILURE_TO_APPEAR_RECENT, 2, '2 or more')}
                  </FormGroup>
                </PSACol>
                {this.renderNotesAndJustifications(NOTES[PRIOR_FAILURE_TO_APPEAR_RECENT], recentFTAs)}
              </QuestionRow>

              <QuestionRow>
                {this.renderTrueFalseRadio(PRIOR_FAILURE_TO_APPEAR_OLD, PRIOR_FAILURE_TO_APPEAR_OLD_PROMPT)}
                {this.renderNotesAndJustifications(NOTES[PRIOR_FAILURE_TO_APPEAR_OLD], oldFTAs)}
              </QuestionRow>

              <LastQuestionRow>
                {this.renderTrueFalseRadio(
                  PRIOR_SENTENCE_TO_INCARCERATION,
                  PRIOR_SENTENCE_TO_INCARCERATION_PROMPT,
                  noPriorConvictions
                )}
                {this.renderNotesAndJustifications(
                  NOTES[PRIOR_SENTENCE_TO_INCARCERATION],
                  priorSentenceToIncarceration
                )}
              </LastQuestionRow>

              <Header>DMF Information</Header>

              <QuestionRow>
                {this.renderTrueFalseRadio(EXTRADITED, EXTRADITED_PROMPT)}
                {this.renderNotesAndJustifications(NOTES[EXTRADITED])}
              </QuestionRow>

              <QuestionRow>
                {this.renderTrueFalseRadio(STEP_2_CHARGES, STEP_2_CHARGES_PROMPT)}
                {this.renderNotesAndJustifications(NOTES[STEP_2_CHARGES], step2Charges)}
              </QuestionRow>

              <QuestionRow>
                {this.renderTrueFalseRadio(STEP_4_CHARGES, STEP_4_CHARGES_PROMPT)}
                {this.renderNotesAndJustifications(NOTES[STEP_4_CHARGES], step4Charges)}
              </QuestionRow>

              <QuestionRow>
                <PSACol lg={12}>
                  <TitleLabel>{COURT_OR_BOOKING_PROMPT}</TitleLabel>
                  <FormGroup>
                    {this.renderRadio(COURT_OR_BOOKING, CONTEXT.BOOKING, CONTEXT.BOOKING)}
                    {this.renderRadio(COURT_OR_BOOKING, CONTEXT.COURT_PENN, CONTEXT.COURT_PENN)}
                    {this.renderRadio(COURT_OR_BOOKING, CONTEXT.COURT_MINN, CONTEXT.COURT_MINN)}
                  </FormGroup>
                </PSACol>
              </QuestionRow>

              {
                input.get(COURT_OR_BOOKING) === CONTEXT.BOOKING ? (
                  <QuestionRow>
                    {this.renderTrueFalseRadio(SECONDARY_RELEASE_CHARGES, SECONDARY_RELEASE_CHARGES_PROMPT)}
                    {this.renderNotesAndJustifications(NOTES[SECONDARY_RELEASE_CHARGES])}
                  </QuestionRow>
                ) : null
              }

              {
                this.state.incomplete ? <ErrorMessage>All fields must be filled out.</ErrorMessage> : null
              }

            </StyledSectionView>
            {
              viewOnly ? null : (
                <SubmitContainer>
                  <CheckboxContainer>
                    <StyledCheckbox
                        name="iii"
                        label="Interstate Identification Index (III) search completed"
                        checked={this.state.iiiChecked}
                        value={this.state.iiiChecked}
                        onChange={this.handleCheckboxChange} />
                  </CheckboxContainer>
                  <SubmitButton
                      type="submit"
                      bsStyle="primary"
                      bsSize="lg"
                      disabled={!this.state.iiiChecked}>
                    Score & Submit
                  </SubmitButton>
                </SubmitContainer>
              )
            }
          </form>
        </StyledFormWrapper>
      </div>
    );
  }
}
