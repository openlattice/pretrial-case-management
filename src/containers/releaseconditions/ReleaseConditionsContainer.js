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
import { NoContactRow } from '../../components/releaseconditions/ReleaseConditionsStyledTags';
import { OL } from '../../utils/consts/Colors';
import { getTimeOptions } from '../../utils/consts/DateTimeConsts';
import { getEntitySetId } from '../../utils/AppUtils';
import { getChargeHistory } from '../../utils/CaseUtils';
import { isUUID } from '../../utils/DataUtils';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { toISODate, toISODateTime, formatDateTime } from '../../utils/FormattingUtils';
import {
  formatJudgeName,
  getCourtroomOptions,
  getJudgeOptions,
  HEARING_CONSTS
} from '../../utils/consts/HearingConsts';
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
  PSA_ASSOCIATION,
  PSA_NEIGHBOR,
  RELEASE_COND,
  STATE,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as ReviewActionFactory from '../review/ReviewActionFactory';
import * as ReleaseConditionsActionFactory from './ReleaseConditionsActionFactory';
import * as CourtActionFactory from '../court/CourtActionFactory';

const { RELEASE_CONDITIONS_FIELD } = LIST_FIELDS;
const { OPENLATTICE_ID_FQN } = Constants;

let {
  ASSESSED_BY,
  DMF_RESULTS,
  DMF_RISK_FACTORS,
  JUDGES,
  HEARINGS,
  PEOPLE,
  PSA_SCORES,
  PRETRIAL_CASES
} = APP_TYPES_FQNS;

const RELEASE_CONDITIONS_FQN = APP_TYPES_FQNS.RELEASE_CONDITIONS.toString();
const OUTCOMES_FQN = APP_TYPES_FQNS.OUTCOMES.toString();
const BONDS_FQN = APP_TYPES_FQNS.BONDS.toString();

