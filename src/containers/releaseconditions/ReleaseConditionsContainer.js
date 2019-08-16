/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import randomUUID from 'uuid/v4';
import { bindActionCreators } from 'redux';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Constants } from 'lattice';
import { List, Map, OrderedMap } from 'immutable';
import type { RequestState } from 'redux-reqseq';

import BasicButton from '../../components/buttons/BasicButton';
import BondTypeSection from '../../components/releaseconditions/BondTypeSection';
import CaseHistoryList from '../../components/casehistory/CaseHistoryList';
import CheckboxButton from '../../components/controls/StyledCheckboxButton';
import ConditionsSection from '../../components/releaseconditions/ConditionsSection';
import DecisionSection from '../../components/releaseconditions/DecisionSection';
import HearingsForm from '../hearings/HearingsForm';
import InfoButton from '../../components/buttons/InfoButton';
import LogoLoader from '../../components/LogoLoader';
import NoContactPeople from '../../components/releaseconditions/NoContactPeopleSection';
import OutcomeSection from '../../components/releaseconditions/OutcomeSection';
import RadioButton from '../../components/controls/StyledRadioButton';
import WarrantSection from '../../components/releaseconditions/WarrantSection';
import { OL } from '../../utils/consts/Colors';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getChargeHistory } from '../../utils/CaseUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { toISODate } from '../../utils/FormattingUtils';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import { formatJudgeName } from '../../utils/HearingUtils';
import { RELEASE_CONDITIONS, JURISDICTION } from '../../utils/consts/Consts';
import {
  getCreateAssociationObject,
  getEntityKeyId,
  getEntityProperties,
  getNeighborDetailsForEntitySet,
  getFirstNeighborValue
} from '../../utils/DataUtils';
import {
  OUTCOMES,
  OTHER_OUTCOMES,
  RELEASES,
  WARRANTS,
  BOND_TYPES,
  CONDITION_LIST,
  C_247_MAPPINGS,
  NO_CONTACT_TYPES
} from '../../utils/consts/ReleaseConditionConsts';
import {
  COURT,
  EDM,
  PSA_ASSOCIATION,
  PSA_NEIGHBOR,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { HEARINGS_ACTIONS } from '../../utils/consts/redux/HearingsConsts';
import { RELEASE_COND_ACTIONS, RELEASE_COND_DATA } from '../../utils/consts/redux/ReleaseConditionsConsts';


import { createCheckinAppointments } from '../checkins/CheckInsActionFactory';
import { refreshHearingAndNeighbors } from '../hearings/HearingsActions';
import { createAssociations } from '../../utils/submit/SubmitActionFactory';
import {
  clearReleaseConditions,
  loadReleaseConditions,
  submitReleaseConditions,
  updateOutcomesAndReleaseCondtions,
} from './ReleaseConditionsActionFactory';

const { OPENLATTICE_ID_FQN } = Constants;

const {
  CHECKIN_APPOINTMENTS,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  JUDGES,
  PEOPLE,
  PSA_SCORES,
  PRETRIAL_CASES,
  REGISTERED_FOR,
  SPEAKER_RECOGNITION_PROFILES
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
  BOND_AMOUNT,
  CONDITIONS,
  CHECKIN_FREQUENCY,
  C247_TYPES,
  OTHER_CONDITION_TEXT,
  NO_CONTACT_PEOPLE
} = RELEASE_CONDITIONS;

const {
  ENTITY_KEY_ID,
  TYPE
} = PROPERTY_TYPES;

const NO_RELEASE_CONDITION = 'No release';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-x: hidden;
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
`;

const Row = styled.div`
  padding: 15px 20px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  flex-wrap: wrap;
`;

const StyledBasicButton = styled(BasicButton)`
  width: 100%;
  max-width: 210px;
  height: 40px;
  background-color: ${props => (props.update ? OL.PURPLE02 : OL.GREY08)};
  color: ${props => (props.update ? OL.WHITE : OL.GREY02)};
`;

const SubmitButton = styled(InfoButton)`
  width: 340px;
  height: 43px;
`;

const ChargeTableContainer = styled.div`
  text-align: center;
  width: 100%;
  margin: 0;
`;

const BLANK_PERSON_ROW = {
  [PROPERTY_TYPES.PERSON_TYPE]: null,
  [PROPERTY_TYPES.PERSON_NAME]: ''
};

type Props = {
  app :Map<*, *>,
  backToSelection :() => void,
  creatingAssociations :boolean,
  fqnToIdMap :Map<*, *>,
  hasOutcome :boolean,
  hearingNeighbors :Map<*, *>,
  hearingEntityKeyId :string,
  loadReleaseConditionsReqState :RequestState,
  openClosePSAModal :() => void,
  personNeighbors :Map<*, *>,
  psaNeighbors :Map<*, *>,
  refreshHearingAndNeighborsReqState :RequestState,
  selectedHearing :Map<*, *>,
  selectedOrganizationId :string,
  selectedOrganizationSettings :Map<*, *>,
  submitReleaseConditionsReqState :RequestState,
  updateOutcomesAndReleaseCondtionsReqState :RequestState,
  actions :{
    clearReleaseConditions :() => void;
    loadReleaseConditions :(values :{ hearingId :string }) => void,
    submitReleaseConditions :(values :{
      bondAmount :string,
      bondType :string,
      dmfResultsEKID :string,
      hearingEKID :string,
      judgeAccepted :boolean,
      outcomeSelection :Object,
      outcomeText :string,
      personEKID :string,
      psaScoresEKID :string,
      releaseConditions :Object[],
      releaseType :string
    }) => void,
    updateOutcomesAndReleaseCondtions :(values :{
      bondEntity :Object,
      bondEntityKeyId :string,
      deleteConditions :string[],
      dmfResultsEKID :string,
      hearingEKID :string,
      outcomeEntity :Object,
      outcomeEntityKeyId :string,
      personEKID :string,
      psaScoresEKID :string,
      psaId :string,
      releaseConditions :Object[]
    }) => void,
    refreshHearingAndNeighbors :(values :{ hearingEntityKeyId :string }) => void,
    createCheckinAppointments :(values :{
      checkInAppointments :Object[],
      hearingEKID :string,
      personEKID :string
    }) => void,
    createAssociations :(values :{
      associationObjects :Object[],
      callback :() => void
    }) => void,
  },
};

type State = {
  bondAmount :string,
  bondType :?string,
  c247Types :string[],
  checkinFrequency :?string,
  conditions :string[],
  disabled :boolean,
  editingHearing :boolean,
  hearingCourtroom :string,
  hearingDateTime :Object,
  judge :string,
  judgeId :string,
  modifyingHearing :boolean,
  newHearingDate :string,
  newHearingTime :string,
  noContactPeople :Object[],
  otherConditionText :string,
  otherJudgeText :string,
  otherOutcomeText :string,
  outcome :?string,
  release :?string,
};

class ReleaseConditionsContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = this.getStateFromProps(props);
  }

  loadReleaseConditions = (props) => {
    const { actions, hearingEntityKeyId } = props;
    actions.loadReleaseConditions({ hearingId: hearingEntityKeyId });
  }

  componentDidMount() {
    const { selectedOrganizationId } = this.props;
    if (selectedOrganizationId) {
      this.loadReleaseConditions(this.props);
    }
  }

  componentWillReceiveProps(nextProps :Props) {
    const { personNeighbors, hearingEntityKeyId, selectedHearing } = this.props;

    const { defaultBond, defaultConditions, defaultOutcome } = this.getNeighborEntities(this.props);
    const { judgeEntity, judgeName } = this.getJudgeEntity(this.props);

    const nextNeighborEntities = this.getNeighborEntities(nextProps);
    const nextJudge = this.getJudgeEntity(nextProps);

    if (hearingEntityKeyId !== nextProps.hearingEntityKeyId) {
      this.loadReleaseConditions(nextProps);
      this.setState(this.getStateFromProps(nextProps));
    }

    const outComeChanged = getFirstNeighborValue(defaultOutcome, PROPERTY_TYPES.OUTCOME)
      !== getFirstNeighborValue(nextNeighborEntities.defaultOutcome, PROPERTY_TYPES.OUTCOME);

    const bondChanged = getFirstNeighborValue(defaultBond, PROPERTY_TYPES.BOND_TYPE)
      !== getFirstNeighborValue(nextNeighborEntities.defaultBond, PROPERTY_TYPES.BOND_TYPE)
      || getFirstNeighborValue(defaultBond, PROPERTY_TYPES.BOND_AMOUNT)
        !== getFirstNeighborValue(nextNeighborEntities.defaultBond, PROPERTY_TYPES.BOND_AMOUNT);

    const conditionTypes = defaultConditions.map(neighbor => getFirstNeighborValue(
      neighbor, PROPERTY_TYPES.TYPE
    ), []);

    const conditionsSizeChanged = defaultConditions.size !== nextNeighborEntities.defaultConditions.size;

    const defaultConditionsChanged = conditionsSizeChanged
      || nextNeighborEntities.defaultConditions.some((condition) => {
        const conditionType = getFirstNeighborValue(condition, PROPERTY_TYPES.TYPE);
        return !conditionTypes.includes(conditionType);
      });

    const personNeighborsLoaded = !personNeighbors.size && nextProps.personNeighbors.size;

    if (
      outComeChanged
      || bondChanged
      || defaultConditionsChanged
      || nextJudge.judgeName !== judgeName
      || nextJudge.judgeEntity !== judgeEntity
      || nextProps.hearingEntityKeyId !== hearingEntityKeyId
      || personNeighborsLoaded
      || getFirstNeighborValue(nextProps.selectedHearing, PROPERTY_TYPES.DATE_TIME)
        !== getFirstNeighborValue(selectedHearing, PROPERTY_TYPES.DATE_TIME)
      || getFirstNeighborValue(nextProps.selectedHearing, PROPERTY_TYPES.COURTROOM)
        !== getFirstNeighborValue(selectedHearing, PROPERTY_TYPES.COURTROOM)
    ) {
      this.setState(this.getStateFromProps(nextProps));
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

  getJudgeEntity = (props) => {
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

  getNeighborEntities = (props) => {
    const { hearingNeighbors, psaNeighbors } = props;
    const defaultCheckInAppointments = hearingNeighbors.get(CHECKIN_APPOINTMENTS, List());
    const defaultBond = hearingNeighbors.get(BONDS_FQN, Map());
    const defaultConditions = hearingNeighbors.get(RELEASE_CONDITIONS_FQN, List());
    const defaultDMF = psaNeighbors.getIn([DMF_RESULTS, PSA_NEIGHBOR.DETAILS], Map());
    const psaEntity = hearingNeighbors.getIn([PSA_SCORES, PSA_NEIGHBOR.DETAILS], Map());
    const personEntity = hearingNeighbors.getIn([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    let defaultOutcome = hearingNeighbors.get(OUTCOMES_FQN, Map());

    defaultOutcome = defaultOutcome.size ? defaultOutcome : defaultDMF;

    return {
      defaultCheckInAppointments,
      defaultBond,
      defaultConditions,
      defaultDMF,
      defaultOutcome,
      psaEntity,
      personEntity
    };
  }

  renderChargeTable = () => {
    const { personNeighbors, hearingNeighbors } = this.props;
    const caseHistory = hearingNeighbors.get(PRETRIAL_CASES, List())
      .map(pretrialCase => (pretrialCase.get(PSA_NEIGHBOR.DETAILS, Map())));
    const chargeHistory = getChargeHistory(personNeighbors);
    return caseHistory.size
      ? (
        <ChargeTableContainer>
          <CaseHistoryList
              isCompact
              pendingCases
              caseHistory={caseHistory}
              chargeHistory={chargeHistory} />
        </ChargeTableContainer>
      ) : null;
  }


  getStateFromProps = (props :Props) :State => {
    const { personNeighbors, selectedHearing, hasOutcome } = props;

    const {
      defaultCheckInAppointments,
      defaultBond,
      defaultConditions,
      defaultOutcome
    } = this.getNeighborEntities(props);
    const { judgeEntity, judgeName } = this.getJudgeEntity(props);

    const existingCheckInAppointmentEntityKeyIds = [];
    const personCheckInAppointments = personNeighbors.get(CHECKIN_APPOINTMENTS, Map());
    personCheckInAppointments.forEach((appointment) => {
      const entityKeyId = getFirstNeighborValue(appointment, PROPERTY_TYPES.ENTITY_KEY_ID);
      existingCheckInAppointmentEntityKeyIds.push(entityKeyId);
    });

    let modifyingHearing = false;
    const hearingDateTimeString = getFirstNeighborValue(selectedHearing, PROPERTY_TYPES.DATE_TIME);
    const hearingDateTimeMoment = moment(hearingDateTimeString);
    let hearingDateTime = hearingDateTimeMoment.isValid() ? hearingDateTimeMoment : null;
    let hearingCourtroom = getFirstNeighborValue(selectedHearing, PROPERTY_TYPES.COURTROOM);
    const otherJudgeText = '';
    const judgeId = judgeEntity ? getFirstNeighborValue(judgeEntity, PROPERTY_TYPES.PERSON_ID) : null;
    const judge = judgeName || otherJudgeText;
    let newHearingDate;
    let newHearingTime;
    const editingHearing = false;

    if (this.state) {
      modifyingHearing = this.state.modifyingHearing || modifyingHearing;
      hearingDateTime = this.state.hearingDateTime || hearingDateTime;
      hearingCourtroom = this.state.hearingCourtroom || hearingCourtroom;
    }

    if (hasOutcome) {
      const bondType = getFirstNeighborValue(defaultBond, PROPERTY_TYPES.BOND_TYPE);
      const bondAmount = getFirstNeighborValue(defaultBond, PROPERTY_TYPES.BOND_AMOUNT);

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

      let warrant = null;
      let release = null;
      if (outcome === OTHER_OUTCOMES.FTA) {
        warrant = bondType ? WARRANTS.WARRANT : WARRANTS.NO_WARRANT;
      }
      else if (outcome !== OTHER_OUTCOMES.FTA) {
        release = bondType ? RELEASES.RELEASED : RELEASES.HELD;
      }

      return {
        [OUTCOME]: outcome,
        [OTHER_OUTCOME_TEXT]: otherOutcomeText,
        [WARRANT]: warrant,
        [RELEASE]: release,
        [BOND_TYPE]: bondType,
        [BOND_AMOUNT]: bondAmount,
        [CONDITIONS]: conditionsByType.keySeq().toJS(),
        [CHECKIN_FREQUENCY]: conditionsByType
          .getIn([CONDITION_LIST.CHECKINS, 0, PROPERTY_TYPES.FREQUENCY, 0]),
        [C247_TYPES]: c247Types,
        [OTHER_CONDITION_TEXT]: conditionsByType
          .getIn([CONDITION_LIST.OTHER, 0, PROPERTY_TYPES.OTHER_TEXT, 0], ''),
        [NO_CONTACT_PEOPLE]: noContactPeople.size === 0 ? [Object.assign({}, BLANK_PERSON_ROW)] : noContactPeople,
        modifyingHearing,
        hearingDateTime,
        hearingCourtroom,
        otherJudgeText,
        judge,
        judgeId,
        disabled: true,
        defaultCheckInAppointments,
        newCheckInAppointmentEntities: [],
        existingCheckInAppointmentEntityKeyIds
      };
    }
    return {
      [OUTCOME]: null,
      [OTHER_OUTCOME_TEXT]: '',
      [RELEASE]: null,
      [WARRANT]: null,
      [BOND_TYPE]: null,
      [BOND_AMOUNT]: '',
      [CONDITIONS]: [],
      [CHECKIN_FREQUENCY]: null,
      [C247_TYPES]: [],
      [OTHER_CONDITION_TEXT]: '',
      [NO_CONTACT_PEOPLE]: [Object.assign({}, BLANK_PERSON_ROW)],
      modifyingHearing,
      newHearingDate,
      newHearingTime,
      hearingDateTime,
      hearingCourtroom,
      otherJudgeText,
      judge,
      judgeId,
      disabled: false,
      editingHearing,
      defaultCheckInAppointments,
      newCheckInAppointmentEntities: [],
      existingCheckInAppointmentEntityKeyIds
    };
  }

  handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    const valueNum = Number.parseFloat(value);
    if (!value.length
      || (!Number.isNaN(valueNum) && (`${valueNum}` === `${value}` || `${valueNum}.` === `${value}`))) {
      this.setState({ [name]: value });
    }
  }

  handleCheckboxChange = (e) => {
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

  handleInputChange = (e) => {
    const { name, value } = e.target;
    const state :State = Object.assign({}, this.state, { [name]: value });
    const otherOutcomes = Object.values(OTHER_OUTCOMES);
    switch (name) {
      case 'outcome': {
        if (!otherOutcomes.includes(value)) {
          state[OTHER_OUTCOME_TEXT] = '';
        }
        if (value !== OTHER_OUTCOMES.FTA) {
          state[WARRANT] = null;
        }
        if (otherOutcomes.includes(value)) {
          state[RELEASE] = null;
        }
        break;
      }

      case 'release': {
        if (value === RELEASES.HELD) {
          state[BOND_TYPE] = null;
          state[BOND_AMOUNT] = '';
          state[CONDITIONS] = [];
          state[CHECKIN_FREQUENCY] = null;
          state[C247_TYPES] = [];
          state[OTHER_CONDITION_TEXT] = '';
          state[NO_CONTACT_PEOPLE] = [Object.assign({}, BLANK_PERSON_ROW)];
        }
        break;
      }

      case 'warrant': {
        if (value === WARRANTS.NO_WARRANT) {
          state[BOND_TYPE] = null;
          state[BOND_AMOUNT] = '';
          state[CONDITIONS] = [];
          state[CHECKIN_FREQUENCY] = null;
          state[C247_TYPES] = [];
          state[OTHER_CONDITION_TEXT] = '';
          state[NO_CONTACT_PEOPLE] = [Object.assign({}, BLANK_PERSON_ROW)];
        }
        break;
      }

      case 'bondType': {
        if (value !== BOND_TYPES.CASH_ONLY && value !== BOND_TYPES.CASH_SURETY) {
          state[BOND_AMOUNT] = '';
        }
        break;
      }

      default:
        break;
    }
    if (state[RELEASE] === null && state[WARRANT] === null) {
      state[BOND_TYPE] = null;
      state[BOND_AMOUNT] = '';
      state[CONDITIONS] = [];
      state[CHECKIN_FREQUENCY] = null;
      state[C247_TYPES] = [];
      state[OTHER_CONDITION_TEXT] = '';
      state[NO_CONTACT_PEOPLE] = [Object.assign({}, BLANK_PERSON_ROW)];
    }
    this.setState(state);
  }

  mapOptionsToRadioButtons = (options :{}, field :string, parentState ?:Object) => {
    const { disabled } = this.state;
    const stateOfTruth = parentState || this.state;
    return (
      Object.values(options).map(option => (
        <RadioWrapper key={option}>
          <RadioButton
              large
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

  mapOptionsToCheckboxButtons = (options :{}, field :string, parentState ?:Object) => {
    const { disabled } = this.state;
    const stateOfTruth = parentState || this.state;
    return (
      Object.values(options).map(option => (
        <RadioWrapper key={option}>
          <CheckboxButton
              large
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

  getAssociationsForExistingAppointments = () => {
    const { app, fqnToIdMap, hearingEntityKeyId } = this.props;
    const { existingCheckInAppointmentEntityKeyIds } = this.state;
    const { defaultCheckInAppointments } = this.getNeighborEntities(this.props);

    const hearingCheckInAppointmentEntityKeyIds = defaultCheckInAppointments.map((checkIn) => {
      const entityKeyId = getEntityKeyId(checkIn);
      return entityKeyId;
    });
    const existingCheckInEntityKeyIds = existingCheckInAppointmentEntityKeyIds.filter(checkInEntityKeyId => (
      !hearingCheckInAppointmentEntityKeyIds.includes(checkInEntityKeyId)
    ));
    const registeredforEntitySetId = getEntitySetIdFromApp(app, REGISTERED_FOR);
    const hearingEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.HEARINGS);
    const appointmentEntitySetId = getEntitySetIdFromApp(app, CHECKIN_APPOINTMENTS);
    const dateCompletedPropertyId = fqnToIdMap.get(PROPERTY_TYPES.COMPLETED_DATE_TIME, '');
    const newAssociationEntities = { [registeredforEntitySetId]: [] };
    let milliseconds = 3;
    existingCheckInEntityKeyIds.forEach((entityKeyId) => {
      const hearingAssociation = getCreateAssociationObject({
        associationEntity: { [dateCompletedPropertyId]: [moment().add(milliseconds, 'ms').toISOString(true)] },
        srcEntitySetId: appointmentEntitySetId,
        srcEntityKeyId: entityKeyId,
        dstEntitySetId: hearingEntitySetId,
        dstEntityKeyId: hearingEntityKeyId
      });
      milliseconds += 1;
      newAssociationEntities[registeredforEntitySetId].push(hearingAssociation);
    });
    return newAssociationEntities;
  }

  onSubmit = () => {
    const {
      outcome,
      otherOutcomeText,
      release,
      bondType,
      bondAmount,
      conditions,
      checkinFrequency,
      c247Types,
      newCheckInAppointmentEntities,
      otherConditionText,
      editingHearing
    } = this.state;

    const {
      actions,
      hearingEntityKeyId,
      openClosePSAModal
    } = this.props;

    const {
      defaultBond,
      defaultConditions,
      defaultDMF,
      defaultOutcome,
      psaEntity,
      personEntity
    } = this.getNeighborEntities(this.props);

    let deleteConditions = List();

    const newAssociationEntities = this.getAssociationsForExistingAppointments();

    const psaId = getFirstNeighborValue(psaEntity, PROPERTY_TYPES.GENERAL_ID);
    const psaScoresEKID = getFirstNeighborValue(psaEntity, ENTITY_KEY_ID);
    const personEKID = getFirstNeighborValue(personEntity, ENTITY_KEY_ID);
    const dmfResultsEKID = getFirstNeighborValue(defaultDMF, ENTITY_KEY_ID);

    const outcomeShouldSubmit = !getFirstNeighborValue(defaultOutcome, PROPERTY_TYPES.OUTCOME);
    const outcomeShouldReplace = !outcomeShouldSubmit;

    const releaseType = getFirstNeighborValue(defaultDMF, PROPERTY_TYPES.RELEASE_TYPE);
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
    const bondEntityKeyId = getEntityKeyId(defaultBond);

    if (!this.isReadyToSubmit()) {
      return;
    }

    const startDate = toISODate(moment());
    let bondEntity;
    let outcomeEntity;

    if (outcomeShouldReplace) {
      outcomeEntity = {
        [PROPERTY_TYPES.OUTCOME]: outcome,
        [PROPERTY_TYPES.OTHER_TEXT]: otherOutcomeText,
        [PROPERTY_TYPES.RELEASE_TYPE]: releaseType,
        [PROPERTY_TYPES.JUDGE_ACCEPTED]: judgeAccepted,
      };
    }

    if (bondType) {
      bondEntity = {
        [PROPERTY_TYPES.BOND_TYPE]: bondType,
        [PROPERTY_TYPES.BOND_AMOUNT]: bondAmount
      };
    }
    else {
      bondEntity = {
        [PROPERTY_TYPES.BOND_TYPE]: null,
        [PROPERTY_TYPES.BOND_AMOUNT]: null
      };
    }

    const conditionsEntity = [];
    if (release === RELEASES.HELD) {
      conditionsEntity.push({
        [PROPERTY_TYPES.TYPE]: NO_RELEASE_CONDITION,
        [PROPERTY_TYPES.START_DATE]: startDate,
      });
    }
    else {
      conditions.forEach((condition) => {
        if (!conditionTypes.get(condition)) {
          const conditionObj = {
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
              conditionsEntity.push(Object.assign({}, conditionObj, C_247_MAPPINGS[c247Type], {
                [PROPERTY_TYPES.GENERAL_ID]: randomUUID()
              }));
            });
          }
          else if (condition === CONDITION_LIST.NO_CONTACT) {
            this.cleanNoContactPeopleList().forEach((noContactPerson) => {
              conditionsEntity.push(Object.assign({}, conditionObj, noContactPerson, {
                [PROPERTY_TYPES.GENERAL_ID]: randomUUID()
              }));
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

    if (Object.keys(newAssociationEntities).length) {
      actions.createAssociations({
        associationObjects: [newAssociationEntities],
        callback: this.refreshHearingsNeighborsCallback
      });
    }
    if (newCheckInAppointmentEntities.length) {
      actions.createCheckinAppointments({
        checkInAppointments: newCheckInAppointmentEntities,
        hearingEKID: hearingEntityKeyId,
        personEKID
      });
    }
    if (editingHearing) {
      actions.updateOutcomesAndReleaseCondtions({
        bondEntity,
        bondEntityKeyId,
        deleteConditions,
        dmfResultsEKID,
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
        bondAmount,
        bondType,
        dmfResultsEKID,
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

  cleanNoContactPeopleList = () => {
    const { noContactPeople } = this.state;
    return noContactPeople.filter(obj => obj[PROPERTY_TYPES.PERSON_TYPE] && obj[PROPERTY_TYPES.PERSON_NAME].length);
  }

  isReadyToSubmit = () => {
    const { submitReleaseConditionsReqState, selectedOrganizationSettings } = this.props;
    const {
      bondAmount,
      bondType,
      c247Types,
      checkinFrequency,
      conditions,
      disabled,
      outcome,
      otherConditionText,
      release,
      warrant
    } = this.state;
    const submittingReleaseConditions = requestIsPending(submitReleaseConditionsReqState);
    const settingsIncludeVoiceEnroll = selectedOrganizationSettings.get(SETTINGS.ENROLL_VOICE, false);
    const coreOutcomes = Object.values(OUTCOMES);

    const checkInRestriction = settingsIncludeVoiceEnroll ? false : !checkinFrequency;

    if (
      disabled
      || submittingReleaseConditions
      || !outcome
      || (coreOutcomes.includes(outcome) && !(release || warrant))
      || (release && release === RELEASES.RELEASED && !bondType)
      || (warrant && warrant === WARRANTS.WARRANT && !bondType)
      || ((bondType === BOND_TYPES.CASH_ONLY || bondType === BOND_TYPES.CASH_SURETY) && !bondAmount.length)
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

  handleOnListChange = (field, value, index) => {
    const { noContactPeople, editingHearing } = this.state;
    let newContactPeople;
    if (editingHearing && noContactPeople.size) {
      newContactPeople = noContactPeople.toJS();
    }
    else {
      newContactPeople = noContactPeople;
    }

    newContactPeople[index][field] = value;
    if (index === newContactPeople.length - 1) {
      newContactPeople.push({
        [PROPERTY_TYPES.PERSON_TYPE]: null,
        [PROPERTY_TYPES.PERSON_NAME]: ''
      });
    }
    this.setState({ [NO_CONTACT_PEOPLE]: newContactPeople });
  }

  removePersonRow = (index) => {
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
      psaNeighbors,
      selectedHearing
    } = this.props;
    const { psaEntity, personEntity } = this.getNeighborEntities(this.props);

    const psaEKID = getFirstNeighborValue(psaEntity, ENTITY_KEY_ID);
    const personEKID = getFirstNeighborValue(personEntity, ENTITY_KEY_ID);

    const psaContext = psaNeighbors.getIn([DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONTEXT, 0]);
    const jurisdiction = JURISDICTION[psaContext];

    return (
      <HearingsForm
          hasOutcome={hasOutcome}
          hearing={selectedHearing}
          hearingNeighbors={hearingNeighbors}
          hearingEKID={hearingEntityKeyId}
          backToSelection={backToSelection}
          psaEKID={psaEKID}
          personEKID={personEKID}
          jurisdiction={jurisdiction} />
    );
  }

  addAppointmentsToSubmission = ({ newCheckInAppointmentEntities }) => {
    if (newCheckInAppointmentEntities) this.setState({ newCheckInAppointmentEntities });
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
      personNeighbors,
      selectedOrganizationSettings
    } = this.props;
    const person = getNeighborDetailsForEntitySet(hearingNeighbors, PEOPLE);
    const { defaultCheckInAppointments } = this.getNeighborEntities(this.props);
    const personCheckInAppointments = personNeighbors.get(CHECKIN_APPOINTMENTS, Map());
    const personVoiceProfile = personNeighbors.get(SPEAKER_RECOGNITION_PROFILES, Map());
    const allCheckInAppointments = defaultCheckInAppointments.merge(personCheckInAppointments);

    const settingsIncludeVoiceEnroll = selectedOrganizationSettings.get(SETTINGS.ENROLL_VOICE, false);

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
                  bondAmount={`${state[BOND_AMOUNT]}`}
                  disabled={state.disabled} />
              <ConditionsSection
                  hearingEntityKeyId={hearingEntityKeyId}
                  parentState={this.state}
                  appointmentEntities={allCheckInAppointments}
                  addAppointmentsToSubmission={this.addAppointmentsToSubmission}
                  conditions={state[CONDITIONS]}
                  disabled={state.disabled}
                  handleInputChange={this.handleInputChange}
                  person={person}
                  personVoiceProfile={personVoiceProfile}
                  settingsIncludeVoiceEnroll={settingsIncludeVoiceEnroll}
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
                  bondAmount={`${state[BOND_AMOUNT]}`}
                  disabled={state.disabled} />
            )
        }
      </>
    );
  }

  render() {
    const {
      creatingAssociations,
      loadReleaseConditionsReqState,
      refreshHearingAndNeighborsReqState,
      submitReleaseConditionsReqState,
      updateOutcomesAndReleaseCondtionsReqState,
    } = this.props;
    const { state } = this;
    const loadingReleaseConditions = requestIsPending(loadReleaseConditionsReqState);
    const updatingOutcomesAndReleaseConditions = requestIsPending(updateOutcomesAndReleaseCondtionsReqState);
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
        { this.renderHearingInfo() }
        { this.renderChargeTable() }
        { this.renderOutcomesAndReleaseConditions() }
        {
          state.disabled
            ? (
              <Row>
                <StyledBasicButton
                    onClick={() => this.setState({
                      disabled: false,
                      editingHearing: true,
                      bondAmount: `${state.bondAmount}`
                    })}>
                  Edit
                </StyledBasicButton>
              </Row>
            )
            : (
              <Row>
                <SubmitButton disabled={!this.isReadyToSubmit()} onClick={this.onSubmit}>Submit</SubmitButton>
              </Row>
            )
        }
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const court = state.get(STATE.COURT);
  const edm = state.get(STATE.EDM);
  const hearings = state.get(STATE.HEARINGS);
  const orgId = app.get(APP_DATA.SELECTED_ORG_ID, '');
  const releaseConditions = state.get(STATE.RELEASE_CONDITIONS);
  const submit = state.get(STATE.SUBMIT);
  return {
    app,
    [APP_DATA.SELECTED_ORG_ID]: orgId,
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS, Map()),
    [APP_DATA.ENTITY_SETS_BY_ORG]: app.get(APP_DATA.ENTITY_SETS_BY_ORG, Map()),
    [APP_DATA.FQN_TO_ID]: app.get(APP_DATA.FQN_TO_ID),

    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),

    refreshHearingAndNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.REFRESH_HEARING_AND_NEIGHBORS),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),

    loadReleaseConditionsReqState: getReqState(releaseConditions, RELEASE_COND_ACTIONS.LOAD_RELEASE_CONDITIONS),
    submitReleaseConditionsReqState: getReqState(releaseConditions, RELEASE_COND_ACTIONS.SUBMIT_RELEASE_CONDITIONS),
    updateOutcomesAndReleaseCondtionsReqState: getReqState(
      releaseConditions, RELEASE_COND_ACTIONS.UPDATE_OUTCOMES_AND_RELEASE_CONDITIONS
    ),
    [RELEASE_COND_DATA.SELECTED_HEARING]: releaseConditions.get(RELEASE_COND_DATA.SELECTED_HEARING),
    [RELEASE_COND_DATA.HAS_OUTCOME]: releaseConditions.get(RELEASE_COND_DATA.HAS_OUTCOME),
    [RELEASE_COND_DATA.HEARING_NEIGHBORS]: releaseConditions.get(RELEASE_COND_DATA.HEARING_NEIGHBORS),
    [RELEASE_COND_DATA.PERSON_NEIGHBORS]: releaseConditions.get(RELEASE_COND_DATA.PERSON_NEIGHBORS),
    [RELEASE_COND_DATA.PSA_NEIGHBORS]: releaseConditions.get(RELEASE_COND_DATA.PSA_NEIGHBORS),

    [SUBMIT.CREATING_ASSOCIATIONS]: submit.get(SUBMIT.CREATING_ASSOCIATIONS),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Release Conditions Actions
    clearReleaseConditions,
    loadReleaseConditions,
    submitReleaseConditions,
    updateOutcomesAndReleaseCondtions,
    // Hearings Actions
    refreshHearingAndNeighbors,
    // Check Ins Actions
    createCheckinAppointments,
    // Submit Actions
    createAssociations,
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ReleaseConditionsContainer);
