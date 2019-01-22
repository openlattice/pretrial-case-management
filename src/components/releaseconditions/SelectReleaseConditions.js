/*
 * @flow
 */

import React from 'react';
import Immutable, { Map } from 'immutable';
import styled from 'styled-components';
import moment from 'moment';
import randomUUID from 'uuid/v4';
import { Constants } from 'lattice';

import OutcomeSection from './OutcomeSection';
import DecisionSection from './DecisionSection';
import BondTypeSection from './BondTypeSection';
import ConditionsSection from './ConditionsSection';
import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import RadioButton from '../controls/StyledRadioButton';
import CheckboxButton from '../controls/StyledCheckboxButton';
import StyledInput from '../controls/StyledInput';
import DatePicker from '../datetime/DatePicker';
import SearchableSelect from '../controls/SearchableSelect';
import InfoButton from '../buttons/InfoButton';
import BasicButton from '../buttons/BasicButton';
import releaseConditionsConfig from '../../config/formconfig/ReleaseConditionsConfig';
import { NoContactRow } from './ReleaseConditionsStyledTags';
import { OL } from '../../utils/consts/Colors';
import { getTimeOptions } from '../../utils/consts/DateTimeConsts';
import { getEntitySetId } from '../../utils/AppUtils';
import {
  RELEASE_CONDITIONS,
  LIST_FIELDS,
  ID_FIELD_NAMES,
  FORM_IDS,
  HEARING_TYPES
} from '../../utils/consts/Consts';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getCourtroomOptions, getJudgeOptions, HEARING_CONSTS } from '../../utils/consts/HearingConsts';
import { PSA_NEIGHBOR, PSA_ASSOCIATION } from '../../utils/consts/FrontEndStateConsts';
import { toISODate, toISODateTime, formatDateTime } from '../../utils/FormattingUtils';
import {
  OUTCOMES,
  RELEASES,
  BOND_TYPES,
  CONDITION_LIST,
  C_247_MAPPINGS,
  NO_CONTACT_TYPES
} from '../../utils/consts/ReleaseConditionConsts';

const { RELEASE_CONDITIONS_FIELD } = LIST_FIELDS;
const { OPENLATTICE_ID_FQN } = Constants;

let {
  ASSESSED_BY,
  BONDS,
  JUDGES,
  HEARINGS
} = APP_TYPES_FQNS;

const RELEASE_CONDITIONS_FQN = APP_TYPES_FQNS.RELEASE_CONDITIONS.toString();

ASSESSED_BY = ASSESSED_BY.toString();
BONDS = BONDS.toString();
JUDGES = JUDGES.toString();
HEARINGS = HEARINGS.toString();

