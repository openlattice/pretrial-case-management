/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';
import randomUUID from 'uuid/v4';

import RadioButton from '../controls/StyledRadioButton';
import CheckboxButton from '../controls/StyledCheckboxButton';
import StyledInput from '../controls/StyledInput';
import InfoButton from '../buttons/InfoButton';
import releaseConditionsConfig from '../../config/formconfig/ReleaseConditionsConfig';
import { RELEASE_CONDITIONS, LIST_FIELDS, ID_FIELD_NAMES, FORM_IDS } from '../../utils/consts/Consts';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { toISODate, toISODateTime } from '../../utils/Utils';
import {
  OUTCOMES,
  RELEASES,
  BOND_TYPES,
  CONDITION_LIST,
  CHECKIN_FREQUENCIES,
  C_247_LABEL,
  C_247_TYPES,
  C_247_MAPPINGS
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
  C247_TYPES
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

type Props = {
  dmfId :string,
  psaId :string,
  personId :string,
  submit :(value :{ config :Object, values :Object }) => void,
  defaultDMF :Immutable.Map<*, *>,
  defaultBond :Immutable.Map<*, *>,
  defaultConditions :Immutable.List<*>,
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
  c247Types :string[]
};

class SelectReleaseConditions extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = this.getStateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    const { defaultDMF, defaultBond, defaultConditions } = this.props;
    if (
      !nextProps.defaultDMF.size === defaultDMF.size
      || !nextProps.defaultBond.size === defaultBond.size
      || !nextProps.defaultConditions.size === defaultConditions.size
    ) {
      this.setState(this.getStateFromProps(nextProps));
    }
  }

  getStateFromProps = (props) => {
    const { defaultDMF, defaultBond, defaultConditions } = props;
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
      })

      return {
        [OUTCOME]: defaultDMF.getIn([PROPERTY_TYPES.OUTCOME, 0]),
        [OTHER_OUTCOME_TEXT]: defaultDMF.getIn([PROPERTY_TYPES.OTHER_TEXT, 0], ''),
        [RELEASE]: defaultBond.size ? RELEASES.RELEASED : RELEASES.HELD,
        [BOND_TYPE]: bondType,
        [BOND_AMOUNT]: bondAmount,
        [CONDITIONS]: conditionsByType.keySeq().toJS(),
        [CHECKIN_FREQUENCY]: conditionsByType.getIn([CONDITION_LIST.CHECKINS, 0, PROPERTY_TYPES.FREQUENCY, 0]),
        [C247_TYPES]: c247Types,
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
      c247Types
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

        if (condition === CONDITION_LIST.C_247) {
          c247Types.forEach((c247Type) => {
            conditionsField.push(Object.assign({}, conditionObj, C_247_MAPPINGS[c247Type], {
              [PROPERTY_TYPES.GENERAL_ID]: randomUUID()
            }));
          });
        }
        else {
          conditionsField.push(conditionObj);
        }
      });
    }

    submission[RELEASE_CONDITIONS_FIELD] = conditionsField;

    this.props.submit({
      config: releaseConditionsConfig,
      values: submission
    });
  }

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
      c247Types
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
    ) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <Wrapper>
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
