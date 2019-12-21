/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { fromJS, List, Map } from 'immutable';
import type { RequestState } from 'redux-reqseq';
import type { Dispatch } from 'redux';

import PSAQuestionRow from './PSAQuestionRow';
import StyledRadio from '../controls/StyledRadio';
import StyledTextArea from '../controls/StyledTextArea';
import BasicButton from '../buttons/BasicButton';
import { CHARGES, PSA_FORM } from '../../utils/consts/FrontEndStateConsts';
import { BHE_LABELS, BRE_LABELS } from '../../utils/consts/ArrestChargeConsts';
import { getRecentFTAs, getOldFTAs } from '../../utils/FTAUtils';
import { getSentenceToIncarcerationCaseNums } from '../../utils/SentenceUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { ErrorMessage, StyledSectionWrapper } from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { MODULE, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { OL } from '../../utils/consts/Colors';
import {
  getViolentChargeLabels,
  getDMFStepChargeLabels,
  getBHEAndBREChargeLabels
} from '../../utils/ArrestChargeUtils';
import {
  getJustificationText,
  getPendingChargeLabels,
  getPreviousMisdemeanorLabels,
  getPreviousFelonyLabels,
  getPreviousViolentChargeLabels
} from '../../utils/AutofillUtils';
import {
  CONTEXT,
  DMF,
  NOTES,
  PSA
} from '../../utils/consts/Consts';
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
  SECONDARY_RELEASE_CHARGES_PROMPT,
  SECONDARY_HOLD_CHARGES_PROMPT
} from '../../utils/consts/FormPromptConsts';

import { PSA_FORM_ACTIONS } from '../../utils/consts/redux/PSAFormConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import {
  getReqState,
  getError,
  requestIsFailure,
  requestIsPending,
  requestIsSuccess
} from '../../utils/consts/redux/ReduxUtils';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { FAILED_CASES, PERSON_ACTIONS } from '../../utils/consts/redux/PersonConsts';

import { setPSAValues } from '../../containers/psa/PSAFormActions';

const { CHARGE_ID, GENERAL_ID } = PROPERTY_TYPES;

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

const TF_QUESTION_MAPPINGS :Object = {
  false: 'No',
  true: 'Yes'
};

const FormWrapper = styled(StyledSectionWrapper)`
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  ${props => (props.noBorders ? 'border: none' : '')}
`;

const DiscardButton = styled(BasicButton)`
  width: 140px;
`;

const SubmitButton = styled(Button)`
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

export const QuestionRow = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  border-bottom: solid 1px ${OL.GREY11} !important;
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

const WideForm = styled.div`
  width: 100%;
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
  actions :{
    setPSAValues :(value :{
      newValues :Map
    }) => void
  };
  allCases :List;
  allCharges :List;
  allFTAs :List;
  allSentences :List;
  bookingHoldExceptionCharges :Map;
  bookingReleaseExceptionCharges :Map;
  currCase :Map;
  currCharges :List;
  dmfStep2Charges :Map;
  dmfStep4Charges :Map;
  exitEdit :() => void;
  handleClose :() => void;
  handleInputChange :(event :Object) => void;
  handleSubmit :(event :Object) => void;
  incomplete :boolean;
  input :Map;
  loadPersonDetailsReqState :RequestState;
  modal :boolean;
  psaDate :string;
  selectedOrganizationId :string;
  selectedOrganizationSettings :Map;
  submitPSAReqState :RequestState;
  updateCasesError :Map;
  updateCasesReqState :RequestState;
  viewOnly :boolean;
  violentArrestCharges :Map;
  violentCourtCharges :Map;
};

type State = {
  iiiComplete :string;
  oldFTAs :List;
  pendingCharges :List;
  priorFelonies :List;
  priorMisdemeanors :List;
  priorSentenceToIncarceration :List;
  priorViolentConvictions :List;
  recentFTAs :List;
};

