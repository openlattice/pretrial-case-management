/*
 * @flow
 */

import React from 'react';
import type { Element } from 'react';

import styled from 'styled-components';
import { List, Map, OrderedMap } from 'immutable';
import { Constants } from 'lattice';
import { Button, Checkbox, Radio } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { v4 as randomUUID } from 'uuid';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import {
  clearReleaseConditions,
  loadReleaseConditions,
  submitReleaseConditions,
  updateOutcomesAndReleaseConditions,
} from './ReleaseConditionsActionFactory';

import BondTypeSection from '../../components/releaseconditions/BondTypeSection';
import CaseInformation from '../../components/releaseconditions/CaseInformation';
import ConditionsSection from '../../components/releaseconditions/ConditionsSection';
import DecisionSection from '../../components/releaseconditions/DecisionSection';
import HearingsForm from '../hearings/HearingsForm';
import LogoLoader from '../../components/LogoLoader';
import NoContactPeople from '../../components/releaseconditions/NoContactPeopleSection';
import OutcomeSection from '../../components/releaseconditions/OutcomeSection';
import PSAStats from '../../components/releaseconditions/PSAStats';
import WarrantSection from '../../components/releaseconditions/WarrantSection';
import {
  getEntityKeyId,
  getEntityProperties,
  getFirstNeighborValue,
  getNeighborDetailsForEntitySet
} from '../../utils/DataUtils';
import { formatJudgeName } from '../../utils/HearingUtils';
import { getMostRecentPSA } from '../../utils/PSAUtils';
import { OL } from '../../utils/consts/Colors';
import { RELEASE_CONDITIONS } from '../../utils/consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { EDM, PSA_ASSOCIATION, PSA_NEIGHBOR } from '../../utils/consts/FrontEndStateConsts';
import {
  BOND_AMOUNTS,
  BOND_TYPES,
  BOND_TYPE_OPTIONS,
  CONDITION_LIST,
  C_247_MAPPINGS,
  NO_CONTACT_TYPES,
  OTHER_OUTCOMES,
  OUTCOMES,
  RELEASES,
  WARRANTS
} from '../../utils/consts/ReleaseConditionConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';
import { HEARINGS_ACTIONS } from '../../utils/consts/redux/HearingsConsts';
import { getReqState, requestIsPending, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';
import { RELEASE_COND_ACTIONS, RELEASE_COND_DATA } from '../../utils/consts/redux/ReleaseConditionsConsts';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { CREATE_ASSOCIATIONS, createAssociations } from '../../utils/data/DataActions';
import { refreshHearingAndNeighbors } from '../hearings/HearingsActions';

const { OPENLATTICE_ID_FQN } = Constants;

const {
  RCM_RESULTS,
  JUDGES,
  PEOPLE,
  PSA_SCORES,
} = APP_TYPES;

const RELEASE_CONDITIONS_FQN = APP_TYPES.RELEASE_CONDITIONS;
const OUTCOMES_FQN = APP_TYPES.OUTCOMES;
const BONDS_FQN = APP_TYPES.BONDS;

const {
  OUTCOME,
  OTHER_OUTCOME_TEXT,
  RELEASE,
  WARRANT,
  BOND_TYPE,
  CONDITIONS,
  CHECKIN_FREQUENCY,
  C247_TYPES,
  OTHER_CONDITION_TEXT,
  NO_CONTACT_PEOPLE
} = RELEASE_CONDITIONS;

const { CASH, SURETY } = BOND_AMOUNTS;

const { ENTITY_KEY_ID, TYPE } = PROPERTY_TYPES;

const NO_RELEASE_CONDITION = 'No release';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: ${OL.GREY01};

  h1 {
    text-align: left;
    font-size: 16px;
    font-weight: 600;
  }

  h2 {
    text-align: left;
    font-size: 16px;
    font-weight: normal;
  }

  h3 {
    text-align: left;
    font-size: 14px;
    font-weight: normal;
  }

  div:last-child {
    border: none;
  }
`;

const RadioWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  margin: 0 3px;

  &:first-child {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }

  label {
    font-size: 12px;
    font-weight: 600;
    width: 100%;
  }
`;

const Row = styled.div`
  padding: 15px 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
`;

const DEFAULT_PERSON_ROW = {
  [PROPERTY_TYPES.PERSON_TYPE]: NO_CONTACT_TYPES.VICTIM,
  [PROPERTY_TYPES.PERSON_NAME]: 'Unknown'
};

const BLANK_PERSON_ROW = {
  [PROPERTY_TYPES.PERSON_TYPE]: null,
  [PROPERTY_TYPES.PERSON_NAME]: ''
};

const default247 = ['Other'];
const noContactDefaults = [{ ...DEFAULT_PERSON_ROW }, { ...BLANK_PERSON_ROW }];

type Props = {
  actions :{
    clearReleaseConditions :() => void;
    createAssociations :RequestSequence;
    loadReleaseConditions :RequestSequence;
    refreshHearingAndNeighbors :RequestSequence;
    submitReleaseConditions :RequestSequence;
    updateOutcomesAndReleaseConditions :RequestSequence;
  };
  backToSelection :() => void;
  creatingAssociations :boolean;
  hasOutcome :boolean;
  hearingNeighbors :Map;
  hearingEntityKeyId :string;
  loadReleaseConditionsReqState :RequestState;
  openClosePSAModal :() => void;
  personNeighbors :Map;
  refreshHearingAndNeighborsReqState :RequestState;
  selectedHearing :Map;
  selectedOrganizationId :string;
  submitReleaseConditionsReqState :RequestState;
  updateOutcomesAndReleaseConditionsReqState :RequestState;
  violentCourtCharges :Map;
};

type State = {
  bondType :?string;
  c247Types :List;
  cashOnlyAmount :string;
  cashSuretyAmount :string;
  checkinFrequency :?string;
  conditions :string[];
  disabled :boolean;
  editingHearing :boolean;
  noContactPeople :List;
  otherConditionText :string;
  otherOutcomeText :string;
  outcome :?string;
  release :?string;
  warrant :string;
};

const INITIAL_STATE = {
  [OUTCOME]: '',
  [OTHER_OUTCOME_TEXT]: '',
  [RELEASE]: '',
  [WARRANT]: '',
  [BOND_TYPE]: '',
  cashOnlyAmount: '',
  cashSuretyAmount: '',
  [CONDITIONS]: [],
  [CHECKIN_FREQUENCY]: '',
  [C247_TYPES]: default247,
  [OTHER_CONDITION_TEXT]: '',
  [NO_CONTACT_PEOPLE]: noContactDefaults,
  disabled: false,
  editingHearing: false
};

class ReleaseConditionsContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  loadReleaseConditions = (props :Props) => {
    const { actions, hearingEntityKeyId } = props;
    actions.loadReleaseConditions({ hearingId: hearingEntityKeyId });
  }

  componentDidMount() {
    const { selectedOrganizationId } = this.props;
    if (selectedOrganizationId) {
      this.loadReleaseConditions(this.props);
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      loadReleaseConditionsReqState,
      refreshHearingAndNeighborsReqState,
      submitReleaseConditionsReqState,
      updateOutcomesAndReleaseConditionsReqState,
    } = this.props;
    const {
      loadReleaseConditionsReqState: prevLoadReleaseConditionsReqState,
      refreshHearingAndNeighborsReqState: prevRefreshHearingAndNeighborsReqState,
      submitReleaseConditionsReqState: prevSubmitReleaseConditionsReqState,
      updateOutcomesAndReleaseConditionsReqState: prevUpdateOutcomesAndReleaseConditionsReqState,
    } = prevProps;
    const wasLoadingReleaseConditions = requestIsPending(prevLoadReleaseConditionsReqState);
    const loadedReleaseConditions = requestIsSuccess(loadReleaseConditionsReqState);

    const wasUpdatingOutcomesAndReleaseConditions = requestIsPending(prevUpdateOutcomesAndReleaseConditionsReqState);
    const updatedOutcomesAndReleaseConditions = requestIsSuccess(updateOutcomesAndReleaseConditionsReqState);

    const wasSubmittingReleaseConditions = requestIsPending(prevSubmitReleaseConditionsReqState);
    const submittedReleaseConditions = requestIsSuccess(submitReleaseConditionsReqState);

    const wasRefreshingHearingAndNeighbors = requestIsPending(prevRefreshHearingAndNeighborsReqState);
    const refreshedHearingAndNeighbors = requestIsSuccess(refreshHearingAndNeighborsReqState);

    const shouldInitializeState = (wasLoadingReleaseConditions && loadedReleaseConditions)
      || (wasUpdatingOutcomesAndReleaseConditions && updatedOutcomesAndReleaseConditions)
      || (wasSubmittingReleaseConditions && submittedReleaseConditions)
      || (wasRefreshingHearingAndNeighbors && refreshedHearingAndNeighbors);

    if (shouldInitializeState) this.getStateFromProps(this.props);

    const { hearingEntityKeyId } = this.props;

    if (hearingEntityKeyId !== prevProps.hearingEntityKeyId) {
      this.loadReleaseConditions(this.props);
      this.getStateFromProps(this.props);
    }
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.clearReleaseConditions();
  }

  refreshHearingsNeighborsCallback = () => {
    const { hearingEntityKeyId } = this.props;
    const { actions } = this.props;
    actions.refreshHearingAndNeighbors({ hearingEntityKeyId });
  }

  getJudgeEntity = (props :Props) => {
    const { selectedHearing, hearingNeighbors } = props;
    const judgeEntity = getNeighborDetailsForEntitySet(hearingNeighbors, JUDGES);
    const judgeAssociationEntityKeyId = hearingNeighbors
      .getIn([JUDGES, PSA_ASSOCIATION.DETAILS, OPENLATTICE_ID_FQN, 0], '');
    const judgeAssociationEntitySetId = hearingNeighbors.getIn([JUDGES, PSA_ASSOCIATION.ENTITY_SET, 'id'], '');
    const judgesNameFromHearingComments = selectedHearing.getIn([PROPERTY_TYPES.HEARING_COMMENTS, 0], 'N/A');

    const judgeName = judgeEntity.size ? formatJudgeName(judgeEntity) : judgesNameFromHearingComments;

    return {
      judgeEntity,
      judgeName,
      judgeAssociationEntityKeyId,
      judgeAssociationEntitySetId
    };
  }

  getNeighborEntities = (props :Props) => {
    // $FlowFixMe
    const { hearingNeighbors, psaNeighbors } = props;
    const defaultBonds = hearingNeighbors.get(BONDS_FQN, List());
    const defaultConditions = hearingNeighbors.get(RELEASE_CONDITIONS_FQN, List());
    const defaultRCM = psaNeighbors.getIn([RCM_RESULTS, PSA_NEIGHBOR.DETAILS], Map());
    const psaEntity = hearingNeighbors.getIn([PSA_SCORES, PSA_NEIGHBOR.DETAILS], Map());
    const personEntity = hearingNeighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    let defaultOutcome = hearingNeighbors.get(OUTCOMES_FQN, Map());

    defaultOutcome = defaultOutcome.size ? defaultOutcome : defaultRCM;

    return {
      defaultBonds,
      defaultConditions,
      defaultRCM,
      defaultOutcome,
      psaEntity,
      personEntity
    };
  }

  renderCaseInformation = () => {
    const {
      personNeighbors,
      hearingNeighbors,
      violentCourtCharges,
      selectedOrganizationId
    } = this.props;
    const violentChargeList = violentCourtCharges.get(selectedOrganizationId, Map());
    return (
      <CaseInformation
          violentChargeList={violentChargeList}
          personNeighbors={personNeighbors}
          hearingNeighbors={hearingNeighbors} />
    );
  }

  getStateFromProps = (props :Props) => {
    const { hasOutcome } = props;
    const {
      defaultBonds,
      defaultConditions,
      defaultOutcome
    } = this.getNeighborEntities(props);

    if (hasOutcome) {
      let bondOption = '';
      let cashOnlyAmount = '';
      let cashSuretyAmount = '';
      defaultBonds.forEach((bond) => {
        const {
          [PROPERTY_TYPES.BOND_TYPE]: bondType,
          [PROPERTY_TYPES.BOND_AMOUNT]: bondAmount,
        } = getEntityProperties(bond, [PROPERTY_TYPES.BOND_TYPE, PROPERTY_TYPES.BOND_AMOUNT]);
        if (bondType === BOND_TYPES.CASH_ONLY) {
          bondOption = BOND_TYPE_OPTIONS.CASH_ONLY_OR_SURETY;
          cashOnlyAmount = bondAmount;
        }
        else if (bondType === BOND_TYPES.CASH_SURETY) {
          bondOption = BOND_TYPE_OPTIONS.CASH_ONLY_OR_SURETY;
          cashSuretyAmount = bondAmount;
        }
        else {
          bondOption = bondType;
        }
      });

      let conditionsByType = Map();
      defaultConditions.forEach((condition) => {
        const type = condition.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.TYPE, 0]);
        conditionsByType = conditionsByType.set(type, conditionsByType.get(type, List()).push(
          condition.get(PSA_NEIGHBOR.DETAILS, (condition || Map())) // check for old data
        ));
      });

      const c247Types = conditionsByType.get(CONDITION_LIST.C_247, List()).map((condition) => {
        const planType = getFirstNeighborValue(condition, PROPERTY_TYPES.PLAN_TYPE);
        const frequency = getFirstNeighborValue(condition, PROPERTY_TYPES.FREQUENCY);
        return frequency ? `${planType} ${frequency}` : planType;
      });

      const noContactPeople = conditionsByType.get(CONDITION_LIST.NO_CONTACT, List()).map((condition) => {
        const personType = getFirstNeighborValue(condition, PROPERTY_TYPES.PERSON_TYPE);
        const personName = getFirstNeighborValue(condition, PROPERTY_TYPES.PERSON_NAME);
        return {
          [PROPERTY_TYPES.PERSON_TYPE]: personType,
          [PROPERTY_TYPES.PERSON_NAME]: personName
        };
      });

      const outcome = getFirstNeighborValue(defaultOutcome, PROPERTY_TYPES.OUTCOME);
      const otherOutcomeText = getFirstNeighborValue(defaultOutcome, PROPERTY_TYPES.OTHER_TEXT);

      let warrant = '';
      let release = '';
      if (outcome === OTHER_OUTCOMES.FTA) {
        warrant = bondOption ? WARRANTS.WARRANT : WARRANTS.NO_WARRANT;
      }
      else if (outcome !== OTHER_OUTCOMES.FTA) {
        release = bondOption ? RELEASES.RELEASED : RELEASES.HELD;
      }

      this.setState({
        [OUTCOME]: outcome,
        [OTHER_OUTCOME_TEXT]: otherOutcomeText,
        [WARRANT]: warrant,
        [RELEASE]: release,
        [BOND_TYPE]: bondOption,
        [CASH]: cashOnlyAmount,
        [SURETY]: cashSuretyAmount,
        [CONDITIONS]: conditionsByType.keySeq().toJS(),
        [CHECKIN_FREQUENCY]: conditionsByType
          .getIn([CONDITION_LIST.CHECKINS, 0, PROPERTY_TYPES.FREQUENCY, 0]),
        [C247_TYPES]: c247Types,
        [OTHER_CONDITION_TEXT]: conditionsByType
          .getIn([CONDITION_LIST.OTHER, 0, PROPERTY_TYPES.OTHER_TEXT, 0], ''),
        [NO_CONTACT_PEOPLE]: noContactPeople.size === 0 ? noContactDefaults : noContactPeople,
        disabled: true,
      });
    }
    else {
      this.setState({ [NO_CONTACT_PEOPLE]: noContactDefaults });
    }
  }

  handleNumberInputChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const valueNum = Number.parseFloat(value);
    if (!value.length
      || (!Number.isNaN(valueNum) && (`${valueNum}` === `${value}` || `${valueNum}.` === `${value}`))) {
      this.setState({ [name]: value });
    }
  }

  handleCheckboxChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    const { state } = this;
    let values;
    if (List.isList(state[name])) {
      values = state[name].toJS();
    }
    else {
      values = state[name];
    }
    if (checked && !values.includes(value)) {
      values.push(value);
    }
    if (!checked && values.includes(value)) {
      values.splice(values.indexOf(value), 1);
    }

    this.setState({ [name]: values });
  }

  handleInputChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const state :State = { ...this.state, [name]: value };
    const otherOutcomes = Object.values(OTHER_OUTCOMES);
    switch (name) {
      case 'outcome': {
        if (!otherOutcomes.includes(value)) {
          state[OTHER_OUTCOME_TEXT] = '';
        }
        if (value !== OTHER_OUTCOMES.FTA) {
          state[WARRANT] = '';
        }
        if (otherOutcomes.includes(value)) {
          state[RELEASE] = '';
        }
        break;
      }

      case 'release': {
        if (value === RELEASES.HELD) {
          state[BOND_TYPE] = '';
          state[CASH] = '';
          state[SURETY] = '';
          state[CONDITIONS] = [];
          state[CHECKIN_FREQUENCY] = '';
          state[C247_TYPES] = default247;
          state[OTHER_CONDITION_TEXT] = '';
          state[NO_CONTACT_PEOPLE] = noContactDefaults;
        }
        break;
      }

      case 'warrant': {
        if (value === WARRANTS.NO_WARRANT) {
          state[BOND_TYPE] = '';
          state[CASH] = '';
          state[SURETY] = '';
          state[CONDITIONS] = [];
          state[CHECKIN_FREQUENCY] = '';
          state[C247_TYPES] = default247;
          state[OTHER_CONDITION_TEXT] = '';
          state[NO_CONTACT_PEOPLE] = noContactDefaults;
        }
        break;
      }

      case 'bondType': {
        if (value !== BOND_TYPE_OPTIONS.CASH_ONLY_OR_SURETY) {
          state[CASH] = '';
          state[SURETY] = '';
        }
        break;
      }

      default:
        break;
    }
    if (state[RELEASE] === '' && state[WARRANT] === '') {
      state[BOND_TYPE] = '';
      state[CASH] = '';
      state[SURETY] = '';
      state[CONDITIONS] = [];
      state[CHECKIN_FREQUENCY] = '';
      state[C247_TYPES] = default247;
      state[OTHER_CONDITION_TEXT] = '';
      state[NO_CONTACT_PEOPLE] = noContactDefaults;
    }
    this.setState(state);
  }

  mapOptionsToRadioButtons = (options :{}, field :string, parentState :Object) :Element<*>[] => {
    const { disabled } = this.state;
    const stateOfTruth = parentState || this.state;
    return (
      Object.values(options).map((option) => (
        // $FlowFixMe
        <RadioWrapper key={option}>
          <Radio
              mode="button"
              name={field}
              value={option}
              checked={stateOfTruth[field] === option}
              onChange={this.handleInputChange}
              disabled={disabled}
              label={option} />
        </RadioWrapper>
      ))
    );
  }

  mapOptionsToCheckboxButtons = (options :{}, field :string, parentState :Object) :Element<*>[] => {
    const { disabled } = this.state;
    const stateOfTruth = parentState || this.state;
    return (
      Object.values(options).map((option) => (
        // $FlowFixMe
        <RadioWrapper key={option}>
          <Checkbox
              mode="button"
              name={field}
              value={option}
              checked={stateOfTruth[field].includes(option)}
              onChange={this.handleCheckboxChange}
              disabled={disabled}
              label={option} />
        </RadioWrapper>
      ))
    );
  }

  onSubmit = () => {
    const {
      outcome,
      otherOutcomeText,
      release,
      bondType,
      cashOnlyAmount,
      cashSuretyAmount,
      conditions,
      checkinFrequency,
      c247Types,
      otherConditionText,
      editingHearing
    } = this.state;

    const {
      actions,
      hearingEntityKeyId,
      openClosePSAModal
    } = this.props;

    const {
      defaultBonds,
      defaultConditions,
      defaultRCM,
      defaultOutcome,
      psaEntity,
      personEntity
    } = this.getNeighborEntities(this.props);

    let deleteConditions = List();

    const psaId = getFirstNeighborValue(psaEntity, PROPERTY_TYPES.GENERAL_ID);
    const psaScoresEKID = getFirstNeighborValue(psaEntity, ENTITY_KEY_ID);
    const personEKID = getFirstNeighborValue(personEntity, ENTITY_KEY_ID);
    const rcmResultsEKID = getFirstNeighborValue(defaultRCM, ENTITY_KEY_ID);

    const outcomeShouldSubmit = !getFirstNeighborValue(defaultOutcome, PROPERTY_TYPES.OUTCOME);
    const outcomeShouldReplace = !outcomeShouldSubmit;

    const releaseType = getFirstNeighborValue(defaultRCM, PROPERTY_TYPES.RELEASE_TYPE);
    const judgeAccepted = (outcome === OUTCOMES.ACCEPTED);

    const outcomeEntityKeyId = getEntityKeyId(defaultOutcome);
    let conditionTypes = Map();
    defaultConditions.forEach((neighbor) => {
      const {
        [ENTITY_KEY_ID]: conditionEntityKeyId,
        [TYPE]: conditionType
      } = getEntityProperties(neighbor, [ENTITY_KEY_ID, TYPE]);
      conditionTypes = conditionTypes.set(conditionType, conditionEntityKeyId);
    });
    const deleteBonds = defaultBonds.map((bond) => getEntityKeyId(bond));

    if (!this.isReadyToSubmit()) {
      return;
    }

    const startDate = DateTime.local().toISODate();
    const bondEntities = [];
    let outcomeEntity;

    if (outcomeShouldReplace) {
      outcomeEntity = {
        [PROPERTY_TYPES.OUTCOME]: outcome,
        [PROPERTY_TYPES.OTHER_TEXT]: otherOutcomeText,
        [PROPERTY_TYPES.RELEASE_TYPE]: releaseType,
        [PROPERTY_TYPES.JUDGE_ACCEPTED]: judgeAccepted,
      };
    }
    if (bondType === BOND_TYPE_OPTIONS.CASH_ONLY_OR_SURETY) {
      if (cashOnlyAmount) {
        bondEntities.push({
          [PROPERTY_TYPES.GENERAL_ID]: randomUUID(),
          [PROPERTY_TYPES.BOND_TYPE]: BOND_TYPES.CASH_ONLY,
          [PROPERTY_TYPES.BOND_AMOUNT]: cashOnlyAmount
        });
      }
      if (cashSuretyAmount) {
        bondEntities.push({
          [PROPERTY_TYPES.GENERAL_ID]: randomUUID(),
          [PROPERTY_TYPES.BOND_TYPE]: BOND_TYPES.CASH_SURETY,
          [PROPERTY_TYPES.BOND_AMOUNT]: cashSuretyAmount
        });
      }
    }
    else {
      bondEntities.push({
        [PROPERTY_TYPES.GENERAL_ID]: randomUUID(),
        [PROPERTY_TYPES.BOND_TYPE]: bondType
      });
    }

    const conditionsEntity = [];
    if (release === RELEASES.HELD) {
      conditionsEntity.push({
        [PROPERTY_TYPES.TYPE]: NO_RELEASE_CONDITION,
        [PROPERTY_TYPES.START_DATE]: startDate,
      });
      deleteConditions = conditionTypes.valueSeq();
    }
    else {
      conditions.forEach((condition) => {
        if (!conditionTypes.get(condition)) {
          const conditionObj :Object = {
            [PROPERTY_TYPES.TYPE]: condition,
            [PROPERTY_TYPES.START_DATE]: startDate,
            [PROPERTY_TYPES.GENERAL_ID]: randomUUID()
          };

          if (condition === CONDITION_LIST.CHECKINS) {
            conditionObj[PROPERTY_TYPES.FREQUENCY] = checkinFrequency;
          }

          if (condition === CONDITION_LIST.OTHER) {
            conditionObj[PROPERTY_TYPES.OTHER_TEXT] = otherConditionText;
          }

          if (condition === CONDITION_LIST.C_247) {
            c247Types.forEach((c247Type) => {
              conditionsEntity.push({
                ...conditionObj,
                ...C_247_MAPPINGS[c247Type],
                [PROPERTY_TYPES.GENERAL_ID]: randomUUID()
              });
            });
          }
          else if (condition === CONDITION_LIST.NO_CONTACT) {
            this.cleanNoContactPeopleList().forEach((noContactPerson) => {
              conditionsEntity.push({ ...conditionObj, ...noContactPerson, [PROPERTY_TYPES.GENERAL_ID]: randomUUID() });
            });
          }
          else {
            conditionsEntity.push(conditionObj);
          }
        }
      });
      conditionTypes.keySeq().forEach((conditionType) => {
        if (!conditions.includes(conditionType)) {
          deleteConditions = deleteConditions.push(conditionTypes.get(conditionType));
        }
      });
    }

    if (editingHearing) {
      actions.updateOutcomesAndReleaseConditions({
        bondEntities,
        deleteBonds,
        deleteConditions,
        rcmResultsEKID,
        hearingEKID: hearingEntityKeyId,
        outcomeEntity,
        outcomeEntityKeyId,
        personEKID,
        psaScoresEKID,
        psaId,
        releaseConditions: conditionsEntity,
      });
      this.setState({ editingHearing: false });
    }
    else {
      actions.submitReleaseConditions({
        bondEntities,
        rcmResultsEKID,
        hearingEKID: hearingEntityKeyId,
        judgeAccepted,
        outcomeSelection: outcome,
        outcomeText: otherOutcomeText,
        personEKID,
        psaScoresEKID,
        releaseConditions: conditionsEntity,
        releaseType
      });
    }
    const otherOutcomes = Object.values(OTHER_OUTCOMES);
    if (openClosePSAModal && otherOutcomes.includes(outcome)) openClosePSAModal();
  }

  cleanNoContactPeopleList :Map = () => {
    const { noContactPeople } = this.state;
    return noContactPeople.filter((obj) => obj[PROPERTY_TYPES.PERSON_TYPE] && obj[PROPERTY_TYPES.PERSON_NAME]);
  }

  isReadyToSubmit = () => {
    const { submitReleaseConditionsReqState } = this.props;
    const {
      bondType,
      c247Types,
      cashOnlyAmount,
      cashSuretyAmount,
      checkinFrequency,
      conditions,
      disabled,
      outcome,
      otherConditionText,
      release,
      warrant
    } = this.state;
    const submittingReleaseConditions = requestIsPending(submitReleaseConditionsReqState);
    const coreOutcomes = Object.values(OUTCOMES);

    const checkInRestriction = !checkinFrequency;

    if (
      disabled
      || submittingReleaseConditions
      || !outcome
      || (coreOutcomes.includes(outcome) && !(release || warrant))
      || (release && release === RELEASES.RELEASED && !bondType)
      || (warrant && warrant === WARRANTS.WARRANT && !bondType)
      || (bondType === BOND_TYPE_OPTIONS.CASH_ONLY_OR_SURETY && !(cashOnlyAmount || cashSuretyAmount))
      || (conditions.includes(CONDITION_LIST.CHECKINS) && checkInRestriction)
      || (conditions.includes(CONDITION_LIST.C_247) && !(c247Types.length || c247Types.size))
      || (conditions.includes(CONDITION_LIST.OTHER) && !otherConditionText.length)
      || (conditions.includes(CONDITION_LIST.NO_CONTACT)
        && !(this.cleanNoContactPeopleList().length || this.cleanNoContactPeopleList().size))
    ) {
      return false;
    }

    return true;
  }

  handleOnListChange = (field :string, value :string | Object, index :number) => {
    const { noContactPeople, editingHearing } = this.state;
    let newContactPeople;
    if (editingHearing && noContactPeople.size) {
      newContactPeople = noContactPeople.toJS();
    }
    else {
      newContactPeople = noContactPeople;
    }

    newContactPeople[index][field] = value.value || value;
    if (index === newContactPeople.length - 1) {
      newContactPeople.push({
        [PROPERTY_TYPES.PERSON_TYPE]: null,
        [PROPERTY_TYPES.PERSON_NAME]: ''
      });
    }
    this.setState({ [NO_CONTACT_PEOPLE]: newContactPeople });
  }

  removePersonRow = (index :number) => {
    const { noContactPeople, editingHearing } = this.state;
    let newContactPeople;
    if (editingHearing && !!noContactPeople.size) {
      newContactPeople = noContactPeople.toJS();
    }
    else {
      newContactPeople = noContactPeople;
    }
    if (newContactPeople.length > 1) {
      newContactPeople.splice(index, 1);
    }
    else {
      newContactPeople[0] = {
        [PROPERTY_TYPES.PERSON_TYPE]: null,
        [PROPERTY_TYPES.PERSON_NAME]: ''
      };
    }
    this.setState({ [NO_CONTACT_PEOPLE]: newContactPeople });
  }

  renderNoContactPeople = () => {
    const { disabled, noContactPeople } = this.state;
    let personTypeOptions = OrderedMap();
    Object.values(NO_CONTACT_TYPES).forEach((val) => {
      personTypeOptions = personTypeOptions.set(val, val);
    });
    return (
      <NoContactPeople
          disabled={disabled}
          noContactPeople={noContactPeople}
          handleOnListChange={this.handleOnListChange}
          removePersonRow={this.removePersonRow} />
    );
  }

  renderHearingInfo = () => {
    const {
      backToSelection,
      hasOutcome,
      hearingEntityKeyId,
      hearingNeighbors,
      selectedHearing
    } = this.props;
    const { psaEntity, personEntity } = this.getNeighborEntities(this.props);

    const psaEKID = getFirstNeighborValue(psaEntity, ENTITY_KEY_ID);
    const personEKID = getFirstNeighborValue(personEntity, ENTITY_KEY_ID);

    return (
      <HearingsForm
          hasOutcome={hasOutcome}
          hearing={selectedHearing}
          hearingNeighbors={hearingNeighbors}
          hearingEKID={hearingEntityKeyId}
          backToSelection={backToSelection}
          psaEKID={psaEKID}
          personEKID={personEKID} />
    );
  }

  renderOutcomesAndReleaseConditions = () => {
    const { state } = this;
    const { release, warrant } = state;
    const coreOutcomes = Object.values(OUTCOMES);
    const outcomeIsNotOther = coreOutcomes.includes(state[OUTCOME]);
    const outcomeIsFTA = state[OUTCOME] === OTHER_OUTCOMES.FTA;
    const RELEASED = release !== RELEASES.RELEASED;
    const NO_WARRANT = warrant !== WARRANTS.WARRANT;
    const {
      hearingEntityKeyId,
      hearingNeighbors,
    } = this.props;
    const person = getNeighborDetailsForEntitySet(hearingNeighbors, PEOPLE);

    return (
      <>
        <OutcomeSection
            mapOptionsToRadioButtons={this.mapOptionsToRadioButtons}
            outcome={state[OUTCOME]}
            otherOutcome={state[OTHER_OUTCOME_TEXT]}
            handleInputChange={this.handleInputChange}
            disabled={state.disabled} />
        {
          outcomeIsNotOther
            ? <DecisionSection mapOptionsToRadioButtons={this.mapOptionsToRadioButtons} />
            : null
        }
        {
          outcomeIsFTA
            ? <WarrantSection mapOptionsToRadioButtons={this.mapOptionsToRadioButtons} />
            : null
        }
        {
          RELEASED ? null : (
            <>
              <BondTypeSection
                  mapOptionsToRadioButtons={this.mapOptionsToRadioButtons}
                  handleNumberInputChange={this.handleNumberInputChange}
                  bondType={state[BOND_TYPE]}
                  cashOnlyAmount={state[CASH]}
                  cashSuretyAmount={state[SURETY]}
                  disabled={state.disabled} />
              <ConditionsSection
                  hearingEntityKeyId={hearingEntityKeyId}
                  parentState={this.state}
                  conditions={state[CONDITIONS]}
                  disabled={state.disabled}
                  handleInputChange={this.handleInputChange}
                  person={person}
                  mapOptionsToCheckboxButtons={this.mapOptionsToCheckboxButtons}
                  mapOptionsToRadioButtons={this.mapOptionsToRadioButtons}
                  otherCondition={state[OTHER_CONDITION_TEXT]}
                  renderNoContactPeople={this.renderNoContactPeople} />
            </>
          )
        }
        {
          NO_WARRANT
            ? null
            : (
              <BondTypeSection
                  mapOptionsToRadioButtons={this.mapOptionsToRadioButtons}
                  handleNumberInputChange={this.handleNumberInputChange}
                  bondType={state[BOND_TYPE]}
                  cashOnlyAmount={state[CASH]}
                  cashSuretyAmount={state[SURETY]}
                  disabled={state.disabled} />
            )
        }
      </>
    );
  }

  renderPSAInfo = () => {
    const { backToSelection, personNeighbors, selectedHearing } = this.props;
    const { psaEntity, personEntity } = this.getNeighborEntities(this.props);
    const personEKID = getFirstNeighborValue(personEntity, ENTITY_KEY_ID);
    const personPSAs = personNeighbors.get(PSA_SCORES, List());
    let psaScores = Map();
    if (psaEntity.size) {
      psaScores = psaEntity;
    }
    else if (personPSAs.size) {
      const { mostRecentPSA } = getMostRecentPSA(personPSAs);
      psaScores = mostRecentPSA;
    }
    return (
      <PSAStats
          hearing={selectedHearing}
          psaScores={psaScores}
          isAssociatedToHearing={!!psaEntity.size}
          backToSelection={backToSelection}
          personEKID={personEKID} />
    );
  }

  render() {
    const { disabled } = this.state;
    const {
      creatingAssociations,
      loadReleaseConditionsReqState,
      refreshHearingAndNeighborsReqState,
      submitReleaseConditionsReqState,
      updateOutcomesAndReleaseConditionsReqState,
    } = this.props;

    const loadingReleaseConditions = requestIsPending(loadReleaseConditionsReqState);
    const updatingOutcomesAndReleaseConditions = requestIsPending(updateOutcomesAndReleaseConditionsReqState);
    const submittingReleaseConditions = requestIsPending(submitReleaseConditionsReqState);
    const refreshingHearingAndNeighbors = requestIsPending(refreshHearingAndNeighborsReqState);

    const loading = (
      loadingReleaseConditions
      || refreshingHearingAndNeighbors
      || submittingReleaseConditions
      || updatingOutcomesAndReleaseConditions
      || creatingAssociations
    );

    const loadingText = 'Loading Hearing & Release Conditions...';

    if (loading) {
      return <LogoLoader size={30} loadingText={loadingText} />;
    }

    return (
      <Wrapper>
        { this.renderPSAInfo() }
        { this.renderHearingInfo() }
        { this.renderCaseInformation() }
        { this.renderOutcomesAndReleaseConditions() }
        {
          disabled
            ? (
              <Row>
                <Button
                    onClick={() => this.setState({
                      disabled: false,
                      editingHearing: true
                    })}>
                  Edit
                </Button>
              </Row>
            )
            : (
              <Row>
                <Button color="primary" disabled={!this.isReadyToSubmit()} onClick={this.onSubmit}>Submit</Button>
              </Row>
            )
        }
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const edm = state.get(STATE.EDM);
  const hearings = state.get(STATE.HEARINGS);
  const orgId = app.get(APP_DATA.SELECTED_ORG_ID, '');
  const releaseConditions = state.get(STATE.RELEASE_CONDITIONS);
  const data = state.get(STATE.DATA);
  return {
    app,
    [APP_DATA.SELECTED_ORG_ID]: orgId,
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS, Map()),
    [APP_DATA.ENTITY_SETS_BY_ORG]: app.get(APP_DATA.ENTITY_SETS_BY_ORG, Map()),
    [APP_DATA.FQN_TO_ID]: app.get(APP_DATA.FQN_TO_ID),

    [CHARGE_DATA.COURT_VIOLENT]: charges.get(CHARGE_DATA.COURT_VIOLENT),

    refreshHearingAndNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),

    loadReleaseConditionsReqState: getReqState(releaseConditions, RELEASE_COND_ACTIONS.LOAD_RELEASE_CONDITIONS),
    submitReleaseConditionsReqState: getReqState(releaseConditions, RELEASE_COND_ACTIONS.SUBMIT_RELEASE_CONDITIONS),
    updateOutcomesAndReleaseConditionsReqState: getReqState(
      releaseConditions, RELEASE_COND_ACTIONS.UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS
    ),
    [RELEASE_COND_DATA.SELECTED_HEARING]: releaseConditions.get(RELEASE_COND_DATA.SELECTED_HEARING),
    [RELEASE_COND_DATA.HAS_OUTCOME]: releaseConditions.get(RELEASE_COND_DATA.HAS_OUTCOME),
    [RELEASE_COND_DATA.HEARING_NEIGHBORS]: releaseConditions.get(RELEASE_COND_DATA.HEARING_NEIGHBORS),
    [RELEASE_COND_DATA.PERSON_NEIGHBORS]: releaseConditions.get(RELEASE_COND_DATA.PERSON_NEIGHBORS),
    [RELEASE_COND_DATA.PSA_NEIGHBORS]: releaseConditions.get(RELEASE_COND_DATA.PSA_NEIGHBORS),

    creatingAssociationsRS: getReqState(data, CREATE_ASSOCIATIONS)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Release Conditions Actions
    clearReleaseConditions,
    loadReleaseConditions,
    submitReleaseConditions,
    updateOutcomesAndReleaseConditions,
    // Hearings Actions
    refreshHearingAndNeighbors,
    // Submit Actions
    createAssociations,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ReleaseConditionsContainer);
