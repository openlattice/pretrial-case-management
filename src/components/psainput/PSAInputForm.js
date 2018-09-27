/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import StyledCheckbox from '../controls/StyledCheckbox';
import StyledInput from '../controls/StyledInput';
import StyledTextArea from '../controls/StyledTextArea';
import StyledRadioButton from '../controls/StyledRadioButton';
import BasicButton from '../buttons/BasicButton';
import ExpandableText from '../controls/ExpandableText';

import {
  getPendingChargeLabels,
  getPreviousMisdemeanorLabels,
  getPreviousFelonyLabels,
  getPreviousViolentChargeLabels
} from '../../utils/AutofillUtils';
import { getSentenceToIncarcerationCaseNums } from '../../utils/SentenceUtils';
import {
  getAllViolentChargeLabels,
  getAllStepTwoChargeLabels,
  getAllStepFourChargeLabels,
  getSecondaryReleaseChargeJustification,
  getSecondaryHoldChargeJustification
} from '../../utils/ArrestChargeUtils';

import {
  StyledSectionWrapper,
  ErrorMessage
} from '../../utils/Layout';

import { formatValue } from '../../utils/FormattingUtils';
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
  SECONDARY_RELEASE_CHARGES_PROMPT,
  SECONDARY_HOLD_CHARGES_PROMPT
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
  SECONDARY_RELEASE_CHARGES,
  SECONDARY_HOLD_CHARGES
} = DMF;

const FormWrapper = styled(StyledSectionWrapper)`
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  ${props => (props.noBorders ? 'border: none' : '')}
`;

const DiscardButton = styled(BasicButton)`
  width: 140px;
`;

const SubmitButton = styled(BasicButton)`
  align-self: center;
  width: 340px;
`;

const Header = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 18px;
  color: #555e6f;
  margin-bottom: 30px;
  align-self: flex-start;
  padding-left: 30px;
`;

const PaddedHeader = styled(Header)`
  margin: 30px 0 0 0;
`;

const DoublePaddedHeader = styled(Header)`
  margin: 30px 0 20px 0;
  padding-left: 0;
`;

const QuestionRow = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  border-bottom: solid 1px #e1e1eb !important;
`;

const QuestionLabels = styled.div`
  display: flex;
  flex-direction: row;

  div {
    width: 50%;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: #555e6f;
    margin-bottom: 10px;
  }

  div:first-child {
    font-weight: 600;
  }

  div:last-child {
    font-weight: 300;
  }
`;

const Prompt = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: #555e6f;
  padding-right: 20px;

  div {
    width: 100% !important;
  }
`;

const PaddedExpandableText = styled(ExpandableText)`
  margin: 5px 0 10px 0;
`;

const PromptNotesWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
  justify-content: space-between;

  ${Prompt} {
    width: 50%;
  }

  input {
    width: 50%;
  }

  div {
    width: 50%;
  }
`;

const PaddedErrorMessage = styled(ErrorMessage)`
  margin-top: 20px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 30px 0 0;

  label {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: #8e929b;
  }
`;

const InlineFormGroup = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 30px;
`;

const RadioWrapper = styled.div`
  margin-right: 20px;
`;

const WideForm = styled.div`
  width: 100%;
`;

const Justifications = styled.div`
  width: 100%;

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #555e6f;
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  div {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: #8e929b;
  }