ASSESSED_BY = ASSESSED_BY.toString();
DMF_RESULTS = DMF_RESULTS.toString();
DMF_RISK_FACTORS = DMF_RISK_FACTORS.toString();
JUDGES = JUDGES.toString();
HEARINGS = HEARINGS.toString();
PEOPLE = PEOPLE.toString();
PSA_SCORES = PSA_SCORES.toString();
PRETRIAL_CASES = PRETRIAL_CASES.toString();

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
  fqnToIdMap :Map<*, *>,
  hasOutcome :boolean,
  hearingIdsRefreshing :boolean,
  hearingNeighbors :Map<*, *>,
  hearingEntityKeyId :string,
  loadingReleaseCondtions :boolean,
  personNeighbors :Map<*, *>,
  psaNeighbors :Map<*, *>,
  refreshingReleaseConditions :boolean,
  replacingAssociation :boolean,
  replacingEntity :boolean,
  selectedHearing :Map<*, *>,
  selectedOrganizationId :string,
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
    refreshHearingNeighbors :({ id :string }) => void,
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
    const { hearingEntityKeyId, selectedHearing } = this.props;

    const { defaultBond, defaultConditions, defaultOutcome } = this.getNeighborEntities(this.props);
    const { judgeEntity, judgeName } = this.getJudgeEntity(this.props);

    const nextNeighborEntities = this.getNeighborEntities(nextProps);
    const nextJudge = this.getJudgeEntity(nextProps);

    if (hearingEntityKeyId !== nextProps.hearingEntityKeyId) {
      this.loadReleaseConditions(this.props);
      this.setState(this.getStateFromProps(nextProps));
    }

    const outComeChanged = defaultOutcome.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.OUTCOME, 0])
      !== nextNeighborEntities.defaultOutcome.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.OUTCOME, 0]);

    const bondChanged = (defaultBond.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.BOND_TYPE, 0])
      !== nextNeighborEntities.defaultBond.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.BOND_TYPE, 0]))
      || (defaultBond.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.BOND_AMOUNT, 0])
        !== nextNeighborEntities.defaultBond.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.BOND_AMOUNT, 0]));

    const conditionTypes = defaultConditions.map(neighbor => neighbor.getIn(
      [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONDITION_TYPE, 0],
      neighbor.getIn([PROPERTY_TYPES.CONDITION_TYPE, 0], ''), []
    ));

    const conditionsSizeChanged = defaultConditions.size !== nextNeighborEntities.defaultConditions.size;

    const defaultConditionsChanged = conditionsSizeChanged
      || nextNeighborEntities.defaultConditions.some((condition) => {
        const conditionType = condition.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONDITION_TYPE, 0], '');
        return !conditionTypes.includes(conditionType);
      });

    if (
      outComeChanged
      || bondChanged
      || defaultConditionsChanged
      || nextJudge.judgeName !== judgeName
      || nextJudge.judgeEntity !== judgeEntity
      || nextProps.hearingEntityKeyId !== hearingEntityKeyId
      || nextProps.selectedHearing.getIn([PROPERTY_TYPES.DATE_TIME, 0])
        !== selectedHearing.getIn([PROPERTY_TYPES.DATE_TIME, 0])
      || nextProps.selectedHearing.getIn([PROPERTY_TYPES.COURTROOM, 0])
        !== selectedHearing.getIn([PROPERTY_TYPES.COURTROOM, 0])
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
    actions.refreshHearingNeighbors({ id: hearingEntityKeyId });
  }

  refreshPSANeighborsCallback = () => {
    const { psaEntity } = this.getNeighborEntities(this.props);
    const psaEntityKeyId = psaEntity.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '');
    const { actions } = this.props;
    if (psaEntityKeyId) actions.refreshPSANeighbors({ id: psaEntityKeyId });
  }

  getJudgeEntity = (props) => {
    const { selectedHearing, hearingNeighbors } = props;
    const judgeEntity = hearingNeighbors.getIn([JUDGES, PSA_NEIGHBOR.DETAILS], Map());
    const judgeEntitySetId = judgeEntity.getIn([PSA_ASSOCIATION.ENTITY_SET, 'id'], '');
    const judgesNameFromHearingComments = selectedHearing.getIn([PROPERTY_TYPES.HEARING_COMMENTS, 0], 'N/A');

    const judgeName = judgeEntity.size ? formatJudgeName(judgeEntity) : judgesNameFromHearingComments;

    return { judgeEntity, judgeName, judgeEntitySetId };
  }

  getNeighborEntities = (props) => {
    const { hearingNeighbors, psaNeighbors } = props;
    const defaultBond = hearingNeighbors.get(BONDS_FQN, Map());
    const defaultConditions = hearingNeighbors.get(RELEASE_CONDITIONS_FQN, List());
    const defaultDMF = psaNeighbors.getIn([DMF_RESULTS, PSA_NEIGHBOR.DETAILS], Map());
    const psaEntity = hearingNeighbors.getIn([PSA_SCORES, PSA_NEIGHBOR.DETAILS], Map());
    const personEntity = hearingNeighbors.get([PEOPLE, PSA_NEIGHBOR.DETAILS], Map());
    let defaultOutcome = hearingNeighbors.get(OUTCOMES_FQN, Map());

    defaultOutcome = defaultOutcome.size ? defaultOutcome : defaultDMF;

    return {
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
    const { selectedHearing, hasOutcome } = props;

    const { defaultBond, defaultConditions, defaultOutcome } = this.getNeighborEntities(props);
    const { judgeEntity, judgeName } = this.getJudgeEntity(props);

    let modifyingHearing = false;
    const hearingDateTimeMoment = moment(selectedHearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
    let hearingDateTime = hearingDateTimeMoment.isValid() ? hearingDateTimeMoment : null;
    let hearingCourtroom = selectedHearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');
    const otherJudgeText = '';
    const judgeId = judgeEntity ? judgeEntity.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0]) : null;
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
      const bondType = defaultBond.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.BOND_TYPE, 0]);
      const bondAmount = defaultBond.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.BOND_AMOUNT, 0], '');

      let conditionsByType = Map();
      defaultConditions.forEach((condition) => {
        const type = condition.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONDITION_TYPE, 0]);
        conditionsByType = conditionsByType.set(type, conditionsByType.get(type, List()).push(
          condition.get(PSA_NEIGHBOR.DETAILS, (condition || Map())) // check for old data
        ));
      });

      const c247Types = conditionsByType.get(CONDITION_LIST.C_247, List()).map((condition) => {
        const planType = condition.getIn([PROPERTY_TYPES.PLAN_TYPE, 0]);
        const frequency = condition.getIn([PROPERTY_TYPES.FREQUENCY, 0]);
        return frequency ? `${planType} ${frequency}` : planType;
      });

      const noContactPeople = conditionsByType.get(CONDITION_LIST.NO_CONTACT, List()).map((condition) => {
        const personType = condition.getIn([PROPERTY_TYPES.PERSON_TYPE, 0]);
        const personName = condition.getIn([PROPERTY_TYPES.PERSON_NAME, 0]);
        return {
          [PROPERTY_TYPES.PERSON_TYPE]: personType,
          [PROPERTY_TYPES.PERSON_NAME]: personName
        };
      });

      const outcome = defaultOutcome.getIn(
        [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.OUTCOME, 0],
        defaultOutcome.getIn([PROPERTY_TYPES.OUTCOME, 0])
      );
      const otherOutcomeText = defaultOutcome.getIn(
        [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.OTHER_TEXT, 0],
        defaultOutcome.getIn([PROPERTY_TYPES.OTHER_TEXT, 0], '')
      );
      let warrant = null;
      let release = null;
      if (outcome === OUTCOMES.FTA) {
        warrant = bondType ? WARRANTS.WARRANT : WARRANTS.NO_WARRANT;
      }
      else if (outcome !== OUTCOMES.FTA) {
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
        disabled: true
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
      editingHearing
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
    switch (name) {
      case 'outcome': {
        if (value !== OUTCOMES.OTHER) {
          state[OTHER_OUTCOME_TEXT] = '';
        }
        if (value !== OUTCOMES.FTA) {
          state[WARRANT] = null;
        }
        if (value === OUTCOMES.FTA) {
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

  mapOptionsToRadioButtons = (options :{}, field :string) => {
    const { disabled } = this.state;
    return (
      Object.values(options).map(option => (
        <RadioWrapper key={option}>
          <RadioButton
              large
              name={field}
              value={option}
              checked={this.state[field] === option}
              onChange={this.handleInputChange}
              disabled={disabled}
              label={option} />
        </RadioWrapper>
      ))
    );
  }

  mapOptionsToCheckboxButtons = (options :{}, field :string) => {
    const { disabled } = this.state;
    return (
      Object.values(options).map(option => (
        <RadioWrapper key={option}>
          <CheckboxButton
              large
              name={field}
              value={option}
              checked={this.state[field].includes(option)}
              onChange={this.handleCheckboxChange}
              disabled={disabled}
              label={option} />
        </RadioWrapper>
      ))
    );
  }

  renderConditionCheckbox = (condition, optionalLabel) => {
    const { conditions, disabled } = this.state;
    return (
      <RadioWrapper>
        <CheckboxButton
            large
            name="conditions"
            value={condition}
            checked={conditions.includes(condition)}
            label={optionalLabel || condition}
            disabled={disabled}
            onChange={this.handleConditionChange} />
      </RadioWrapper>
    );
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
      otherConditionText,
      editingHearing
    } = this.state;

    const {
      actions,
      app,
      selectedHearing,
      hearingEntityKeyId
    } = this.props;

    const {
      defaultBond,
      defaultConditions,
      defaultDMF,
      defaultOutcome,
      psaEntity,
      personEntity
    } = this.getNeighborEntities(this.props);

    const hearingId = selectedHearing.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
    const psaId = psaEntity.getIn([PROPERTY_TYPES.GENERAL_ID, 0], '');
    const personId = personEntity.getIn([PROPERTY_TYPES.PERSON_ID, 0], '');
    const dmfId = defaultDMF.getIn([PROPERTY_TYPES.GENERAL_ID, 0], '');

    const {
      updateOutcomesAndReleaseCondtions,
      submit
    } = actions;


    const bondTime = defaultBond.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0]);
    const conditionsTime = defaultConditions.getIn([0, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0]);

    const bondShouldSubmit = !(defaultBond.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0]))
      || !bondTime
      || bondTime === conditionsTime;

    const outcomeShouldSubmit = !!defaultOutcome.getIn([PROPERTY_TYPES.OUTCOME, 0]);
    const outcomeShouldReplace = !outcomeShouldSubmit;

    const releaseType = defaultDMF.getIn([PROPERTY_TYPES.RELEASE_TYPE, 0], '');
    const judgeAccepted = (outcome === OUTCOMES.ACCEPTED);

    const outcomeEntityKeyId = defaultOutcome.getIn(
      [PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0],
      defaultOutcome.getIn([OPENLATTICE_ID_FQN, 0], '')
    );
    const conditionEntityKeyIds = defaultConditions.map(neighbor => neighbor.getIn(
      [PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0],
      neighbor.getIn([OPENLATTICE_ID_FQN, 0], ''), []
    ));

    const bondEntityKeyId = defaultBond.getIn(
      [PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0],
      defaultBond.getIn([OPENLATTICE_ID_FQN, 0], '')
    );

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
        [PROPERTY_TYPES.CONDITION_TYPE]: NO_RELEASE_CONDITION,
        [PROPERTY_TYPES.START_DATE]: startDate,
        [PROPERTY_TYPES.GENERAL_ID]: randomUUID()
      });
    }
    else {
      conditions.forEach((condition) => {

        const conditionObj = {
          [PROPERTY_TYPES.CONDITION_TYPE]: condition,
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
    conditionSubmit[RELEASE_CONDITIONS_FIELD] = conditionsEntity;
    submission.bonddate = moment().add(1, 'ms').toISOString(true);
    submission.outcomedate = moment().add(2, 'ms').toISOString(true);
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
    const { submitting } = this.props;
    const {
      bondAmount,
      bondType,
      c247Types,
      checkinFrequency,
      conditions,
      disabled,
      outcome,
      otherConditionText,
      otherOutcomeText,
      release,
      warrant
    } = this.state;

    if (
      disabled
      || submitting
      || !outcome
      || !(release || warrant)
      || (outcome === OUTCOMES.OTHER && !otherOutcomeText.length)
      || (release && release === RELEASES.RELEASED && !bondType)
      || (warrant && warrant === WARRANTS.WARRANT && !bondType)
      || ((bondType === BOND_TYPES.CASH_ONLY || bondType === BOND_TYPES.CASH_SURETY) && !bondAmount.length)
      || (conditions.includes(CONDITION_LIST.CHECKINS) && !checkinFrequency)
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
      selectedHearing,
      selectedOrganizationId
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
    const { judgeEntity, judgeName, judgeEntitySetId } = this.getJudgeEntity(this.props);

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

    const associationEntitySetId = getEntitySetId(app, ASSESSED_BY, selectedOrganizationId);
    const srcEntitySetId = getEntitySetId(app, JUDGES, selectedOrganizationId);
    const hearingEntitySetId = getEntitySetId(app, HEARINGS, selectedOrganizationId);

    const associationEntitySetName = ASSESSED_BY;
    const associationEntityKeyId = judgeEntity
      ? judgeEntity.getIn([PSA_ASSOCIATION.DETAILS, OPENLATTICE_ID_FQN, 0])
      : null;
    const srcEntitySetName = JUDGES;
    const srcEntityKeyId = judgeId;
    const dstEntitySetName = HEARINGS;
    const dstEntityKeyId = hearingEntityKeyId;
    if (judgeIsOther && judgeEntitySetId) {
      deleteEntity({
        entitySetId: judgeEntitySetId,
        entityKeyId: associationEntityKeyId
      });
      this.refreshHearingsNeighborsCallback();
      this.refreshPSANeighborsCallback();
    }
    if (judgeNameEdited && judgeId && !judgeIsOther) {
      const associationEntity = {
        [ID_FIELD_NAMES.TIMESTAMP]: moment().toISOString(true),
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
        entitySetName: HEARINGS,
        entityKeyId: hearingEntityKeyId,
        values: newHearing,
        callback: this.refreshPSANeighborsCallback
      });
    }
  }

  cancelHearing = (entityKeyId) => {
    const {
      actions,
      app,
      fqnToIdMap,
      selectedOrganizationId
    } = this.props;
    const entitySetId = getEntitySetId(app, HEARINGS, selectedOrganizationId);
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
      loadingReleaseCondtions,
      psaNeighbors,
      replacingAssociation,
      replacingEntity,
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

    const hearingId = selectedHearing.getIn([PROPERTY_TYPES.CASE_ID, 0], '');
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

    const dateTime = selectedHearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
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
            value={newHearingDate || dateTime}
            placeholder={`${formatDateTime(dateTime, 'MM/DD/YYYY')}`}
            onChange={newDate => this.setState({ newHearingDate: newDate })}
            clearButton={false} />
      );
      time = (
        <StyledSearchableSelect
            options={getTimeOptions()}
            value={newHearingTime || formatDateTime(dateTime, 'HH:mm A')}
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
      date = formatDateTime(dateTime, 'MM/DD/YYYY');
      time = formatDateTime(dateTime, 'HH:mm');
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

    const loadingText = loadingReleaseCondtions
      ? 'Loading Hearing Details...'
      : 'Updating Hearing...';

    if (loadingReleaseCondtions || replacingEntity || replacingAssociation) {
      return <LogoLoader size={30} loadingText={loadingText} />;
    }


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

  renderOutcomesAndReleaseConditions = () => {
    const { state } = this;
    const { release, warrant } = state;
    const outcomeIsFTA = state[OUTCOME] === OUTCOMES.FTA;
    const RELEASED = release !== RELEASES.RELEASED;
    const NO_WARRANT = warrant !== WARRANTS.WARRANT;
    const {
      hearingIdsRefreshing,
      loadingReleaseCondtions,
      refreshingReleaseConditions,
      submitting
    } = this.props;

    if (loadingReleaseCondtions || submitting || refreshingReleaseConditions || hearingIdsRefreshing) {
      const loadingText = loadingReleaseCondtions
        ? 'Loading Release Conditions...'
        : 'Refreshing Release Conditions...';
      return <LogoLoader size={30} loadingText={loadingText} />;
    }

    return (
      <>
        <OutcomeSection
            mapOptionsToRadioButtons={this.mapOptionsToRadioButtons}
            outcome={state[OUTCOME]}
            otherOutcome={state[OTHER_OUTCOME_TEXT]}
            handleInputChange={this.handleInputChange}
            disabled={state.disabled} />
        {
          !outcomeIsFTA
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
            <div>
              <BondTypeSection
                  mapOptionsToRadioButtons={this.mapOptionsToRadioButtons}
                  handleNumberInputChange={this.handleNumberInputChange}
                  bondType={state[BOND_TYPE]}
                  bondAmount={`${state[BOND_AMOUNT]}`}
                  disabled={state.disabled} />
              <ConditionsSection
                  mapOptionsToRadioButtons={this.mapOptionsToRadioButtons}
                  mapOptionsToCheckboxButtons={this.mapOptionsToCheckboxButtons}
                  handleInputChange={this.handleInputChange}
                  renderNoContactPeople={this.renderNoContactPeople}
                  conditions={state[CONDITIONS]}
                  otherCondition={state[OTHER_CONDITION_TEXT]}
                  disabled={state.disabled} />
            </div>
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
    const { state } = this;
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
  const orgId = app.get(APP.SELECTED_ORG_ID, '');
  const releaseConditions = state.get(STATE.RELEASE_CONDITIONS);
  const submit = state.get(STATE.SUBMIT);
  return {
    app,
    [APP.SELECTED_ORG_ID]: orgId,
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS, Map()),
    [APP.ENTITY_SETS_BY_ORG]: app.get(APP.ENTITY_SETS_BY_ORG, Map()),
    [APP.FQN_TO_ID]: app.get(APP.FQN_TO_ID),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),

    [RELEASE_COND.SELECTED_HEARING]: releaseConditions.get(RELEASE_COND.SELECTED_HEARING),
    [RELEASE_COND.HAS_OUTCOME]: releaseConditions.get(RELEASE_COND.HAS_OUTCOME),
    [RELEASE_COND.HEARING_NEIGHBORS]: releaseConditions.get(RELEASE_COND.HEARING_NEIGHBORS),
    [RELEASE_COND.PERSON_NEIGHBORS]: releaseConditions.get(RELEASE_COND.PERSON_NEIGHBORS),
    [RELEASE_COND.PSA_NEIGHBORS]: releaseConditions.get(RELEASE_COND.PSA_NEIGHBORS),
    [RELEASE_COND.LOADING_RELEASE_CONDITIONS]: releaseConditions.get(RELEASE_COND.LOADING_RELEASE_CONDITIONS),
    [RELEASE_COND.REFRESHING_RELEASE_CONDITIONS]: releaseConditions.get(RELEASE_COND.REFRESHING_RELEASE_CONDITIONS),

    [COURT.ALL_JUDGES]: court.get(COURT.ALL_JUDGES),
    [COURT.HEARING_IDS_REFRESHING]: court.get(COURT.HEARING_IDS_REFRESHING),

    [SUBMIT.REPLACING_ASSOCIATION]: submit.get(SUBMIT.REPLACING_ASSOCIATION),
    [SUBMIT.REPLACING_ENTITY]: submit.get(SUBMIT.REPLACING_ENTITY),
    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
  });

  Object.keys(SubmitActionFactory).forEach((action :string) => {
    actions[action] = SubmitActionFactory[action];
  });

  Object.keys(ReleaseConditionsActionFactory).forEach((action :string) => {
    actions[action] = ReleaseConditionsActionFactory[action];
  });

  Object.keys(ReviewActionFactory).forEach((action :string) => {
    actions[action] = ReviewActionFactory[action];
  });

  Object.keys(CourtActionFactory).forEach((action :string) => {
    actions[action] = CourtActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ReleaseConditionsContainer);
