/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import randomUUID from 'uuid/v4';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Constants } from 'lattice';
import { List, Map, OrderedMap } from 'immutable';

import CaseHistoryList from '../../components/casehistory/CaseHistoryList';
import LogoLoader from '../../components/LogoLoader';
import OutcomeSection from '../../components/releaseconditions/OutcomeSection';
import DecisionSection from '../../components/releaseconditions/DecisionSection';
import WarrantSection from '../../components/releaseconditions/WarrantSection';
import BondTypeSection from '../../components/releaseconditions/BondTypeSection';
import ConditionsSection from '../../components/releaseconditions/ConditionsSection';
import ContentBlock from '../../components/ContentBlock';
import ContentSection from '../../components/ContentSection';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import RadioButton from '../../components/controls/StyledRadioButton';
import CheckboxButton from '../../components/controls/StyledCheckboxButton';
import StyledInput from '../../components/controls/StyledInput';
import DatePicker from '../../components/datetime/DatePicker';
import SearchableSelect from '../../components/controls/SearchableSelect';
import InfoButton from '../../components/buttons/InfoButton';
import BasicButton from '../../components/buttons/BasicButton';
import releaseConditionsConfig from '../../config/formconfig/ReleaseConditionsConfig';
import { OL } from '../../utils/consts/Colors';
import { getTimeOptions } from '../../utils/consts/DateTimeConsts';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getChargeHistory } from '../../utils/CaseUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { toISODate, toISODateTime, formatDateTime } from '../../utils/FormattingUtils';
import { HEARING_CONSTS } from '../../utils/consts/HearingConsts';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import { formatJudgeName, getCourtroomOptions, getJudgeOptions } from '../../utils/HearingUtils';
import { NoContactRow } from '../../components/releaseconditions/ReleaseConditionsStyledTags';
import {
  getCreateAssociationObject,
  getEntityKeyId,
  getNeighborDetailsForEntitySet,
  getFirstNeighborValue,
  isUUID
} from '../../utils/DataUtils';
import {
  RELEASE_CONDITIONS,
  LIST_FIELDS,
  ID_FIELD_NAMES,
  FORM_IDS,
  HEARING_TYPES,
  JURISDICTION
} from '../../utils/consts/Consts';
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
  APP,
  COURT,
  EDM,
  HEARINGS,
  PSA_ASSOCIATION,
  PSA_NEIGHBOR,
  RELEASE_COND,
  STATE,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';

import * as CourtActionFactory from '../court/CourtActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as HearingsActionFactory from '../hearings/HearingsActionFactory';
import * as ReleaseConditionsActionFactory from './ReleaseConditionsActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';

const { CHECKIN_APPOINTMENTS_FIELD, RELEASE_CONDITIONS_FIELD } = LIST_FIELDS;
const { OPENLATTICE_ID_FQN } = Constants;