`;

const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 30px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  div {
    width: 140px;
  }
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

  getJustificationText = (autofillJustifications, justificationHeader) => {
    let justificationText;
    if (autofillJustifications) {
      justificationText = autofillJustifications.size
        ? formatValue(autofillJustifications) : 'No matching charges.';
      if (justificationHeader) {
        justificationText = `${justificationHeader}: ${justificationText}`;
      }
    }
    return justificationText;
  };

  renderRadio = (name, value, label, disabledField) => (
    <RadioWrapper key={`${name}-${value}`}>
      <StyledRadioButton
          name={name}
          value={`${value}`}
          checked={this.props.input.get(name) === `${value}`}
          onChange={this.props.handleInputChange}
          disabled={this.props.viewOnly || (disabledField && disabledField !== undefined)}
          label={label} />
    </RadioWrapper>
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

  renderTFQuestionRow = (num, field, prompt, justifications, disabledField, justificationHeader) => {
    const mappings = {
      false: 'No',
      true: 'Yes'
    };
    return this.renderQuestionRow(num, field, prompt, mappings, justifications, disabledField, justificationHeader);
  }

  renderQuestionRow = (num, field, prompt, mappings, justifications, disabledField, justificationHeader) => {
    const { viewOnly, input, handleInputChange } = this.props;
    const rowNumFormatted = num < 10 ? `0${num}` : `${num}`;
    const notesVal = input.get(NOTES[field]);
    const notesBody = (viewOnly && notesVal) ? <PaddedExpandableText text={notesVal} maxLength={250} />
      : (
        <StyledInput
            name={NOTES[field]}
            value={notesVal}
            onChange={handleInputChange}
            disabled={viewOnly} />
      );

    const radioButtons = Object.keys(mappings).map(val => this.renderRadio(field, val, mappings[val], disabledField));

    const justificationText = this.getJustificationText(justifications, justificationHeader);

    return (
      <QuestionRow>
        <QuestionLabels>
          <div>{rowNumFormatted}</div>
          <div>Notes</div>
        </QuestionLabels>
        <PromptNotesWrapper>
          <Prompt>{prompt}</Prompt>
          {notesBody}
        </PromptNotesWrapper>
        <InlineFormGroup>
          {radioButtons}
        </InlineFormGroup>
        {
          justificationText ? (
            <Justifications>
              <h1>AUTOFILL JUSTIFICATION</h1>
              <div><PaddedExpandableText text={justificationText} maxLength={220} /></div>
            </Justifications>
          ) : null
        }
      </QuestionRow>
    );

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
      viewOnly,
      handleClose,
      noBorders
    } = this.props;

    const noPriorConvictions = input.get(PRIOR_MISDEMEANOR) === 'false' && input.get(PRIOR_FELONY) === 'false';

    const currCaseNum = currCase.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
    const arrestDate = currCase.getIn([PROPERTY_TYPES.ARREST_DATE_TIME, 0],
      currCase.getIn([PROPERTY_TYPES.ARREST_DATE, 0],
        currCase.getIn([PROPERTY_TYPES.FILE_DATE, 0], '')));

    const currentViolentCharges = getAllViolentChargeLabels(currCharges);
    const pendingCharges = getPendingChargeLabels(currCaseNum, arrestDate, allCases, allCharges);
    const priorMisdemeanors = getPreviousMisdemeanorLabels(allCharges);
    const priorFelonies = getPreviousFelonyLabels(allCharges);
    const priorViolentConvictions = getPreviousViolentChargeLabels(allCharges);
    const recentFTAs = getRecentFTAs(allFTAs, allCharges);
    const oldFTAs = getOldFTAs(allFTAs, allCharges);
    const priorSentenceToIncarceration = getSentenceToIncarcerationCaseNums(allSentences);

    const step2Charges = getAllStepTwoChargeLabels(currCharges);
    const step4Charges = getAllStepFourChargeLabels(currCharges);
    const [secondaryReleaseCharges, secondaryReleaseHeader] = getSecondaryReleaseChargeJustification(currCharges);
    const [secondaryHoldCharges, secondaryHoldHeader] = getSecondaryHoldChargeJustification(currCharges);

    return (
      <div>
        <FormWrapper noBorders={noBorders}>
          <Header>PSA Information</Header>
          <WideForm>
            {
              this.renderQuestionRow(
                1,
                AGE_AT_CURRENT_ARREST,
                CURRENT_AGE_PROMPT,
                {
                  0: '20 or younger',
                  1: '21 or 22',
                  2: '23 or older'
                }
              )
            }
            {
              this.renderTFQuestionRow(
                2,
                CURRENT_VIOLENT_OFFENSE,
                CURRENT_VIOLENT_OFFENSE_PROMPT,
                currentViolentCharges
              )
            }

            {
              this.renderTFQuestionRow(
                3,
                PENDING_CHARGE,
                PENDING_CHARGE_PROMPT,
                pendingCharges
              )
            }

            {
              this.renderTFQuestionRow(
                4,
                PRIOR_MISDEMEANOR,
                PRIOR_MISDEMEANOR_PROMPT,
                priorMisdemeanors
              )
            }

            {
              this.renderTFQuestionRow(
                5,
                PRIOR_FELONY,
                PRIOR_FELONY_PROMPT,
                priorFelonies
              )
            }

            {
              this.renderQuestionRow(
                6,
                PRIOR_VIOLENT_CONVICTION,
                PRIOR_VIOLENT_CONVICTION_PROMPT,
                {
                  0: '0',
                  1: '1',
                  2: '2',
                  3: '3 or more'
                },
                priorViolentConvictions,
                noPriorConvictions
              )
            }

            {
              this.renderQuestionRow(
                7,
                PRIOR_FAILURE_TO_APPEAR_RECENT,
                PRIOR_FAILURE_TO_APPEAR_RECENT_PROMPT,
                {
                  0: '0',
                  1: '1',
                  2: '2 or more'
                },
                recentFTAs
              )
            }

            {
              this.renderTFQuestionRow(
                8,
                PRIOR_FAILURE_TO_APPEAR_OLD,
                PRIOR_FAILURE_TO_APPEAR_OLD_PROMPT,
                oldFTAs
              )
            }

            {
              this.renderTFQuestionRow(
                9,
                PRIOR_SENTENCE_TO_INCARCERATION,
                PRIOR_SENTENCE_TO_INCARCERATION_PROMPT,
                priorSentenceToIncarceration,
                noPriorConvictions
              )
            }

            <PaddedHeader>DMF Information</PaddedHeader>

            {
              this.renderTFQuestionRow(
                10,
                EXTRADITED,
                EXTRADITED_PROMPT
              )
            }

            {
              this.renderTFQuestionRow(
                11,
                STEP_2_CHARGES,
                STEP_2_CHARGES_PROMPT,
                step2Charges
              )
            }

            {
              this.renderTFQuestionRow(
                12,
                STEP_4_CHARGES,
                STEP_4_CHARGES_PROMPT,
                step4Charges
              )
            }

            {
              input.get(COURT_OR_BOOKING) === CONTEXT.BOOKING
                ? this.renderTFQuestionRow(
                  13,
                  SECONDARY_RELEASE_CHARGES,
                  SECONDARY_RELEASE_CHARGES_PROMPT,
                  secondaryHoldCharges,
                  null,
                  secondaryReleaseHeader
                ) : null
            }
            {
              input.get(COURT_OR_BOOKING) === CONTEXT.BOOKING
                ? this.renderTFQuestionRow(
                  14,
                  SECONDARY_HOLD_CHARGES,
                  SECONDARY_HOLD_CHARGES_PROMPT,
                  secondaryReleaseCharges,
                  null,
                  secondaryHoldHeader
                ) : null
            }
            <FooterContainer>
              <DoublePaddedHeader>Additional Notes</DoublePaddedHeader>
              <StyledTextArea
                  name={PSA.NOTES}
                  value={this.props.input.get(PSA.NOTES)}
                  disabled={viewOnly}
                  onChange={this.props.handleInputChange} />

              <CheckboxContainer>
                <StyledCheckbox
                    name="iii"
                    label="Interstate Identification Index (III) search completed"
                    checked={this.state.iiiChecked}
                    value={this.state.iiiChecked}
                    onChange={this.handleCheckboxChange}
                    disabled={viewOnly} />
              </CheckboxContainer>

              {
                viewOnly ? null : (
                  <ButtonRow>
                    <DiscardButton onClick={handleClose}>Discard</DiscardButton>
                    <SubmitButton
                        type="submit"
                        bsStyle="primary"
                        bsSize="lg"
                        onClick={this.handleSubmit}
                        disabled={!this.state.iiiChecked}>
                      Score & Submit
                    </SubmitButton>
                    <div />
                  </ButtonRow>
                )
              }
            </FooterContainer>

            {
              this.state.incomplete ? <PaddedErrorMessage>All fields must be filled out.</PaddedErrorMessage> : null
            }

          </WideForm>
        </FormWrapper>
      </div>
    );
  }
}