const INITIAL_STATE = {
  iiiComplete: undefined,
  oldFTAs: List(),
  pendingCharges: List(),
  priorFelonies: List(),
  priorMisdemeanors: List(),
  priorSentenceToIncarceration: List(),
  priorViolentConvictions: List(),
  recentFTAs: List(),
};

class PSAInputForm extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidMount() {
    this.initializeState();
  }

  componentDidUpdate(prevProps) {
    const { loadPersonDetailsReqState } = this.props;
    const wasloadingPersonData = requestIsPending(prevProps.loadPersonDetailsReqState);
    const successfullyLoadedPersonData = requestIsSuccess(loadPersonDetailsReqState);
    if (wasloadingPersonData && successfullyLoadedPersonData) {
      this.initializeState();
    }
  }

  initializeState = () => {
    const {
      allCases,
      allCharges,
      allFTAs,
      allSentences,
      currCase,
      psaDate,
      selectedOrganizationId,
      updateCasesReqState,
      updateCasesError,
      violentCourtCharges
    } = this.props;
    const updateCasesFailed = requestIsFailure(updateCasesReqState);

    const violentCourtChargeList = violentCourtCharges.get(selectedOrganizationId, Map());
    const currCaseNum = currCase.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
    const arrestDate = currCase.getIn([PROPERTY_TYPES.ARREST_DATE_TIME, 0],
      currCase.getIn([PROPERTY_TYPES.ARREST_DATE, 0],
        currCase.getIn([PROPERTY_TYPES.FILE_DATE, 0], '')));

    let refreshedCharges = allCharges;
    let refreshedFTAs = allFTAs;
    let refreshedSentences = allSentences;
    let failedCharges = List();
    let failedFTAs = List();
    let failedSentences = List();
    if (updateCasesFailed) {
      refreshedCharges = List();
      refreshedFTAs = List();
      refreshedSentences = List();
      const failedCasesFromState = updateCasesError.get(FAILED_CASES, List());
      allCharges.forEach((charge) => {
        const { [CHARGE_ID]: chargeId } = getEntityProperties(charge, [CHARGE_ID]);
        const caseNum = chargeId.split('|')[0];
        if (failedCasesFromState.includes(caseNum)) {
          failedCharges = failedCharges.push(charge);
        }
        else {
          refreshedCharges = refreshedCharges.push(charge);
        }
      });
      allSentences.forEach((charge) => {
        const { [GENERAL_ID]: sentenceId } = getEntityProperties(charge, [GENERAL_ID]);
        const caseNum = sentenceId.split('|')[0];
        if (failedCasesFromState.includes(caseNum)) {
          failedSentences = failedSentences.push(charge);
        }
        else {
          refreshedSentences = refreshedSentences.push(charge);
        }
      });
      allFTAs.forEach((fta) => {
        const { [GENERAL_ID]: sentenceId } = getEntityProperties(fta, [GENERAL_ID]);
        const caseNum = sentenceId.split('|')[0];
        if (failedCasesFromState.includes(caseNum)) {
          failedFTAs = failedFTAs.push(fta);
        }
        else {
          refreshedFTAs = refreshedFTAs.push(fta);
        }
      });
      const failedPendingCharges = getPendingChargeLabels(currCaseNum, arrestDate, allCases, failedCharges);
      const failedPriorMisdemeanors = getPreviousMisdemeanorLabels(failedCharges);
      const failedPriorFelonies = getPreviousFelonyLabels(failedCharges);
      const failedPriorViolentConvictions = getPreviousViolentChargeLabels(failedCharges, violentCourtChargeList);
      const failedPriorSentenceToIncarceration = getSentenceToIncarcerationCaseNums(failedSentences);
      const failedRecentFTAnotes = getRecentFTAs(failedFTAs, failedCharges, psaDate);
      const failedOldFTAnotes = getOldFTAs(failedFTAs, failedCharges, psaDate);
      this.setNotes(PENDING_CHARGE, failedPendingCharges);
      this.setNotes(PRIOR_MISDEMEANOR, failedPriorMisdemeanors);
      this.setNotes(PRIOR_FELONY, failedPriorFelonies);
      this.setNotes(PRIOR_VIOLENT_CONVICTION, failedPriorViolentConvictions);
      this.setNotes(PRIOR_SENTENCE_TO_INCARCERATION, failedPriorSentenceToIncarceration);
      this.setNotes(PRIOR_FAILURE_TO_APPEAR_RECENT, failedRecentFTAnotes);
      this.setNotes(PRIOR_FAILURE_TO_APPEAR_OLD, failedOldFTAnotes);
    }

    const pendingCharges = getPendingChargeLabels(currCaseNum, arrestDate, allCases, refreshedCharges);
    const priorMisdemeanors = getPreviousMisdemeanorLabels(refreshedCharges);
    const priorFelonies = getPreviousFelonyLabels(refreshedCharges);
    const priorViolentConvictions = getPreviousViolentChargeLabels(refreshedCharges, violentCourtChargeList);
    const priorSentenceToIncarceration = getSentenceToIncarcerationCaseNums(refreshedSentences);

    // psaDate will be undefined if the report is being filled out for the first time.
    // If this is the case, it will default to the current datetime. See FTAUtils.js.
    const recentFTAs = getRecentFTAs(refreshedFTAs, refreshedCharges, psaDate);
    const oldFTAs = getOldFTAs(refreshedFTAs, refreshedCharges, psaDate);

    this.setState({
      oldFTAs,
      pendingCharges,
      priorFelonies,
      priorMisdemeanors,
      priorSentenceToIncarceration,
      priorViolentConvictions,
      recentFTAs
    });
  }

  handleRadioChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  setNotes = (name, notes) => {
    const { actions } = this.props;
    if (notes.size) {
      const autofillNotes :string = getJustificationText(notes, 'FAILED TO UPDATE');
      const newValues = fromJS({ [NOTES[name]]: autofillNotes });
      actions.setPSAValues({ newValues });
    }
  }

  render() {
    const {
      bookingHoldExceptionCharges,
      bookingReleaseExceptionCharges,
      currCharges,
      dmfStep2Charges,
      dmfStep4Charges,
      exitEdit,
      handleClose,
      handleInputChange,
      handleSubmit,
      incomplete,
      input,
      modal,
      selectedOrganizationId,
      selectedOrganizationSettings,
      submitPSAReqState,
      updateCasesReqState,
      viewOnly,
      violentArrestCharges
    } = this.props;
    const {
      iiiComplete,
      oldFTAs,
      pendingCharges,
      priorFelonies,
      priorMisdemeanors,
      priorSentenceToIncarceration,
      priorViolentConvictions,
      recentFTAs
    } = this.state;
    const updateCasesFailed = requestIsFailure(updateCasesReqState);
    const includesPretrialModule = selectedOrganizationSettings.getIn([SETTINGS.MODULES, MODULE.PRETRIAL], false);
    const violentChargeList = violentArrestCharges.get(selectedOrganizationId, Map());
    const dmfStep2ChargeList = dmfStep2Charges.get(selectedOrganizationId, Map());
    const dmfStep4ChargeList = dmfStep4Charges.get(selectedOrganizationId, Map());
    const bookingReleaseExceptionChargeList = bookingReleaseExceptionCharges.get(selectedOrganizationId, Map());
    const bookingHoldExceptionChargeList = bookingHoldExceptionCharges.get(selectedOrganizationId, Map());

    const currentViolentCharges = getViolentChargeLabels({ currCharges, violentChargeList });
    const {
      step2Charges,
      step4Charges
    } = getDMFStepChargeLabels({ currCharges, dmfStep2ChargeList, dmfStep4ChargeList });
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
    const isSubmittingPSA :boolean = requestIsPending(submitPSAReqState);
    return (
      <div>
        <FormWrapper noBorders={modal}>
          <Header>PSA Information</Header>
          <WideForm>
            <PSAQuestionRow
                field={AGE_AT_CURRENT_ARREST}
                handleInputChange={handleInputChange}
                input={input}
                mappings={{
                  0: '20 or younger',
                  1: '21 or 22',
                  2: '23 or older'
                }}
                num={1}
                prompt={CURRENT_AGE_PROMPT}
                viewOnly={viewOnly} />
            <PSAQuestionRow
                field={CURRENT_VIOLENT_OFFENSE}
                handleInputChange={handleInputChange}
                input={input}
                justifications={currentViolentCharges}
                mappings={TF_QUESTION_MAPPINGS}
                num={2}
                prompt={CURRENT_VIOLENT_OFFENSE_PROMPT}
                viewOnly={viewOnly} />
            <PSAQuestionRow
                field={PENDING_CHARGE}
                handleInputChange={handleInputChange}
                input={input}
                justifications={pendingCharges}
                mappings={TF_QUESTION_MAPPINGS}
                num={3}
                prompt={PENDING_CHARGE_PROMPT}
                viewOnly={viewOnly} />
            <PSAQuestionRow
                field={PRIOR_MISDEMEANOR}
                handleInputChange={handleInputChange}
                input={input}
                justifications={priorMisdemeanors}
                mappings={TF_QUESTION_MAPPINGS}
                num={4}
                prompt={PRIOR_MISDEMEANOR_PROMPT}
                viewOnly={viewOnly} />
            <PSAQuestionRow
                field={PRIOR_FELONY}
                handleInputChange={handleInputChange}
                input={input}
                justifications={priorFelonies}
                mappings={TF_QUESTION_MAPPINGS}
                num={5}
                prompt={PRIOR_FELONY_PROMPT}
                viewOnly={viewOnly} />
            <PSAQuestionRow
                disabledField={noPriorConvictions}
                field={PRIOR_VIOLENT_CONVICTION}
                handleInputChange={handleInputChange}
                input={input}
                justifications={priorViolentConvictions}
                mappings={{
                  0: '0',
                  1: '1',
                  2: '2',
                  3: '3 or more'
                }}
                num={6}
                prompt={PRIOR_VIOLENT_CONVICTION_PROMPT}
                viewOnly={viewOnly} />
            <PSAQuestionRow
                field={PRIOR_FAILURE_TO_APPEAR_RECENT}
                handleInputChange={handleInputChange}
                input={input}
                justifications={recentFTAs}
                mappings={{
                  0: '0',
                  1: '1',
                  2: '2 or more'
                }}
                num={7}
                prompt={PRIOR_FAILURE_TO_APPEAR_RECENT_PROMPT}
                viewOnly={viewOnly} />
            <PSAQuestionRow
                field={PRIOR_FAILURE_TO_APPEAR_OLD}
                handleInputChange={handleInputChange}
                input={input}
                justifications={oldFTAs}
                mappings={TF_QUESTION_MAPPINGS}
                num={8}
                prompt={PRIOR_FAILURE_TO_APPEAR_OLD_PROMPT}
                viewOnly={viewOnly} />
            <PSAQuestionRow
                disabledField={noPriorConvictions}
                field={PRIOR_SENTENCE_TO_INCARCERATION}
                handleInputChange={handleInputChange}
                input={input}
                justifications={priorSentenceToIncarceration}
                mappings={TF_QUESTION_MAPPINGS}
                num={9}
                prompt={PRIOR_SENTENCE_TO_INCARCERATION_PROMPT}
                viewOnly={viewOnly} />
            {
              includesPretrialModule
                ? (
                  <>
                    <PaddedHeader>DMF Information</PaddedHeader>
                    <PSAQuestionRow
                        field={EXTRADITED}
                        handleInputChange={handleInputChange}
                        input={input}
                        mappings={TF_QUESTION_MAPPINGS}
                        num={10}
                        prompt={EXTRADITED_PROMPT}
                        viewOnly={viewOnly} />
                    <PSAQuestionRow
                        field={STEP_2_CHARGES}
                        handleInputChange={handleInputChange}
                        input={input}
                        justifications={step2Charges}
                        mappings={TF_QUESTION_MAPPINGS}
                        num={11}
                        prompt={STEP_2_CHARGES_PROMPT}
                        viewOnly={viewOnly} />
                    <PSAQuestionRow
                        field={STEP_4_CHARGES}
                        handleInputChange={handleInputChange}
                        input={input}
                        justifications={step4Charges}
                        mappings={TF_QUESTION_MAPPINGS}
                        num={12}
                        prompt={STEP_4_CHARGES_PROMPT}
                        viewOnly={viewOnly} />

                    {
                      ((input.get(COURT_OR_BOOKING) === CONTEXT.BOOKING) && includesPretrialModule)
                        ? (
                          <PSAQuestionRow
                              disabledField
                              field={SECONDARY_RELEASE_CHARGES}
                              handleInputChange={handleInputChange}
                              input={input}
                              justificationHeader={secondaryReleaseHeader}
                              justifications={secondaryReleaseCharges}
                              mappings={TF_QUESTION_MAPPINGS}
                              num={13}
                              prompt={SECONDARY_RELEASE_CHARGES_PROMPT}
                              viewOnly={viewOnly} />
                        ) : null
                    }
                    {
                      ((input.get(COURT_OR_BOOKING) === CONTEXT.BOOKING) && includesPretrialModule)
                        ? (
                          <PSAQuestionRow
                              disabledField
                              field={SECONDARY_HOLD_CHARGES}
                              handleInputChange={handleInputChange}
                              input={input}
                              justificationHeader={secondaryHoldHeader}
                              justifications={currentBRECharges}
                              mappings={TF_QUESTION_MAPPINGS}
                              num={14}
                              prompt={SECONDARY_HOLD_CHARGES_PROMPT}
                              viewOnly={viewOnly} />
                        ) : null
                    }

                  </>
                ) : null
            }
            <FooterContainer>
              <DoublePaddedHeader>Additional Notes</DoublePaddedHeader>
              <StyledTextArea
                  name={PSA.NOTES}
                  value={input.get(PSA.NOTES)}
                  disabled={viewOnly}
                  onChange={handleInputChange} />

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
                        disabled={(iiiComplete === undefined) || updateCasesFailed}
                        isLoading={isSubmittingPSA}
                        onClick={handleSubmit}>
                      Score & Submit
                    </SubmitButton>
                    <div />
                  </ButtonRow>
                )
              }
            </FooterContainer>

            {
              incomplete ? <PaddedErrorMessage>All fields must be filled out.</PaddedErrorMessage> : null
            }

          </WideForm>
        </FormWrapper>
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const person = state.get(STATE.PERSON);
  const psaForm = state.get(STATE.PSA);
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
    [CHARGES.DMF_STEP_2]: charges.get(CHARGES.DMF_STEP_2),
    [CHARGES.DMF_STEP_4]: charges.get(CHARGES.DMF_STEP_4),
    [CHARGES.BRE]: charges.get(CHARGES.BRE),
    [CHARGES.BHE]: charges.get(CHARGES.BHE),
    [CHARGES.LOADING]: charges.get(CHARGES.LOADING),

    // Person
    loadPersonDetailsReqState: getReqState(person, PERSON_ACTIONS.LOAD_PERSON_DETAILS),
    updateCasesReqState: getReqState(person, PERSON_ACTIONS.UPDATE_CASES),
    updateCasesError: getError(person, PERSON_ACTIONS.UPDATE_CASES),

    // PSA
    submitPSAReqState: getReqState(psaForm, PSA_FORM_ACTIONS.SUBMIT_PSA),
    [PSA_FORM.SUBMITTED_PSA]: psaForm.get(PSA_FORM.SUBMITTED_PSA),
    [PSA_FORM.SUBMITTED_PSA_NEIGHBORS]: psaForm.get(PSA_FORM.SUBMITTED_PSA_NEIGHBORS),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Form Actions
    setPSAValues,
  }, dispatch)
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PSAInputForm));
