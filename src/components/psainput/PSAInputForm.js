/*
 * @flow
 */

import React from 'react';
import Immutable, { Map } from 'immutable';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import StyledRadio from '../controls/StyledRadio';
import StyledInput from '../controls/StyledInput';
import StyledTextArea from '../controls/StyledTextArea';
import StyledRadioButton from '../controls/StyledRadioButton';
import BasicButton from '../buttons/BasicButton';
import ExpandableText from '../controls/ExpandableText';
import { CHARGES } from '../../utils/consts/FrontEndStateConsts';
import { BHE_LABELS, BRE_LABELS } from '../../utils/consts/ArrestChargeConsts';
import { formatValue } from '../../utils/FormattingUtils';
import { getRecentFTAs, getOldFTAs } from '../../utils/FTAUtils';
import { getSentenceToIncarcerationCaseNums } from '../../utils/SentenceUtils';
import { StyledSectionWrapper, ErrorMessage } from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { RCM_FIELDS } from '../../utils/consts/RCMResultsConsts';
import { OL } from '../../utils/consts/Colors';
import { CONTEXT, NOTES, PSA } from '../../utils/consts/Consts';
import {
  getViolentChargeLabels,
  getRCMStepChargeLabels,
  getBHEAndBREChargeLabels
} from '../../utils/ArrestChargeUtils';
import {
  getPendingChargeLabels,
  getPreviousMisdemeanorLabels,
  getPreviousFelonyLabels,
  getPreviousViolentChargeLabels
} from '../../utils/AutofillUtils';
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

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

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
} = RCM_FIELDS;

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
  color: ${OL.GREY01};
  margin-bottom: 30px;
  align-self: flex-start;
  padding-left: 30px;
`;

const SearchText = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #{OL.GREY02};
  margin-right: 10px;
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
  border-bottom: solid 1px ${OL.GREY11} !important;
`;

