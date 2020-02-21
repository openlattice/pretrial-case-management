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
import { BHE_LABELS, BRE_LABELS } from '../../utils/consts/ArrestChargeConsts';
import { getRecentFTAs, getOldFTAs } from '../../utils/FTAUtils';
import { getSentenceToIncarcerationCaseNums } from '../../utils/SentenceUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { ErrorMessage, StyledSectionWrapper } from '../../utils/Layout';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { RCM_FIELDS } from '../../utils/consts/RCMResultsConsts';
import { OL } from '../../utils/consts/Colors';
import { NOTES, PSA, RCM } from '../../utils/consts/Consts';
import { CONTEXT, SETTINGS, CASE_CONTEXTS } from '../../utils/consts/AppSettingConsts';
import {
  getViolentChargeLabels,
  getRCMStepChargeLabels,
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

import { STATE } from '../../utils/consts/redux/SharedConsts';
import {
  getReqState,
  getError,
  requestIsFailure,
  requestIsPending,
  requestIsSuccess
} from '../../utils/consts/redux/ReduxUtils';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';
import { FAILED_CASES, PERSON_ACTIONS } from '../../utils/consts/redux/PersonConsts';
import { PSA_FORM_ACTIONS, PSA_FORM_DATA } from '../../utils/consts/redux/PSAFormConsts';

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
  COURT_OR_BOOKING,
  EXTRADITED,
  STEP_2_CHARGES,
  STEP_4_CHARGES,
  SECONDARY_RELEASE_CHARGES,
  SECONDARY_HOLD_CHARGES
} = RCM_FIELDS;

const TF_QUESTION_MAPPINGS :Object = {
  false: 'No',
  true: 'Yes'
};

