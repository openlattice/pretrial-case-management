/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import FontAwesome from 'react-fontawesome';
import styled from 'styled-components';
import moment from 'moment';
import randomUUID from 'uuid/v4';

import RadioButton from '../controls/StyledRadioButton';
import SecondaryButton from '../buttons/SecondaryButton';
import CheckboxButton from '../controls/StyledCheckboxButton';
import StyledInput from '../controls/StyledInput';
import DateTimePicker from '../controls/StyledDateTimePicker';
import SearchableSelect from '../controls/SearchableSelect';
import InfoButton from '../buttons/InfoButton';
import releaseConditionsConfig from '../../config/formconfig/ReleaseConditionsConfig';
import { RELEASE_CONDITIONS, LIST_FIELDS, ID_FIELD_NAMES, FORM_IDS } from '../../utils/consts/Consts';
import { ENTITY_SETS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { getCourtroomOptions } from '../../utils/consts/HearingConsts';
import { toISODate, toISODateTime, formatDateTime } from '../../utils/FormattingUtils';
import {
  OUTCOMES,
  RELEASES,
  BOND_TYPES,
  CONDITION_LIST,
  CHECKIN_FREQUENCIES,
  C_247_LABEL,
  C_247_TYPES,
  C_247_MAPPINGS,
  NO_CONTACT_TYPES
} from '../../utils/consts/ReleaseConditionConsts';

const { RELEASE_CONDITIONS_FIELD } = LIST_FIELDS;

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
  h1 {
    font-size: 18px;
    text-align: center;
    margin-top: 20px;
    font-family: 'Open Sans', sans-serif;
    font-weight: 700;
    color: #555e6f;
  }
`;

const InlineInput = styled(StyledInput)`
  width: 80%;
  margin-left: 10px;
`;

const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const RadioWrapper = styled.div`
  display: inline-flex;
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

const UnpaddedRow = styled(Row)`
  padding: 0 20px;
`;

const RowWrapper = styled.div`
  width: ${props => props.width}px;
`;

const InputLabel = styled.span`
  font-size: 14px;
  text-align: center;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  color: #555e6f;
  display: inline-flex;
  align-items: center;
  margin-right: 10px;
  margin-left: ${props => (props.inline ? '10px' : '0')};
`;

const Dollar = styled.span`
  position: absolute;
  height: 38px;
  display: flex;
  align-items: center;
  margin-left: 10px;
  color: #8e929b;
`;

const InvisibleButton = styled.button`
  border: none;
`;

const NoContactPeopleWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  th {
    text-align: center;
    padding-bottom: 10px;
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    color: #555e6f;
  }
`;

const HearingSectionWrapper = styled.div`
  background-color: #f0f0f7;
  padding-bottom: 20px;
  margin: 0 -15px;
  border-bottom: 1px solid #e1e1eb;
`;

const HearingRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  span {
    font-family: 'Open Sans', sans-serif;
  }
  span:nth-child(even) {
    margin: 0 20px 0 5px;
    &:last-child {
      margin-right: 0;
      color: #555e6f;
      font-size: 15px;
    }
  }
  span:nth-child(odd) {
    font-size: 11px;
    font-weight: 600;
    color: #8e929b;
    text-transform: uppercase;
  }
  ${SecondaryButton} {
    padding: 10px;
    max-width: 65px;
    margin: 0 10px;
  }

  ${InfoButton} {
    padding: 10px;
  }

  section {
    margin: 0 10px;
    width: 200px;

    span {
      margin: auto;
    }
  }
`;

const BLANK_PERSON_ROW = {
  [PROPERTY_TYPES.PERSON_TYPE]: null,
  [PROPERTY_TYPES.PERSON_NAME]: ''
};

type Props = {
  dmfId :string,
  psaId :string,
  personId :string,
  submit :(value :{ config :Object, values :Object, callback? :() => void }) => void,
  submitCallback :() => void,
  replace :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
  defaultDMF :Immutable.Map<*, *>,
  defaultBond :Immutable.Map<*, *>,
  defaultConditions :Immutable.List<*>,
  hearing :Immutable.Map<*, *>,
  hearingId :string,
  submitting :boolean
};

type State = {
  disabled :boolean,
  outcome :?string,
  otherOutcomeText :string,
  release :?string,
  bondType :?string,
  bondAmount :string,
  conditions :string[],
  checkinFrequency :?string,
  c247Types :string[],
  otherConditionText :string,
  noContactPeople :Object[],
  modifyingHearing :boolean,
  hearingDateTime :Object,
  hearingCourtroom :string
};

class SelectReleaseConditions extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = this.getStateFromProps(props);
  }

  componentWillReceiveProps(nextProps :Props) {
    const { defaultDMF, defaultBond, defaultConditions } = this.props;
    if (
      !nextProps.defaultDMF.size === defaultDMF.size
      || !nextProps.defaultBond.size === defaultBond.size
      || !nextProps.defaultConditions.size === defaultConditions.size
    ) {
      this.setState(this.getStateFromProps(nextProps));
    }
  }

  getStateFromProps = (props :Props) :State => {
    const { defaultDMF, defaultBond, defaultConditions, hearing } = props;

    let modifyingHearing = false;
    const hearingDateTimeMoment = moment(hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], ''));
    let hearingDateTime = hearingDateTimeMoment.isValid() ? hearingDateTimeMoment : null;
    let hearingCourtroom = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');

    if (this.state) {
      modifyingHearing = this.state.modifyingHearing;
      hearingDateTime = this.state.hearingDateTime;
      hearingCourtroom = this.state.hearingCourtroom;
    }

    if (defaultBond.size || defaultConditions.size) {
      const bondType = defaultBond.getIn([PROPERTY_TYPES.BOND_TYPE, 0]);
      const bondAmount = bondType === BOND_TYPES.CASH_ONLY
        ? defaultBond.getIn([PROPERTY_TYPES.BOND_AMOUNT, 0], '')
        : defaultBond.getIn([PROPERTY_TYPES.SURETY_AMOUNT, 0], '');

      let conditionsByType = Immutable.Map();
      defaultConditions.forEach((condition) => {
        const type = condition.getIn([PROPERTY_TYPES.CONDITION_TYPE, 0]);
        conditionsByType = conditionsByType.set(type, conditionsByType.get(type, Immutable.List()).push(condition));
      });

      const c247Types = conditionsByType.get(CONDITION_LIST.C_247, Immutable.List()).map((condition) => {
        const planType = condition.getIn([PROPERTY_TYPES.PLAN_TYPE, 0]);
        const frequency = condition.getIn([PROPERTY_TYPES.FREQUENCY, 0]);
        return frequency ? `${planType} ${frequency}` : planType;
      });

      const noContactPeople = conditionsByType.get(CONDITION_LIST.NO_CONTACT, Immutable.List()).map((condition) => {
        const personType = condition.getIn([PROPERTY_TYPES.PERSON_TYPE, 0]);
        const personName = condition.getIn([PROPERTY_TYPES.PERSON_NAME, 0]);
        return {
          [PROPERTY_TYPES.PERSON_TYPE]: personType,
          [PROPERTY_TYPES.PERSON_NAME]: personName
        };
      });

      return {
        [OUTCOME]: defaultDMF.getIn([PROPERTY_TYPES.OUTCOME, 0]),
        [OTHER_OUTCOME_TEXT]: defaultDMF.getIn([PROPERTY_TYPES.OTHER_TEXT, 0], ''),
        [RELEASE]: defaultBond.size ? RELEASES.RELEASED : RELEASES.HELD,
        [BOND_TYPE]: bondType,
        [BOND_AMOUNT]: bondAmount,
        [CONDITIONS]: conditionsByType.keySeq().toJS(),
        [CHECKIN_FREQUENCY]: conditionsByType.getIn([CONDITION_LIST.CHECKINS, 0, PROPERTY_TYPES.FREQUENCY, 0]),
        [C247_TYPES]: c247Types,
        [OTHER_CONDITION_TEXT]: conditionsByType.getIn([CONDITION_LIST.OTHER, 0, PROPERTY_TYPES.OTHER_TEXT, 0], ''),
        [NO_CONTACT_PEOPLE]: noContactPeople,
        modifyingHearing,
        hearingDateTime,
        hearingCourtroom,
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
      hearingDateTime,
      hearingCourtroom,
      disabled: false
    };
  }

  handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    const valueNum = Number.parseFloat(value);
    if (!value.length ||
      (!Number.isNaN(valueNum) && (`${valueNum}` === `${value}` || `${valueNum}.` === `${value}`))) {
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
        state[NO_CONTACT_PEOPLE] = [Object.assign({}, BLANK_PERSON_ROW)]
      }
    }
    state.conditions = conditions;
    this.setState(state);
  }

  handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    const values = this.state[name];
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
          state[NO_CONTACT_PEOPLE] = [Object.assign({}, BLANK_PERSON_ROW)]
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

  mapOptionsToRadioButtons = (options :{}, field :string) => Object.values(options).map(option => (
    <RadioWrapper key={option}>
      <RadioButton
          name={field}
          value={option}
          checked={this.state[field] === option}
          onChange={this.handleInputChange}
          disabled={this.state.disabled}
          label={option} />
    </RadioWrapper>
  ))

  mapOptionsToCheckboxButtons = (options :{}, field :string) => Object.values(options).map(option => (
    <RadioWrapper key={option}>
      <CheckboxButton
          name={field}
          value={option}
          checked={this.state[field].includes(option)}
          onChange={this.handleCheckboxChange}
          disabled={this.state.disabled}
          label={option} />
    </RadioWrapper>
  ))

  renderConditionCheckbox = (condition, optionalLabel) => (
    <RadioWrapper>
      <CheckboxButton
          name="conditions"
          value={condition}
          checked={this.state.conditions.includes(condition)}
          label={optionalLabel || condition}
          disabled={this.state.disabled}
          onChange={this.handleConditionChange} />
    </RadioWrapper>
  )

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
      otherConditionText
    } = this.state;
    if (!this.isReadyToSubmit()) {
      return;
    }

    const startDate = toISODate(moment());

    const submission = {
      [FORM_IDS.PERSON_ID]: this.props.personId,
      [ID_FIELD_NAMES.DMF_ID]: this.props.dmfId,
      [ID_FIELD_NAMES.PSA_ID]: this.props.psaId,
      [PROPERTY_TYPES.OUTCOME]: outcome,
      [PROPERTY_TYPES.OTHER_TEXT]: otherOutcomeText,
      [PROPERTY_TYPES.BOND_TYPE]: bondType,
      [PROPERTY_TYPES.BOND_AMOUNT]: bondAmount,
      [PROPERTY_TYPES.COMPLETED_DATE_TIME]: toISODateTime(moment())
    };

    if (bondType) {
      submission[ID_FIELD_NAMES.BOND_ID] = randomUUID();
    }

    const conditionsField = [];
    if (release === RELEASES.HELD) {
      conditionsField.push({
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
            conditionsField.push(Object.assign({}, conditionObj, C_247_MAPPINGS[c247Type], {
              [PROPERTY_TYPES.GENERAL_ID]: randomUUID()
            }));
          });
        }
        else if (condition === CONDITION_LIST.NO_CONTACT) {
          this.cleanNoContactPeopleList().forEach(noContactPerson => {
            conditionsField.push(Object.assign({}, conditionObj, noContactPerson, {
              [PROPERTY_TYPES.GENERAL_ID]: randomUUID()
            }));
          })
        }
        else {
          conditionsField.push(conditionObj);
        }
      });
    }

    submission[RELEASE_CONDITIONS_FIELD] = conditionsField;

    this.props.submit({
      config: releaseConditionsConfig,
      values: submission,
      callback: this.props.submitCallback
    });
  }

  cleanNoContactPeopleList = () => this.state.noContactPeople
    .filter(obj => obj[PROPERTY_TYPES.PERSON_TYPE] && obj[PROPERTY_TYPES.PERSON_NAME].length)

  isReadyToSubmit = () => {
    const {
      disabled,
      outcome,
      otherOutcomeText,
      release,
      bondType,
      bondAmount,
      conditions,
      checkinFrequency,
      c247Types,
      otherConditionText,
      noContactPeople
    } = this.state;

    if (
      disabled
      || this.props.submitting
      || !outcome
      || !release
      || (outcome === OUTCOMES.OTHER && !otherOutcomeText.length)
      || (release === RELEASES.RELEASED && !bondType)
      || ((bondType === BOND_TYPES.CASH_ONLY || bondType === BOND_TYPES.CASH_SURETY) && !bondAmount.length)
      || (conditions.includes(CONDITION_LIST.CHECKINS) && !checkinFrequency)
      || (conditions.includes(CONDITION_LIST.C_247) && !c247Types.length)
      || (conditions.includes(CONDITION_LIST.OTHER) && !otherConditionText.length)
      || (conditions.includes(CONDITION_LIST.NO_CONTACT) && !this.cleanNoContactPeopleList().length)
    ) {
      return false;
    }

    return true;
  }

  handleOnListChange = (field, value, index) => {
    const noContactPeople = this.state[NO_CONTACT_PEOPLE];
    noContactPeople[index][field] = value;
    if (index === noContactPeople.length - 1) {
      noContactPeople.push({
        [PROPERTY_TYPES.PERSON_TYPE]: null,
        [PROPERTY_TYPES.PERSON_NAME]: ''
      });
    }
    this.setState({ [NO_CONTACT_PEOPLE]: noContactPeople });
  }

  removePersonRow = (index) => {
    const noContactPeople = this.state[NO_CONTACT_PEOPLE];
    if (noContactPeople.length > 1) {
      noContactPeople.splice(index, 1);
    }
    else {
      noContactPeople[0] = {
        [PROPERTY_TYPES.PERSON_TYPE]: null,
        [PROPERTY_TYPES.PERSON_NAME]: ''
      };
    }
    this.setState({ [NO_CONTACT_PEOPLE]: noContactPeople });
  }

  renderNoContactPeople = () => {
    let personTypeOptions = Immutable.OrderedMap();
    Object.values(NO_CONTACT_TYPES).forEach((val) => {
      personTypeOptions = personTypeOptions.set(val, val);
    });
    return (
      <NoContactPeopleWrapper>
        <table>
          <tbody>
            <tr>
              <th>Person Type</th>
              <th>Person Name</th>
            </tr>
            {this.state[NO_CONTACT_PEOPLE].map((person, index) => (
              <tr key={index}>
                <td>
                  <SearchableSelect
                      value={person[PROPERTY_TYPES.PERSON_TYPE]}
                      searchPlaceholder="Select"
                      onSelect={value => this.handleOnListChange(PROPERTY_TYPES.PERSON_TYPE, value, index)}
                      options={personTypeOptions}
                      disabled={this.state.disabled}
                      selectOnly
                      transparent
                      short />
                </td>
                <td>
                  <StyledInput
                      value={person[PROPERTY_TYPES.PERSON_NAME]}
                      onChange={e => this.handleOnListChange(PROPERTY_TYPES.PERSON_NAME, e.target.value, index)}
                      disabled={this.state.disabled} />
                </td>
                <td>
                  <InvisibleButton onClick={() => this.removePersonRow(index)}>
                    <FontAwesome name="times" />
                  </InvisibleButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </NoContactPeopleWrapper>
    );
  }

  handleHearingUpdate = () => {
    this.setState({ modifyingHearing: false });
    const { hearingDateTime, hearingCourtroom } = this.state;
    if (hearingDateTime && hearingCourtroom) {
      const newHearing = this.props.hearing
        .set(PROPERTY_TYPES.COURTROOM, [hearingCourtroom])
        .set(PROPERTY_TYPES.DATE_TIME, [hearingDateTime.toISOString(true)])
        .set(PROPERTY_TYPES.HEARING_TYPE, ['Initial Appearance'])
        .toJS();

      this.props.replace({
        entitySetName: ENTITY_SETS.HEARINGS,
        entityKeyId: this.props.hearingId,
        values: newHearing,
        callback: this.props.submitCallback
      });
    }
  }

  renderHearingInfo = () => {
    const { hearing } = this.props;
    const dateTime = hearing.getIn([PROPERTY_TYPES.DATE_TIME, 0], '');
    const date = formatDateTime(dateTime, 'MM/DD/YYYY');
    const time = formatDateTime(dateTime, 'HH:mm');
    const courtroom = hearing.getIn([PROPERTY_TYPES.COURTROOM, 0], '');
    if (this.state.modifyingHearing) {
      return (
        <HearingRow>
          <span>Date/Time:</span>
          <section>
            <DateTimePicker
                value={this.state.hearingDateTime}
                onChange={hearingDateTime => this.setState({ hearingDateTime })} />
          </section>
          <span>Courtroom:</span>
          <section>
            <SearchableSelect
                options={getCourtroomOptions()}
                value={this.state.hearingCourtroom}
                onSelect={hearingCourtroom => this.setState({ hearingCourtroom })}
                short />
          </section>
          <SecondaryButton onClick={() => this.setState({ modifyingHearing: false })}>Cancel</SecondaryButton>
          <InfoButton onClick={this.handleHearingUpdate}>Save</InfoButton>
        </HearingRow>
      );
    }
    return (
      <HearingRow>
        <span>Date:</span>
        <span>{date}</span>
        <span>Time:</span>
        <span>{time}</span>
        <span>Courtroom:</span>
        <span>{courtroom}</span>
        {
          this.state.disabled
            ? null
            : <SecondaryButton onClick={() => this.setState({ modifyingHearing: true })}>Edit</SecondaryButton>
        }
      </HearingRow>
    );
  }

  render() {
    return (
      <Wrapper>
        <HearingSectionWrapper>
          <h1>Hearing</h1>
          {this.renderHearingInfo()}
        </HearingSectionWrapper>
        <h1>Outcome</h1>
        <Row>
          {this.mapOptionsToRadioButtons(OUTCOMES, 'outcome')}
        </Row>
        {
          this.state[OUTCOME] === OUTCOMES.OTHER ? (
            <UnpaddedRow>
              <InputLabel>Outcome: </InputLabel>
              <StyledInput
                  disabled={this.state.disabled}
                  name={OTHER_OUTCOME_TEXT}
                  value={this.state[OTHER_OUTCOME_TEXT]}
                  onChange={this.handleInputChange} />
            </UnpaddedRow>
          ) : null
        }
        <h1>Decision</h1>
        <Row>
          {this.mapOptionsToRadioButtons(RELEASES, 'release')}
        </Row>
        {
          this.state[RELEASE] !== RELEASES.RELEASED ? null : (
            <div>
              <h1>Bond Type</h1>
              <Row>
                {this.mapOptionsToRadioButtons(BOND_TYPES, 'bondType')}
              </Row>
              {
                (this.state[BOND_TYPE] === BOND_TYPES.CASH_ONLY || this.state[BOND_TYPE] === BOND_TYPES.CASH_SURETY)
                  ? (
                    <UnpaddedRow>
                      <InputLabel>Amount: </InputLabel>
                      <RowWrapper width={150}>
                        <Dollar>$</Dollar>
                        <StyledInput
                            disabled={this.state.disabled}
                            name="bondAmount"
                            value={this.state[BOND_AMOUNT]}
                            onChange={this.handleNumberInputChange} />
                      </RowWrapper>
                    </UnpaddedRow>
                  ) : null
              }
              <h1>Conditions</h1>
              <Row>
                {this.renderConditionCheckbox(CONDITION_LIST.CONTACT_WITH_LAWYER)}
                {this.renderConditionCheckbox(CONDITION_LIST.MAKE_ALL_COURT_APPEARANCES)}
              </Row>
              <Row>
                {this.renderConditionCheckbox(CONDITION_LIST.NO_WEAPONS)}
                {this.renderConditionCheckbox(CONDITION_LIST.NO_ALCOHOL)}
                {this.renderConditionCheckbox(CONDITION_LIST.NO_DRUGS_WITHOUT_PERSCRIPTION)}
                {this.renderConditionCheckbox(CONDITION_LIST.GOOD_BEHAVIOR)}
              </Row>
              <Row>
                {this.renderConditionCheckbox(CONDITION_LIST.PRE_SENTENCE_EM)}
                {this.renderConditionCheckbox(CONDITION_LIST.NO_CONTACT_WITH_MINORS)}
                {this.renderConditionCheckbox(CONDITION_LIST.NO_CONTACT)}
              </Row>
              {
                this.state[CONDITIONS].includes(CONDITION_LIST.NO_CONTACT) ? this.renderNoContactPeople() : null
              }
              <Row>
                {this.renderConditionCheckbox(CONDITION_LIST.NO_DRIVING_WITHOUT_VALID_LICENSE)}
                {this.renderConditionCheckbox(CONDITION_LIST.COMPLY)}
              </Row>
              <Row>
                {this.renderConditionCheckbox(CONDITION_LIST.CHECKINS)}
                {
                  this.state[CONDITIONS].includes(CONDITION_LIST.CHECKINS) ?
                    [
                      <InputLabel key="frequencylabel" inline>Frequency: </InputLabel>,
                      ...this.mapOptionsToRadioButtons(CHECKIN_FREQUENCIES, 'checkinFrequency')
                    ]
                    : null
                }
              </Row>
              <Row>
                {this.renderConditionCheckbox(CONDITION_LIST.C_247, C_247_LABEL)}
              </Row>
              {
                this.state[CONDITIONS].includes(CONDITION_LIST.C_247) ? (
                  <ColumnWrapper>
                    <InputLabel>24/7 Requirements</InputLabel>
                    <RowWrapper width={700}>
                      <UnpaddedRow>
                        {this.mapOptionsToCheckboxButtons(C_247_TYPES, 'c247Types')}
                      </UnpaddedRow>
                    </RowWrapper>
                  </ColumnWrapper>
                ) : null
              }
              <Row>
                {this.renderConditionCheckbox(CONDITION_LIST.OTHER)}
                {
                  this.state[CONDITIONS].includes(CONDITION_LIST.OTHER) ? (
                    <InlineInput
                        name={OTHER_CONDITION_TEXT}
                        value={this.state[OTHER_CONDITION_TEXT]}
                        onChange={this.handleInputChange} />
                  ) : null
                }
              </Row>
            </div>
          )
        }
        {
          this.state.disabled ? null : (
            <Row>
              <InfoButton disabled={!this.isReadyToSubmit()} onClick={this.onSubmit}>Submit</InfoButton>
            </Row>
          )
        }
      </Wrapper>
    );
  }
}

export default SelectReleaseConditions;