const QuestionLabels = styled.div`
  display: flex;
  flex-direction: row;

  div {
    width: 50%;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: ${OL.GREY01};
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
  color: ${OL.GREY01};
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

const RadioContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 30px 0;

  label {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: ${OL.GREY02};
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
    color: ${OL.GREY01};
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  div {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: ${OL.GREY02};
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
  bookingHoldExceptionCharges :Map<*, *>,
  bookingReleaseExceptionCharges :Map<*, *>,
  rcmStep2Charges :Map<*, *>,
  rcmStep4Charges :Map<*, *>,
  selectedOrganizationId :string,
  selectedOrganizationSettings :boolean,
  violentArrestCharges :Map<*, *>,
  handleInputChange :(event :Object) => void,
  input :Immutable.Map<*, *>,
  handleSubmit :(event :Object) => void,
  currCharges :Immutable.List<*>,
  currCase :Immutable.Map<*, *>,
  allCharges :Immutable.List<*>,
  allSentences :Immutable.List<*>,
  allCases :Immutable.List<*>,
  allFTAs :Immutable.List<*>,
  psaDate :string,
  viewOnly? :boolean,
  exitEdit? :() => void;
};

type State = {
  iiiComplete :string,
  incomplete :boolean
};

class PSAInputForm extends React.Component<Props, State> {

  static defaultProps = {
    viewOnly: false
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      iiiComplete: undefined,
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

  handleRadioChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  invalidValue = (val :string) => val === null || val === undefined || val === 'null' || val === 'undefined';

  handleSubmit = (e) => {
    const { input, handleSubmit, selectedOrganizationSettings } = this.props;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    e.preventDefault();

    let requiredFields = input;
    if (!includesPretrialModule) {
      requiredFields = requiredFields
        .remove(STEP_2_CHARGES)
        .remove(STEP_4_CHARGES)
        .remove(SECONDARY_RELEASE_CHARGES)
        .remove(SECONDARY_HOLD_CHARGES);
    }
    else if (input.get(COURT_OR_BOOKING, '').includes(CONTEXT.COURT)) {
      requiredFields = requiredFields
        .remove(SECONDARY_RELEASE_CHARGES)
        .remove(SECONDARY_HOLD_CHARGES);
    }

    if (requiredFields.valueSeq().filter(this.invalidValue).toList().size) {
      this.setState({ incomplete: true });
    }
    else {
      handleSubmit(e);
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
    const {
      viewOnly,
      input,
      handleInputChange
    } = this.props;
    // Only render autojustification if app settings loads historical charges
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
          (justificationText) ? (
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
      allCases,
      allCharges,
      allFTAs,
      allSentences,
      bookingHoldExceptionCharges,
      bookingReleaseExceptionCharges,
      currCase,
      currCharges,
      rcmStep2Charges,
      rcmStep4Charges,
      exitEdit,
      handleClose,
      input,
      modal,
      psaDate,
      selectedOrganizationId,
      selectedOrganizationSettings,
      viewOnly,
      violentArrestCharges,
      violentCourtCharges,
    } = this.props;
    const { iiiComplete } = this.state;
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false)
    const violentChargeList = violentArrestCharges.get(selectedOrganizationId, Map());
    const violentCourtChargeList = violentCourtCharges.get(selectedOrganizationId, Map());
    const rcmStep2ChargeList = rcmStep2Charges.get(selectedOrganizationId, Map());
    const rcmStep4ChargeList = rcmStep4Charges.get(selectedOrganizationId, Map());
    const bookingReleaseExceptionChargeList = bookingReleaseExceptionCharges.get(selectedOrganizationId, Map());
    const bookingHoldExceptionChargeList = bookingHoldExceptionCharges.get(selectedOrganizationId, Map());

    const currentViolentCharges = getViolentChargeLabels({ currCharges, violentChargeList });
    const {
      step2Charges,
      step4Charges
    } = getRCMStepChargeLabels({ currCharges, rcmStep2ChargeList, rcmStep4ChargeList });
    const {
      currentBHECharges,
      currentNonBHECharges,
      currentBRECharges
    } = getBHEAndBREChargeLabels({
      currCharges,
      bookingReleaseExceptionChargeList,
      bookingHoldExceptionChargeList
    });

    const noPriorConvictions = input.get(PRIOR_MISDEMEANOR) === 'false' && input.get(PRIOR_FELONY) === 'false';

    const currCaseNum = currCase.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
    const arrestDate = currCase.getIn([PROPERTY_TYPES.ARREST_DATE_TIME, 0],
      currCase.getIn([PROPERTY_TYPES.ARREST_DATE, 0],
        currCase.getIn([PROPERTY_TYPES.FILE_DATE, 0], '')));

    const pendingCharges = getPendingChargeLabels(currCaseNum, arrestDate, allCases, allCharges);
    const priorMisdemeanors = getPreviousMisdemeanorLabels(allCharges);
    const priorFelonies = getPreviousFelonyLabels(allCharges);
    const priorViolentConvictions = getPreviousViolentChargeLabels(allCharges, violentCourtChargeList);
    const priorSentenceToIncarceration = getSentenceToIncarcerationCaseNums(allSentences);

    // psaDate will be undefined if the report is being filled out for the first time.
    // If this is the case, it will default to the current datetime. See FTAUtils.js.
    const recentFTAs = getRecentFTAs(allFTAs, allCharges, psaDate);
    const oldFTAs = getOldFTAs(allFTAs, allCharges, psaDate);

    let secondaryReleaseHeader;
    let secondaryReleaseCharges;
    if (currentBHECharges.size && (currentBHECharges.size === currCharges.size)) {
      secondaryReleaseHeader = BHE_LABELS.RELEASE;
      secondaryReleaseCharges = currentBHECharges;
    }
    else {
      secondaryReleaseHeader = BHE_LABELS.HOLD;
      secondaryReleaseCharges = currentNonBHECharges;
    }
    const secondaryHoldHeader = BRE_LABELS.LABEL;
    return (
      <div>
        <FormWrapper noBorders={modal}>
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
            {
              includesPretrialModule
                ? (
                  <>
                    <PaddedHeader>RCM Information</PaddedHeader>

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
                      ((input.get(COURT_OR_BOOKING) === CONTEXT.BOOKING) && includesPretrialModule)
                        ? this.renderTFQuestionRow(
                          13,
                          SECONDARY_RELEASE_CHARGES,
                          SECONDARY_RELEASE_CHARGES_PROMPT,
                          secondaryReleaseCharges,
                          true, // requested to be disabled by client
                          secondaryReleaseHeader
                        ) : null
                    }
                    {
                      ((input.get(COURT_OR_BOOKING) === CONTEXT.BOOKING) && includesPretrialModule)
                        ? this.renderTFQuestionRow(
                          14,
                          SECONDARY_HOLD_CHARGES,
                          SECONDARY_HOLD_CHARGES_PROMPT,
                          currentBRECharges,
                          true, // requested to be disabled by client
                          secondaryHoldHeader
                        ) : null
                    }

                  </>
                ) : null
            }
            <FooterContainer>
              <DoublePaddedHeader>Additional Notes</DoublePaddedHeader>
              <StyledTextArea
                  name={PSA.NOTES}
                  value={this.props.input.get(PSA.NOTES)}
                  disabled={viewOnly}
                  onChange={this.props.handleInputChange} />

              <RadioContainer>
                <SearchText>Interstate Identification Index (III) Search:</SearchText>
                <StyledRadio
                    name="iiiComplete"
                    label="completed"
                    checked={iiiComplete === 'completed'}
                    value="completed"
                    onChange={this.handleRadioChange}
                    disabled={viewOnly} />
                <StyledRadio
                    name="iiiComplete"
                    label="not completed"
                    checked={iiiComplete === 'not completed'}
                    value="not completed"
                    onChange={this.handleRadioChange}
                    disabled={viewOnly} />
              </RadioContainer>

              {
                viewOnly ? null : (
                  <ButtonRow>
                    { exitEdit
                      ? <DiscardButton onClick={exitEdit}>Cancel</DiscardButton>
                      : <DiscardButton onClick={handleClose}>Discard</DiscardButton>
                    }
                    <SubmitButton
                        type="submit"
                        bsStyle="primary"
                        bsSize="lg"
                        onClick={this.handleSubmit}
                        disabled={!(iiiComplete)}>
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

function mapStateToProps(state :Immutable.Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  return {
    // App
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Charges
    [CHARGES.ARREST]: charges.get(CHARGES.ARREST),
    [CHARGES.COURT]: charges.get(CHARGES.COURT),
    [CHARGES.ARREST_VIOLENT]: charges.get(CHARGES.ARREST_VIOLENT),
    [CHARGES.COURT_VIOLENT]: charges.get(CHARGES.COURT_VIOLENT),
    [CHARGES.RCM_STEP_2]: charges.get(CHARGES.RCM_STEP_2),
    [CHARGES.RCM_STEP_4]: charges.get(CHARGES.RCM_STEP_4),
    [CHARGES.BRE]: charges.get(CHARGES.BRE),
    [CHARGES.BHE]: charges.get(CHARGES.BHE),
    [CHARGES.LOADING]: charges.get(CHARGES.LOADING),
  };
}

export default withRouter(connect(mapStateToProps, null)(PSAInputForm));