const FormWrapper = styled(StyledSectionWrapper)`
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  ${(props :Object) => (props.noBorders ? 'border: none' : '')}
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
      newValues :Map;
    }) => void
  },
  allCases :List;
  allCharges :List;
  allFTAs :List;
  allSentences :List;
  bookingHoldExceptionCharges :Map;
  bookingReleaseExceptionCharges :Map;
  currCase :Map;
  currCharges :List;
  arrestMaxLevelIncreaseCharges :Map;
  arrestSingleLevelIncreaseCharges :Map;
  courtMaxLevelIncreaseCharges :Map;
  courtSingleLevelIncreaseCharges :Map;
  exitEdit :() => void;
  editPSAReqState :RequestState;
  handleClose :() => void;
  handleInputChange :(event :SyntheticInputEvent<HTMLInputElement>) => void;
  handleSubmit :(event :SyntheticInputEvent<HTMLInputElement>) => void;
  incomplete :boolean;
  input :Map;
  loadPersonDetailsReqState :RequestState;
  modal :boolean;
  psaDate :string;
  selectedOrganizationId :string;
  settings :Map;
  submitPSAReqState :RequestState;
  updateCasesError :Map;
  updateCasesReqState :RequestState;
  viewOnly :boolean;
  violentArrestCharges :Map;
  violentCourtCharges :Map;
};

type State = {
  iiiComplete :string;
  incomplete :boolean;
  oldFTAs :List;
  pendingCharges :List;
  priorFelonies :List;
  priorMisdemeanors :List;
  priorSentenceToIncarceration :List;
  priorViolentConvictions :List;
  recentFTAs :List;
};

const INITIAL_STATE :Object = {
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

  handleRadioChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  setNotes = (name :string, notes :Map) => {
    const { actions } = this.props;
    if (notes.size) {
      const autofillNotes :string = getJustificationText(notes, 'FAILED TO UPDATE');
      const newValues = fromJS({ [NOTES[name]]: autofillNotes });
      actions.setPSAValues({ newValues });
    }
  }

  renderStepIncreaseQuestions = () => {
    const {
      currCharges,
      arrestMaxLevelIncreaseCharges,
      arrestSingleLevelIncreaseCharges,
      courtMaxLevelIncreaseCharges,
      courtSingleLevelIncreaseCharges,
      handleInputChange,
      input,
      settings,
      selectedOrganizationId,
      viewOnly
    } = this.props;

    const caseContext = input.get(RCM.CASE_CONTEXT, CASE_CONTEXTS.ARREST);
    const includesStepIncreases = settings.get(SETTINGS.STEP_INCREASES, false);
    if (includesStepIncreases) {
      let maxLevelIncreaseChargesList;
      let singleLevelIncreaseChargesList;


      if (caseContext === CASE_CONTEXTS.ARREST) {
        maxLevelIncreaseChargesList = arrestMaxLevelIncreaseCharges.get(selectedOrganizationId, Map());
        singleLevelIncreaseChargesList = arrestSingleLevelIncreaseCharges.get(selectedOrganizationId, Map());
      }
      else {
        maxLevelIncreaseChargesList = courtMaxLevelIncreaseCharges.get(selectedOrganizationId, Map());
        singleLevelIncreaseChargesList = courtSingleLevelIncreaseCharges.get(selectedOrganizationId, Map());
      }

      const { maxLevelIncreaseCharges, singleLevelIncreaseCharges } = getRCMStepChargeLabels({
        currCharges,
        maxLevelIncreaseChargesList,
        singleLevelIncreaseChargesList
      });
      return (
        <>
          <PaddedHeader>RCM Level Increases</PaddedHeader>
          <PSAQuestionRow
              field={EXTRADITED}
              handleInputChange={handleInputChange}
              input={input}
              radioLabelMappings={TF_QUESTION_MAPPINGS}
              num={10}
              prompt={EXTRADITED_PROMPT}
              viewOnly={viewOnly} />
          <PSAQuestionRow
              field={STEP_2_CHARGES}
              handleInputChange={handleInputChange}
              input={input}
              justifications={maxLevelIncreaseCharges}
              radioLabelMappings={TF_QUESTION_MAPPINGS}
              num={11}
              prompt={STEP_2_CHARGES_PROMPT}
              viewOnly={viewOnly} />
          <PSAQuestionRow
              field={STEP_4_CHARGES}
              handleInputChange={handleInputChange}
              input={input}
              justifications={singleLevelIncreaseCharges}
              radioLabelMappings={TF_QUESTION_MAPPINGS}
              num={12}
              prompt={STEP_4_CHARGES_PROMPT}
              viewOnly={viewOnly} />
        </>
      );
    }
    return null;
  }

  renderSecondaryBookingQuestions = () => {
    const {
      bookingHoldExceptionCharges,
      bookingReleaseExceptionCharges,
      currCharges,
      handleInputChange,
      input,
      selectedOrganizationId,
      settings,
      viewOnly
    } = this.props;
    const isBookingContext = input.get(COURT_OR_BOOKING, '') === CONTEXT.BOOKING;
    const includesSecondaryBookingCharges = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);
    if (isBookingContext && includesSecondaryBookingCharges) {
      const bookingReleaseExceptionChargeList = bookingReleaseExceptionCharges.get(selectedOrganizationId, Map());
      const bookingHoldExceptionChargeList = bookingHoldExceptionCharges.get(selectedOrganizationId, Map());
      const {
        currentBHECharges,
        currentNonBHECharges,
        currentBRECharges
      } = getBHEAndBREChargeLabels({
        currCharges,
        bookingReleaseExceptionChargeList,
        bookingHoldExceptionChargeList
      });
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
        <>
          <PaddedHeader>Secondary Booking Questions</PaddedHeader>
          <PSAQuestionRow
              disabledField
              field={SECONDARY_RELEASE_CHARGES}
              handleInputChange={handleInputChange}
              input={input}
              justificationHeader={secondaryReleaseHeader}
              justifications={secondaryReleaseCharges}
              radioLabelMappings={TF_QUESTION_MAPPINGS}
              num={13}
              prompt={SECONDARY_RELEASE_CHARGES_PROMPT}
              viewOnly={viewOnly} />
          <PSAQuestionRow
              disabledField
              field={SECONDARY_HOLD_CHARGES}
              handleInputChange={handleInputChange}
              input={input}
              justificationHeader={secondaryHoldHeader}
              justifications={currentBRECharges}
              radioLabelMappings={TF_QUESTION_MAPPINGS}
              num={14}
              prompt={SECONDARY_HOLD_CHARGES_PROMPT}
              viewOnly={viewOnly} />
        </>
      );
    }
    return null;
  }

  render() {
    const {
      currCharges,
      editPSAReqState,
      exitEdit,
      handleClose,
      handleInputChange,
      handleSubmit,
      incomplete,
      input,
      modal,
      selectedOrganizationId,
      submitPSAReqState,
      viewOnly,
      violentArrestCharges,
      violentCourtCharges
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

    const noPriorConvictions = input.get(PRIOR_MISDEMEANOR) === 'false' && input.get(PRIOR_FELONY) === 'false';

    const caseContext = input.get(RCM.CASE_CONTEXT, CASE_CONTEXTS.ARREST);

    /* Charges */
    let violentChargeList = Map();

    if (caseContext === CASE_CONTEXTS.ARREST) {
      violentChargeList = violentArrestCharges.get(selectedOrganizationId, Map());
    }
    else {
      violentChargeList = violentCourtCharges.get(selectedOrganizationId, Map());
    }

    const currentViolentCharges = getViolentChargeLabels({ currCharges, violentChargeList });

    const isSubmittingPSA :boolean = requestIsPending(submitPSAReqState);
    const isEditingPSA :boolean = requestIsPending(editPSAReqState);
    return (
      <FormWrapper noBorders={modal}>
        <WideForm>
          <PSAQuestionRow
              field={AGE_AT_CURRENT_ARREST}
              handleInputChange={handleInputChange}
              input={input}
              radioLabelMappings={{
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
              radioLabelMappings={TF_QUESTION_MAPPINGS}
              num={2}
              prompt={CURRENT_VIOLENT_OFFENSE_PROMPT}
              viewOnly={viewOnly} />
          <PSAQuestionRow
              field={PENDING_CHARGE}
              handleInputChange={handleInputChange}
              input={input}
              justifications={pendingCharges}
              radioLabelMappings={TF_QUESTION_MAPPINGS}
              num={3}
              prompt={PENDING_CHARGE_PROMPT}
              viewOnly={viewOnly} />
          <PSAQuestionRow
              field={PRIOR_MISDEMEANOR}
              handleInputChange={handleInputChange}
              input={input}
              justifications={priorMisdemeanors}
              radioLabelMappings={TF_QUESTION_MAPPINGS}
              num={4}
              prompt={PRIOR_MISDEMEANOR_PROMPT}
              viewOnly={viewOnly} />
          <PSAQuestionRow
              field={PRIOR_FELONY}
              handleInputChange={handleInputChange}
              input={input}
              justifications={priorFelonies}
              radioLabelMappings={TF_QUESTION_MAPPINGS}
              num={5}
              prompt={PRIOR_FELONY_PROMPT}
              viewOnly={viewOnly} />
          <PSAQuestionRow
              disabledField={noPriorConvictions}
              field={PRIOR_VIOLENT_CONVICTION}
              handleInputChange={handleInputChange}
              input={input}
              justifications={priorViolentConvictions}
              radioLabelMappings={{
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
              radioLabelMappings={{
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
              radioLabelMappings={TF_QUESTION_MAPPINGS}
              num={8}
              prompt={PRIOR_FAILURE_TO_APPEAR_OLD_PROMPT}
              viewOnly={viewOnly} />
          <PSAQuestionRow
              disabledField={noPriorConvictions}
              field={PRIOR_SENTENCE_TO_INCARCERATION}
              handleInputChange={handleInputChange}
              input={input}
              justifications={priorSentenceToIncarceration}
              radioLabelMappings={TF_QUESTION_MAPPINGS}
              num={9}
              prompt={PRIOR_SENTENCE_TO_INCARCERATION_PROMPT}
              viewOnly={viewOnly} />
          { this.renderStepIncreaseQuestions() }
          { this.renderSecondaryBookingQuestions() }
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
                    : <DiscardButton onClick={handleClose}>Discard</DiscardButton>}
                  <SubmitButton
                      disabled={iiiComplete === undefined}
                      isLoading={isSubmittingPSA || isEditingPSA}
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
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const person = state.get(STATE.PERSON);
  const settings = state.getIn([STATE.SETTINGS, SETTINGS_DATA.APP_SETTINGS], Map());
  const psaForm = state.get(STATE.PSA);
  return {
    // App
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Charges
    [CHARGE_DATA.ARREST_CHARGES_BY_ID]: charges.get(CHARGE_DATA.ARREST_CHARGES_BY_ID),
    [CHARGE_DATA.COURT_CHARGES_BY_ID]: charges.get(CHARGE_DATA.COURT_CHARGES_BY_ID),
    [CHARGE_DATA.ARREST_VIOLENT]: charges.get(CHARGE_DATA.ARREST_VIOLENT),
    [CHARGE_DATA.COURT_VIOLENT]: charges.get(CHARGE_DATA.COURT_VIOLENT),
    [CHARGE_DATA.ARREST_MAX_LEVEL_INCREASE]: charges.get(CHARGE_DATA.ARREST_MAX_LEVEL_INCREASE),
    [CHARGE_DATA.ARREST_SINGLE_LEVEL_INCREASE]: charges.get(CHARGE_DATA.ARREST_SINGLE_LEVEL_INCREASE),
    [CHARGE_DATA.COURT_MAX_LEVEL_INCREASE]: charges.get(CHARGE_DATA.COURT_MAX_LEVEL_INCREASE),
    [CHARGE_DATA.COURT_SINGLE_LEVEL_INCREASE]: charges.get(CHARGE_DATA.COURT_SINGLE_LEVEL_INCREASE),
    [CHARGE_DATA.BRE]: charges.get(CHARGE_DATA.BRE),
    [CHARGE_DATA.BHE]: charges.get(CHARGE_DATA.BHE),

    // Person
    loadPersonDetailsReqState: getReqState(person, PERSON_ACTIONS.LOAD_PERSON_DETAILS),
    updateCasesReqState: getReqState(person, PERSON_ACTIONS.UPDATE_CASES),
    updateCasesError: getError(person, PERSON_ACTIONS.UPDATE_CASES),

    // Settings
    settings,
    // PSA
    submitPSAReqState: getReqState(psaForm, PSA_FORM_ACTIONS.SUBMIT_PSA),
    [PSA_FORM_DATA.SUBMITTED_PSA]: psaForm.get(PSA_FORM_DATA.SUBMITTED_PSA),
    [PSA_FORM_DATA.SUBMITTED_PSA_NEIGHBORS]: psaForm.get(PSA_FORM_DATA.SUBMITTED_PSA_NEIGHBORS),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Form Actions
    setPSAValues,
  }, dispatch)
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PSAInputForm));