const {
  ASSESSED_BY,
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

const NoContactPeopleWrapper = styled.div`
  width: 100%;
  padding: 15px 0 30px;
  display: flex;
  flex-direction: column;
  hr {
    margin-top: 10px;
  }
`;

const NoContactPeopleCell = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const StyledNoContactRow = styled(NoContactRow)`
  margin-bottom: 20px;
`;

const HearingSectionWrapper = styled.div`
  min-height: 160px;
  display: grid;
  grid-template-columns: 75% 25%;
  padding-bottom: 20px;
  margin: 0 -15px;
  border-bottom: 1px solid ${OL.GREY11} !important;
`;

const HearingInfoButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  button {
    width: ${props => (props.modifyingHearing ? '45%' : '100%')};
    padding: 0;
  }
  max-width: 210px;
`;

const StyledBasicButton = styled(BasicButton)`
  width: 100%;
  max-width: 210px;
  height: 40px;
  background-color: ${props => (props.update ? OL.PURPLE02 : OL.GREY08)};
  color: ${props => (props.update ? OL.WHITE : OL.GREY02)};
`;

const StyledSearchableSelect = styled(SearchableSelect)`
  margin-top: 10px;
  .SearchIcon img {
    margin: none;
  }
  input {
    width: 215px;
  }
`;

const HearingSectionAside = styled.div`
  padding-top: ${props => (props.backToSelection ? 60 : 85)}px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: ${props => (props.backToSelection ? 'space-around' : 'flex-start')};
`;

const SubmitButton = styled(InfoButton)`
  width: 340px;
  height: 43px;
`;

const NameInput = styled.input.attrs({
  type: 'text'
})`
  width: 215px;
  height: 40px;
  border: 1px solid ${OL.GREY05};
  border-radius: 3px;
  color: ${OL.BLUE03};
  font-size: 14px;
  font-weight: 400;
  padding: 0 45px 0 20px;
  margin-top: 10px;
  background-color: ${OL.WHITE};
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
  allJudges :Map<*, *>,
  backToSelection :() => void,
  creatingAssociations :boolean,
  fqnToIdMap :Map<*, *>,
  hasOutcome :boolean,
  refreshingHearingAndNeighbors :boolean,
  hearingNeighbors :Map<*, *>,
  hearingEntityKeyId :string,
  loadingReleaseCondtions :boolean,
  personNeighbors :Map<*, *>,
  psaNeighbors :Map<*, *>,
  refreshingReleaseConditions :boolean,
  refreshingSelectedHearing :boolean,
  replacingAssociation :boolean,
  replacingEntity :boolean,
  selectedHearing :Map<*, *>,
  selectedOrganizationId :string,
  selectedOrganizationSettings :Map<*, *>,
  submitting :boolean,
  actions :{
    clearReleaseConditions :() => void;
    deleteEntity :(values :{
      entitySetId :string,
      entityKeyId :string
    }) => void,
    loadHearingNeighbors :(hearingIds :string[]) => void,
    loadReleaseConditions :({ hearingId :string }) => void,
    submit :(values :{
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
    refreshPSANeighbors :({ id :string }) => void,
    replaceAssociation :(values :{
      associationEntity :Map<*, *>,
      associationEntityName :string,
      associationEntityKeyId :string,
      srcEntityName :string,
      srcEntityKeyId :string,
      dstEntityName :string,
      dstEntityKeyId :string,
      callback :() => void
    }) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
    submit :(value :{ app :Map<*, *>, config :Object, values :Object, callback? :() => void }) => void
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
    const { loadReleaseConditions } = actions;
    loadReleaseConditions({ hearingId: hearingEntityKeyId });
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
    const { clearReleaseConditions } = actions;
    clearReleaseConditions();
  }

  refreshHearingsNeighborsCallback = () => {
    const { hearingEntityKeyId } = this.props;
    const { actions } = this.props;
    actions.refreshHearingAndNeighbors({ hearingEntityKeyId });
  }

  refreshPSANeighborsCallback = () => {
    const { psaEntity } = this.getNeighborEntities(this.props);
    const psaEntityKeyId = getEntityKeyId(psaEntity);
    const { actions } = this.props;
    if (psaEntityKeyId) actions.refreshPSANeighbors({ id: psaEntityKeyId });
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

  handleConditionChange = (e) => {
    const { value, checked } = e.target;
    const { state } = this;
    const { conditions } = state;
    if (checked && !conditions.includes(value)) {
      conditions.push(value);
    }
    if (!checked && conditions.includes(value)) {
      conditions.splice(conditions.indexOf(value), 1);
      if (value === CONDITION_LIST.CHECKINS) {
        state[CHECKIN_FREQUENCY] = null;
      }
      if (value === CONDITION_LIST.C_247) {
        state[C247_TYPES] = [];
      }
      if (value === CONDITION_LIST.OTHER) {
        state[OTHER_CONDITION_TEXT] = '';
      }
      if (value === CONDITION_LIST.NO_CONTACT) {
        state[NO_CONTACT_PEOPLE] = [Object.assign({}, BLANK_PERSON_ROW)];
      }
    }
    state.conditions = conditions;
    this.setState(state);
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
      app,
      hearingEntityKeyId,
      selectedHearing
    } = this.props;

    const {
      defaultBond,
      defaultConditions,
      defaultDMF,
      defaultOutcome,
      psaEntity,
      personEntity
    } = this.getNeighborEntities(this.props);

    const newAssociationEntities = this.getAssociationsForExistingAppointments();

    const hearingId = getFirstNeighborValue(selectedHearing, PROPERTY_TYPES.CASE_ID);
    const psaId = getFirstNeighborValue(psaEntity, PROPERTY_TYPES.GENERAL_ID);
    const personId = getFirstNeighborValue(personEntity, PROPERTY_TYPES.PERSON_ID);
    const dmfId = getFirstNeighborValue(defaultDMF, PROPERTY_TYPES.GENERAL_ID);
    const outcomeId = getFirstNeighborValue(defaultOutcome, PROPERTY_TYPES.GENERAL_ID, undefined);
    const bondId = getFirstNeighborValue(defaultBond, PROPERTY_TYPES.GENERAL_ID, undefined);

    const {
      createAssociations,
      updateOutcomesAndReleaseCondtions,
      submit
    } = actions;


    const bondTime = defaultBond.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0]);
    const conditionsTime = defaultConditions.getIn([0, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0]);

    const bondShouldSubmit = !bondTime || bondTime === conditionsTime;

    const outcomeShouldSubmit = !getFirstNeighborValue(defaultOutcome, PROPERTY_TYPES.OUTCOME);
    const outcomeShouldReplace = !outcomeShouldSubmit;

    const releaseType = getFirstNeighborValue(defaultDMF, PROPERTY_TYPES.RELEASE_TYPE);
    const judgeAccepted = (outcome === OUTCOMES.ACCEPTED);

    const outcomeEntityKeyId = getEntityKeyId(defaultOutcome);
    const conditionEntityKeyIds = defaultConditions.map(neighbor => getEntityKeyId(neighbor));
    const bondEntityKeyId = getEntityKeyId(defaultBond);

    if (!this.isReadyToSubmit()) {
      return;
    }

    const startDate = toISODate(moment());
    let bondEntity;
    let outcomeEntity;

    const conditionSubmit = {
      [FORM_IDS.PERSON_ID]: personId,
      [ID_FIELD_NAMES.DMF_ID]: dmfId,
      [ID_FIELD_NAMES.PSA_ID]: psaId,
      [ID_FIELD_NAMES.HEARING_ID]: hearingId,
      [ID_FIELD_NAMES.OUTCOME_ID]: outcomeId,
      [ID_FIELD_NAMES.BOND_ID]: bondId,
      [PROPERTY_TYPES.COMPLETED_DATE_TIME]: toISODateTime(moment())
    };

    if (bondShouldSubmit) {
      conditionSubmit[ID_FIELD_NAMES.BOND_ID] = randomUUID();
      conditionSubmit[PROPERTY_TYPES.BOND_TYPE] = bondType;
      conditionSubmit[PROPERTY_TYPES.BOND_AMOUNT] = bondAmount;
      conditionSubmit.bonddate = moment().add(1, 'ms').toISOString(true);
    }

    if (outcomeShouldSubmit) {
      conditionSubmit[ID_FIELD_NAMES.OUTCOME_ID] = randomUUID();
      conditionSubmit[PROPERTY_TYPES.OUTCOME] = outcome;
      conditionSubmit[PROPERTY_TYPES.OTHER_TEXT] = otherOutcomeText;
      conditionSubmit[PROPERTY_TYPES.RELEASE_TYPE] = releaseType;
      conditionSubmit[PROPERTY_TYPES.JUDGE_ACCEPTED] = judgeAccepted;
      conditionSubmit.outcomedate = moment().add(2, 'ms').toISOString(true);
    }

    const submission = {
      [FORM_IDS.PERSON_ID]: personId,
      [ID_FIELD_NAMES.DMF_ID]: dmfId,
      [ID_FIELD_NAMES.PSA_ID]: psaId,
      [ID_FIELD_NAMES.HEARING_ID]: hearingId,

      // Outcome
      [ID_FIELD_NAMES.OUTCOME_ID]: randomUUID(),
      [PROPERTY_TYPES.OUTCOME]: outcome,
      [PROPERTY_TYPES.OTHER_TEXT]: otherOutcomeText,
      [PROPERTY_TYPES.RELEASE_TYPE]: releaseType,
      [PROPERTY_TYPES.JUDGE_ACCEPTED]: judgeAccepted,

      // Bond
      [PROPERTY_TYPES.BOND_TYPE]: bondType,
      [PROPERTY_TYPES.BOND_AMOUNT]: bondAmount,
      [PROPERTY_TYPES.COMPLETED_DATE_TIME]: toISODateTime(moment())
    };

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
      submission[ID_FIELD_NAMES.BOND_ID] = randomUUID();
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
        [PROPERTY_TYPES.GENERAL_ID]: randomUUID()
      });
    }
    else {
      conditions.forEach((condition) => {

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
      });
    }
    submission[RELEASE_CONDITIONS_FIELD] = conditionsEntity;
    if (newCheckInAppointmentEntities.length) {
      submission[CHECKIN_APPOINTMENTS_FIELD] = newCheckInAppointmentEntities;
      conditionSubmit[CHECKIN_APPOINTMENTS_FIELD] = newCheckInAppointmentEntities;
    }
    conditionSubmit[RELEASE_CONDITIONS_FIELD] = conditionsEntity;
    submission.bonddate = moment().add(1, 'ms').toISOString(true);
    submission.outcomedate = moment().add(2, 'ms').toISOString(true);

    if (Object.keys(newAssociationEntities).length) {
      createAssociations({
        associationObjects: [newAssociationEntities],
        callback: this.refreshHearingsNeighborsCallback
      });
    }
    if (editingHearing) {
      updateOutcomesAndReleaseCondtions({
        psaId,
        hearingEntityKeyId,
        conditionSubmit,
        conditionEntityKeyIds,
        bondEntity,
        bondEntityKeyId,
        outcomeEntity,
        outcomeEntityKeyId,
        callback: submit,
        refreshHearingsNeighborsCallback: this.refreshHearingsNeighborsCallback
      });
      this.setState({ editingHearing: false });
    }
    else {
      submit({
        app,
        config: releaseConditionsConfig,
        values: submission,
        callback: this.refreshHearingsNeighborsCallback
      });
    }

  }

  cleanNoContactPeopleList = () => {
    const { noContactPeople } = this.state;
    return noContactPeople.filter(obj => obj[PROPERTY_TYPES.PERSON_TYPE] && obj[PROPERTY_TYPES.PERSON_NAME].length);
  }

  isReadyToSubmit = () => {
    const { submitting, selectedOrganizationSettings } = this.props;
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
    const settingsIncludeVoiceEnroll = selectedOrganizationSettings.get(SETTINGS.ENROLL_VOICE, false);
    const coreOutcomes = Object.values(OUTCOMES);

    const checkInRestriction = settingsIncludeVoiceEnroll ? false : !checkinFrequency;

    if (
      disabled
      || submitting
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
      <NoContactPeopleWrapper>
        <h2>No contact order</h2>
        <NoContactRow>
          <h3>Person Type</h3>
          <h3>Person Name</h3>
        </NoContactRow>
        {noContactPeople.map((person, index) => (
          <StyledNoContactRow key={`${person.name}-${index}`}>
            <NoContactPeopleCell>
              <SearchableSelect
                  value={person[PROPERTY_TYPES.PERSON_TYPE]}
                  searchPlaceholder="Select"
                  onSelect={value => this.handleOnListChange(PROPERTY_TYPES.PERSON_TYPE, value, index)}
                  options={personTypeOptions}
                  disabled={disabled}
                  selectOnly
                  transparent
                  short />
            </NoContactPeopleCell>
            <NoContactPeopleCell>
              <StyledInput
                  value={person[PROPERTY_TYPES.PERSON_NAME]}
                  onChange={e => this.handleOnListChange(PROPERTY_TYPES.PERSON_NAME, e.target.value, index)}
                  disabled={disabled} />
            </NoContactPeopleCell>
            <NoContactPeopleCell>
              <StyledBasicButton onClick={() => this.removePersonRow(index)}>
                Remove
              </StyledBasicButton>
            </NoContactPeopleCell>
          </StyledNoContactRow>
        ))}
        <hr />
      </NoContactPeopleWrapper>
    );
  }

  handleHearingUpdate = () => {
    const {
      actions,
      app,
      hearingEntityKeyId,
      selectedHearing
    } = this.props;
    const {
      deleteEntity,
      replaceAssociation,
      replaceEntity
    } = actions;
    const {
      judge,
      judgeId,
      newHearingDate,
      newHearingTime,
      hearingCourtroom,
      otherJudgeText
    } = this.state;
    const {
      judgeEntity,
      judgeName,
      judgeAssociationEntityKeyId
    } = this.getJudgeEntity(this.props);

    const judgeNameEdited = judge !== judgeName;
    const judgeIsOther = (judge === 'Other');
    let judgeText;
    if (judgeIsOther) {
      this.setState({ judgeId: '' });
      judgeText = [otherJudgeText];
    }
    else {
      judgeText = [];
    }

    const dateTime = selectedHearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
    const rawTime = newHearingTime || formatDateTime(dateTime, 'HH:mm');
    this.setState({ modifyingHearing: false });
    const dateFormat = 'MM/DD/YYYY';
    const timeFormat = 'hh:mm a';
    const date = newHearingDate ? moment(newHearingDate) : moment(dateTime);
    const time = moment(rawTime, timeFormat);
    const hearingDateTime = moment(
      `${date.format(dateFormat)} ${time.format(timeFormat)}`, `${dateFormat} ${timeFormat}`
    );

    const associationEntitySetId = getEntitySetIdFromApp(app, ASSESSED_BY);
    const srcEntitySetId = getEntitySetIdFromApp(app, JUDGES);
    const hearingEntitySetId = getEntitySetIdFromApp(app, APP_TYPES.HEARINGS);

    const associationEntitySetName = ASSESSED_BY;
    const associationEntityKeyId = judgeEntity ? judgeAssociationEntityKeyId : null;
    const srcEntitySetName = JUDGES;
    const srcEntityKeyId = judgeId;
    const dstEntitySetName = APP_TYPES.HEARINGS;
    const dstEntityKeyId = hearingEntityKeyId;
    if (judgeIsOther && associationEntityKeyId) {
      deleteEntity({
        entitySetId: associationEntitySetId,
        entityKeyId: associationEntityKeyId
      });
      this.refreshHearingsNeighborsCallback();
      this.refreshPSANeighborsCallback();
    }
    if (judgeNameEdited && judgeId && !judgeIsOther) {
      const associationEntity = {
        [PROPERTY_TYPES.COMPLETED_DATE_TIME]: moment().toISOString(true),
      };
      replaceAssociation({
        associationEntity,
        associationEntitySetName,
        associationEntityKeyId,
        srcEntitySetName,
        srcEntitySetId,
        srcEntityKeyId,
        dstEntitySetName,
        dstEntityKeyId,
        associationEntitySetId,
        dstEntitySetId: hearingEntitySetId,
        callback: this.refreshHearingsNeighborsCallback
      });
    }
    if ((hearingDateTime && hearingCourtroom) || judgeIsOther) {
      const newHearing = selectedHearing
        .set(PROPERTY_TYPES.COURTROOM, [hearingCourtroom])
        .set(PROPERTY_TYPES.DATE_TIME, [hearingDateTime.toISOString(true)])
        .set(PROPERTY_TYPES.HEARING_TYPE, [HEARING_TYPES.INITIAL_APPEARANCE])
        .set(PROPERTY_TYPES.HEARING_COMMENTS, judgeText)
        .toJS();
      replaceEntity({
        entitySetId: hearingEntitySetId,
        entitySetName: APP_TYPES.HEARINGS,
        entityKeyId: hearingEntityKeyId,
        values: newHearing,
        callback: this.refreshHearingsNeighborsCallback
      });
    }
  }

  cancelHearing = (entityKeyId) => {
    const {
      actions,
      app,
      fqnToIdMap
    } = this.props;
    const entitySetId = getEntitySetIdFromApp(app, APP_TYPES.HEARINGS);
    const values = {
      [entityKeyId]: {
        [fqnToIdMap.get(PROPERTY_TYPES.HEARING_INACTIVE)]: [true]
      }
    };
    actions.updateEntity({
      entitySetId,
      entities: values,
      updateType: 'PartialReplace',
      callback: this.refreshHearingsNeighborsCallback
    });
  }

  onInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  renderHearingInfo = () => {
    const {
      allJudges,
      backToSelection,
      hasOutcome,
      hearingEntityKeyId,
      psaNeighbors,
      selectedHearing
    } = this.props;
    const {
      newHearingDate,
      newHearingTime,
      hearingCourtroom,
      modifyingHearing,
      otherJudgeText,
      judge
    } = this.state;

    const hearingId = getFirstNeighborValue(selectedHearing, PROPERTY_TYPES.CASE_ID);
    const hearingDateTime = getFirstNeighborValue(selectedHearing, PROPERTY_TYPES.DATE_TIME);
    const hearingWasCreatedManually = isUUID(hearingId);

    const disabledText = hearingWasCreatedManually ? 'Has Outcome' : 'Odyssey Hearing';
    const cancelButtonText = (hasOutcome || !hearingWasCreatedManually) ? disabledText : 'Cancel Hearing';
    const cancelHearingButton = (
      <StyledBasicButton onClick={() => this.cancelHearing(hearingEntityKeyId)} disabled={hasOutcome}>
        { cancelButtonText }
      </StyledBasicButton>
    );

    const psaContext = psaNeighbors.getIn([DMF_RISK_FACTORS, PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONTEXT, 0]);
    const jurisdiction = JURISDICTION[psaContext];

    const { judgeName } = this.getJudgeEntity(this.props);

    let date;
    let time;
    let courtroom;
    let judgeSelect;
    let hearingInfoButton;
    let otherJudge;

    const backToSelectionButton = backToSelection
      ? <StyledBasicButton onClick={backToSelection}>Back to Selection</StyledBasicButton>
      : null;

    if (modifyingHearing) {
      date = (
        <DatePicker
            paddingTop
            value={newHearingDate || hearingDateTime}
            placeholder={`${formatDateTime(hearingDateTime, 'MM/DD/YYYY')}`}
            onChange={newDate => this.setState({ newHearingDate: newDate })}
            clearButton={false} />
      );
      time = (
        <StyledSearchableSelect
            options={getTimeOptions()}
            value={newHearingTime || formatDateTime(hearingDateTime, 'HH:mm A')}
            onSelect={newTime => this.setState({ newHearingTime: newTime })}
            short />
      );
      courtroom = (
        <StyledSearchableSelect
            options={getCourtroomOptions()}
            value={hearingCourtroom}
            onSelect={newCourtroom => this.setState({ hearingCourtroom: newCourtroom })}
            short />
      );
      judgeSelect = (
        <StyledSearchableSelect
            options={getJudgeOptions(allJudges, jurisdiction)}
            value={judge}
            onSelect={judgeOption => this.setState({
              [HEARING_CONSTS.JUDGE]: judgeOption.get(HEARING_CONSTS.FULL_NAME),
              [HEARING_CONSTS.JUDGE_ID]: judgeOption.getIn([OPENLATTICE_ID_FQN, 0])
            })}
            short />
      );
      otherJudge = (
        <NameInput
            onChange={e => (this.onInputChange(e))}
            name="otherJudgeText"
            value={otherJudgeText} />
      );

      hearingInfoButton = (
        <HearingInfoButtons modifyingHearing>
          <StyledBasicButton onClick={() => this.setState({ modifyingHearing: false })}>Cancel</StyledBasicButton>
          <StyledBasicButton update onClick={this.handleHearingUpdate}>Update</StyledBasicButton>
        </HearingInfoButtons>
      );
    }
    else {
      date = formatDateTime(hearingDateTime, 'MM/DD/YYYY');
      time = formatDateTime(hearingDateTime, 'HH:mm');
      courtroom = selectedHearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');
      judgeSelect = judgeName || 'NA';
      otherJudge = otherJudgeText;
      hearingInfoButton = (
        <HearingInfoButtons>
          <StyledBasicButton
              onClick={() => this.setState({ modifyingHearing: true })}>
            Edit
          </StyledBasicButton>
        </HearingInfoButtons>
      );
    }

    const HEARING_ARR = [
      {
        label: 'Date',
        content: [date]
      },
      {
        label: 'Time',
        content: [time]
      },
      {
        label: 'Courtroom',
        content: [courtroom]
      },
      {
        label: 'Judge',
        content: [judgeSelect]
      }
    ];

    if (judge === 'Other') {
      HEARING_ARR.push(
        {
          label: "Other Judge's Name",
          content: [otherJudge]
        }
      );
    }

    const hearingInfoContent = HEARING_ARR.map(hearingItem => (
      <ContentBlock
          component={CONTENT_CONSTS.HEARINGS}
          contentBlock={hearingItem}
          key={hearingItem.label} />
    ));

    const hearingInfoSection = (
      <ContentSection
          header="Hearing"
          modifyingHearing={modifyingHearing}
          component={CONTENT_CONSTS.HEARINGS}>
        {hearingInfoContent}
      </ContentSection>
    );

    return (
      <HearingSectionWrapper>
        {hearingInfoSection}
        <HearingSectionAside backToSelection={backToSelection}>
          {modifyingHearing ? cancelHearingButton : backToSelectionButton}
          {hearingInfoButton}
        </HearingSectionAside>
      </HearingSectionWrapper>
    );
  }

  addAppointmentsToSubmission = ({ newCheckInAppointmentEntities }) => {
    if (newCheckInAppointmentEntities) this.setState({ newCheckInAppointmentEntities });
  }

  renderOutcomesAndReleaseConditions = () => {
    const { state } = this;
    console.log(state);
    const { release, warrant } = state;
    const coreOutcomes = Object.values(OUTCOMES);
    const outcomeIsNotOther = coreOutcomes.includes(state[OUTCOME])
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
      loadingReleaseCondtions,
      replacingEntity,
      replacingAssociation,
      refreshingHearingAndNeighbors,
      refreshingSelectedHearing,
      submitting,
      refreshingReleaseConditions,
      creatingAssociations
    } = this.props;
    const { state } = this;
    const loading = (
      loadingReleaseCondtions
      || replacingEntity
      || replacingAssociation
      || refreshingHearingAndNeighbors
      || refreshingSelectedHearing
      || submitting
      || refreshingReleaseConditions
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
  const orgId = app.get(APP.SELECTED_ORG_ID, '');
  const releaseConditions = state.get(STATE.RELEASE_CONDITIONS);
  const submit = state.get(STATE.SUBMIT);
  return {
    app,
    [APP.SELECTED_ORG_ID]: orgId,
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS, Map()),
    [APP.ENTITY_SETS_BY_ORG]: app.get(APP.ENTITY_SETS_BY_ORG, Map()),
    [APP.FQN_TO_ID]: app.get(APP.FQN_TO_ID),

    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),

    [HEARINGS.REFRESH_HEARING_AND_NEIGHBORS]: hearings.get(HEARINGS.REFRESH_HEARING_AND_NEIGHBORS),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),

    [RELEASE_COND.SELECTED_HEARING]: releaseConditions.get(RELEASE_COND.SELECTED_HEARING),
    [RELEASE_COND.HAS_OUTCOME]: releaseConditions.get(RELEASE_COND.HAS_OUTCOME),
    [RELEASE_COND.HEARING_NEIGHBORS]: releaseConditions.get(RELEASE_COND.HEARING_NEIGHBORS),
    [RELEASE_COND.PERSON_NEIGHBORS]: releaseConditions.get(RELEASE_COND.PERSON_NEIGHBORS),
    [RELEASE_COND.PSA_NEIGHBORS]: releaseConditions.get(RELEASE_COND.PSA_NEIGHBORS),
    [RELEASE_COND.LOADING_RELEASE_CONDITIONS]: releaseConditions.get(RELEASE_COND.LOADING_RELEASE_CONDITIONS),
    [RELEASE_COND.REFRESHING_RELEASE_CONDITIONS]: releaseConditions.get(RELEASE_COND.REFRESHING_RELEASE_CONDITIONS),
    [RELEASE_COND.REFRESHING_SELECTED_HEARING]: releaseConditions.get(RELEASE_COND.REFRESHING_SELECTED_HEARING),


    [SUBMIT.CREATING_ASSOCIATIONS]: submit.get(SUBMIT.CREATING_ASSOCIATIONS),
    [SUBMIT.REPLACING_ASSOCIATION]: submit.get(SUBMIT.REPLACING_ASSOCIATION),
    [SUBMIT.REPLACING_ENTITY]: submit.get(SUBMIT.REPLACING_ENTITY),
    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(CourtActionFactory).forEach((action :string) => {
    actions[action] = CourtActionFactory[action];
  });

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
  });

  Object.keys(HearingsActionFactory).forEach((action :string) => {
    actions[action] = HearingsActionFactory[action];
  });

  Object.keys(ReleaseConditionsActionFactory).forEach((action :string) => {
    actions[action] = ReleaseConditionsActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReleaseConditionsContainer);