const {
  OUTCOME,
  OTHER_OUTCOME_TEXT,
  RELEASE,
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

const StyledDatePicker = styled(DatePicker)`
  margin-top: 10px;
  .IconWrapper {
    margin-top: 10px;
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

const BLANK_PERSON_ROW = {
  [PROPERTY_TYPES.PERSON_TYPE]: null,
  [PROPERTY_TYPES.PERSON_NAME]: ''
};

type Props = {
  app :Map<*, *>,
  allJudges :Immutable.Map<*, *>,
  backToSelection :() => void,
  defaultBond :Immutable.Map<*, *>,
  defaultConditions :Immutable.List<*>,
  defaultDMF :Immutable.Map<*, *>,
  defaultOutcome :Immutable.Map<*, *>,
  selectedOrganizationId :string,
  deleteEntity :(values :{
    entitySetId :string,
    entityKeyId :string
  }) => void,
  dmfId :string,
  hearing :Immutable.Map<*, *>,
  hearingId :string,
  hearingEntityKeyId :string,
  judgeEntitySetId :string,
  judgeEntity :Immutable.Map<*, *>,
  judgeName :string,
  jurisdiction :string,
  neighbors :Immutable.Map<*, *>,
  personId :string,
  psaId :string,
  selectedOrganizationId :string,
  replace :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
  submit :(value :{ app :Map<*, *>, config :Object, values :Object, callback? :() => void }) => void,
  replaceAssociation :(values :{
    associationEntity :Map<*, *>,
    associationEntitySetName :string,
    associationEntityKeyId :string,
    srcEntitySetName :string,
    srcEntityKeyId :string,
    dstEntitySetName :string,
    dstEntityKeyId :string,
    callback :() => void
  }) => void,
  submitCallback :() => void,
  refreshHearingsNeighborsCallback :() => void,
  submitting :boolean,
  submittedOutcomes :boolean,
  updateFqn :(values :{ allEntitySetIds :string[] }) => void,
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

class SelectReleaseConditions extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = this.getStateFromProps(props);
  }

  componentWillReceiveProps(nextProps :Props) {
    const {
      defaultDMF,
      defaultOutcome,
      defaultBond,
      defaultConditions,
      hearingEntityKeyId,
      judgeName,
      judgeEntity,
      hearing
    } = this.props;

    if (
      nextProps.defaultDMF.size !== defaultDMF.size
      || nextProps.defaultOutcome.size !== defaultOutcome.size
      || nextProps.defaultBond.size !== defaultBond.size
      || nextProps.defaultConditions.size !== defaultConditions.size
      || nextProps.hearingEntityKeyId !== hearingEntityKeyId
      || nextProps.judgeName !== judgeName
      || nextProps.judgeEntity !== judgeEntity
      || nextProps.hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0]) !== hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0])
      || nextProps.hearing.getIn([PROPERTY_TYPES.COURTROOM, 0]) !== hearing.getIn([PROPERTY_TYPES.COURTROOM, 0])
    ) {
      this.setState(this.getStateFromProps(nextProps));
    }
  }


  getStateFromProps = (props :Props) :State => {
    const {
      defaultDMF,
      defaultOutcome,
      defaultBond,
      defaultConditions,
      hearing,
      submittedOutcomes,
      judgeEntity,
      judgeName
    } = props;

    let modifyingHearing = false;
    const hearingDateTimeMoment = moment(hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
    let hearingDateTime = hearingDateTimeMoment.isValid() ? hearingDateTimeMoment : null;
    let hearingCourtroom = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');
    const otherJudgeText = '';
    const judgeId = judgeEntity ? judgeEntity.getIn([PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_ID, 0]) : null;
    const judge = judgeName || otherJudgeText;
    let newHearingDate;
    let newHearingTime;
    const editingHearing = false;

    if (this.state) {
      modifyingHearing = this.state.modifyingHearing;
      hearingDateTime = this.state.hearingDateTime;
      hearingCourtroom = this.state.hearingCourtroom;
    }

    if (submittedOutcomes) {
      const bondType = defaultBond.getIn(
        [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.BOND_TYPE, 0],
        defaultBond.getIn([PROPERTY_TYPES.BOND_TYPE, 0]) // check for old data
      );
      const bondAmount = defaultBond.getIn(
        [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.BOND_AMOUNT, 0],
        defaultBond.getIn([PROPERTY_TYPES.BOND_AMOUNT, 0], '') // check for old data
      );

      let conditionsByType = Immutable.Map();
      defaultConditions.forEach((condition) => {
        const type = condition.getIn(
          [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.CONDITION_TYPE, 0],
          condition.getIn([PROPERTY_TYPES.CONDITION_TYPE, 0]) // check for old data
        );
        conditionsByType = conditionsByType.set(type, conditionsByType.get(type, Immutable.List()).push(
          condition.get(PSA_NEIGHBOR.DETAILS, (condition || Immutable.Map())) // check for old data
        ));
      });

      const c247Types = conditionsByType.get(CONDITION_LIST.C_247, Immutable.List()).map((condition) => {
        const planType = condition.getIn(
          [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PLAN_TYPE, 0],
          condition.getIn([PROPERTY_TYPES.PLAN_TYPE, 0]) // check for old data
        );
        const frequency = condition.getIn(
          [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.FREQUENCY, 0],
          condition.getIn([PROPERTY_TYPES.FREQUENCY, 0]) // check for old data
        );
        return frequency ? `${planType} ${frequency}` : planType;
      });

      const noContactPeople = conditionsByType.get(CONDITION_LIST.NO_CONTACT, Immutable.List()).map((condition) => {
        const personType = condition.getIn(
          [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_TYPE, 0],
          condition.getIn([PROPERTY_TYPES.PERSON_TYPE, 0]) // check for old data
        );
        const personName = condition.getIn(
          [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.PERSON_NAME, 0],
          condition.getIn([PROPERTY_TYPES.PERSON_NAME, 0]) // check for old data
        );
        return {
          [PROPERTY_TYPES.PERSON_TYPE]: personType,
          [PROPERTY_TYPES.PERSON_NAME]: personName
        };
      });

      return {
        [OUTCOME]: defaultOutcome.getIn(
          [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.OUTCOME, 0],
          defaultDMF.getIn([PROPERTY_TYPES.OUTCOME, 0])
        ),
        [OTHER_OUTCOME_TEXT]: defaultOutcome.getIn(
          [PSA_NEIGHBOR.DETAILS, PROPERTY_TYPES.OTHER_TEXT, 0],
          defaultDMF.getIn([PROPERTY_TYPES.OTHER_TEXT, 0], '')
        ),
        [RELEASE]: bondType ? RELEASES.RELEASED : RELEASES.HELD,
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
    if (Immutable.List.isList(state[name])) {
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

      case 'bondType': {
        if (value !== BOND_TYPES.CASH_ONLY && value !== BOND_TYPES.CASH_SURETY) {
          state[BOND_AMOUNT] = '';
        }
        break;
      }

      default:
        break;
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
      app,
      defaultOutcome,
      defaultDMF,
      defaultBond,
      defaultConditions,
      dmfId,
      psaId,
      personId,
      neighbors,
      submit,
      refreshHearingsNeighborsCallback,
      updateFqn,
      hearingId,
      hearingEntityKeyId
    } = this.props;


    const bondTime = defaultBond.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0],
      neighbors.getIn([BONDS, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0]));
    const conditionsTime = defaultConditions.getIn([0, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0],
      neighbors.getIn(
        [RELEASE_CONDITIONS_FQN, 0, PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0]
      ));

    const bondShouldSubmit = !(defaultBond.getIn([PSA_ASSOCIATION.DETAILS, PROPERTY_TYPES.COMPLETED_DATE_TIME, 0]))
      || !bondTime
      || bondTime === conditionsTime;
    const outcomeShouldSubmit = !!defaultOutcome.getIn([PROPERTY_TYPES.OUTCOME, 0]);
    const outcomeShouldReplace = !outcomeShouldSubmit;

    const releaseType = defaultDMF.getIn([PROPERTY_TYPES.RELEASE_TYPE, 0], '');
    const judgeAccepted = (outcome === OUTCOMES.ACCEPTED);

    const outcomeEntityKeyId = defaultOutcome.getIn(
      [PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0],
      defaultOutcome.getIn([PSA_NEIGHBOR.DETAILS, OPENLATTICE_ID_FQN, 0], '')
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
      updateFqn({
        psaId,
        hearingEntityKeyId,
        conditionSubmit,
        conditionEntityKeyIds,
        bondEntity,
        bondEntityKeyId,
        outcomeEntity,
        outcomeEntityKeyId,
        callback: submit,
        refreshHearingsNeighborsCallback
      });

      this.setState({ editingHearing: false });
    }
    else {
      submit({
        app,
        config: releaseConditionsConfig,
        values: submission,
        callback: refreshHearingsNeighborsCallback
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
      release
    } = this.state;
    if (
      disabled
      || submitting
      || !outcome
      || !release
      || (outcome === OUTCOMES.OTHER && !otherOutcomeText.length)
      || (release === RELEASES.RELEASED && !bondType)
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
    const { noContactPeople, editingHearing } = this.State;
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
    let personTypeOptions = Immutable.OrderedMap();
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
      app,
      hearing,
      replace,
      submitCallback,
      hearingEntityKeyId,
      judgeEntitySetId,
      judgeEntity,
      judgeName,
      replaceAssociation,
      refreshHearingsNeighborsCallback,
      deleteEntity,
      selectedOrganizationId
    } = this.props;
    const {
      judge,
      judgeId,
      newHearingDate,
      newHearingTime,
      hearingCourtroom,
      otherJudgeText
    } = this.state;
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

    const dateTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
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
      refreshHearingsNeighborsCallback();
      submitCallback();
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
        callback: refreshHearingsNeighborsCallback
      });
    }
    if ((hearingDateTime && hearingCourtroom) || judgeIsOther) {
      const newHearing = hearing
        .set(PROPERTY_TYPES.COURTROOM, [hearingCourtroom])
        .set(PROPERTY_TYPES.DATE_TIME, [hearingDateTime.toISOString(true)])
        .set(PROPERTY_TYPES.HEARING_TYPE, [HEARING_TYPES.INITIAL_APPEARANCE])
        .set(PROPERTY_TYPES.HEARING_COMMENTS, judgeText)
        .toJS();
      replace({
        entitySetId: hearingEntitySetId,
        entitySetName: HEARINGS,
        entityKeyId: hearingEntityKeyId,
        values: newHearing,
        callback: submitCallback
      });
    }
  }

  onInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  renderHearingInfo = () => {
    const {
      judgeName,
      allJudges,
      hearing,
      jurisdiction,
      submittedOutcomes,
      backToSelection
    } = this.props;
    const {
      newHearingDate,
      newHearingTime,
      hearingCourtroom,
      modifyingHearing,
      otherJudgeText,
      judge
    } = this.state;
    const dateTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
    let date;
    let time;
    let courtroom;
    let judgeSelect;
    let hearingInfoButton;
    let otherJudge;

    const backToSelectionButton = <StyledBasicButton onClick={backToSelection}>Back to Selection</StyledBasicButton>;

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
      courtroom = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');
      judgeSelect = judgeName || 'NA';
      otherJudge = otherJudgeText;
      hearingInfoButton = (
        submittedOutcomes
          ? null
          : (
            <HearingInfoButtons>
              <StyledBasicButton
                  onClick={() => this.setState({ modifyingHearing: true })}>
                Edit
              </StyledBasicButton>
            </HearingInfoButtons>
          )
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
          {backToSelection ? backToSelectionButton : null}
          {hearingInfoButton}
        </HearingSectionAside>
      </HearingSectionWrapper>
    );
  }

  render() {
    const { state } = this;
    const RELEASED = state[RELEASE] !== RELEASES.RELEASED;
    return (
      <Wrapper>
        {this.renderHearingInfo()}
        <OutcomeSection
            mapOptionsToRadioButtons={this.mapOptionsToRadioButtons}
            outcome={state[OUTCOME]}
            otherOutcome={state[OTHER_OUTCOME_TEXT]}
            handleInputChange={this.handleInputChange}
            disabled={state.disabled} />
        <DecisionSection mapOptionsToRadioButtons={this.mapOptionsToRadioButtons} />
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

export default SelectReleaseConditions;
