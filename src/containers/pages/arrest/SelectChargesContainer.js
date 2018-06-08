/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import FontAwesome from 'react-fontawesome';
import DateTimePicker from 'react-datetime';
import styled from 'styled-components';
import moment from 'moment';
import randomUUID from 'uuid/v4';
import { FormControl, Col } from 'react-bootstrap';

import StyledButton from '../../../components/buttons/StyledButton';
import SearchableSelect from '../../../components/controls/SearchableSelect';
import AllChargesList from '../../../utils/consts/AllChargesList';
import QUALIFIERS from '../../../utils/consts/QualifierConsts';
import { CHARGE } from '../../../utils/consts/Consts';
import type { Charge } from '../../../utils/consts/Consts';
import { PROPERTY_TYPES } from '../../../utils/consts/DataModelConsts';
import { toISODateTime } from '../../../utils/Utils';

import {
  PaddedRow,
  UnpaddedRow,
  TitleLabel
} from '../../../utils/Layout';

const {
  STATUTE,
  DESCRIPTION,
  DEGREE,
  DEGREE_SHORT,
  DISPOSITION_DATE,
  DISPOSITION,
  PLEA_DATE,
  PLEA,
  QUALIFIER
} = CHARGE;

const Container = styled.div`
  width: 100%;
  text-align: center;
`;

const SectionHeader = styled.div`
  font-size: 22px;
  margin-bottom: 15px;
`;

const CaseDetailsWrapper = styled.div`
  text-align: start;
`;

const ChargeWrapper = styled.div`
  text-align: start;
  padding: 20px;
  background: #f6f7f8;
  border-radius: 3px;
`;

const ChargeDividerWrapper = styled.div`
  text-align: center;
  width: 100%;
`;

const ChargeDivider = styled(FontAwesome).attrs({
  name: 'minus'
})`
  margin: 10px 0;
  color: #36454F;
`;

const DeleteButton = styled.button`
  color: #e91e63;
  background: none;
  border: none;
  display: inline-block;
  margin: auto 5px;
  &:hover {
    color: #b90b14;
  }
  &:disabled {
    cursor: default;
  }
`;

const ChargeTitle = styled.div`
  padding: 10px 0;
  font-size: 18px;
  display: inline-block;
`;

type Props = {
  defaultArrest :Immutable.Map<*, *>,
  defaultCharges :Immutable.List<*>,
  onSubmit :(pretrialCase :Immutable.Map<*, *>, charges :Immutable.List<*>) => void,
  nextPage :() => void,
  prevPage :() => void
};

type State = {
  arrestDate :?Object,
  caseDispositionDate :?string,
  charges :Charge[]
};

export default class SelectChargesContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      arrestDate: moment(props.defaultArrest.getIn([PROPERTY_TYPES.ARREST_DATE_TIME, 0])),
      caseDispositionDate: null,
      charges: this.formatChargeList(props.defaultCharges)
    };
  }

  formatChargeList = (chargeList :Immutable.List<*>) :Object[] => {
    const result = [];
    chargeList.forEach((charge) => {
      result.push({
        [STATUTE]: charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0]),
        [DESCRIPTION]: charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0]),
        [DEGREE]: charge.getIn([PROPERTY_TYPES.CHARGE_DEGREE, 0]),
        [DEGREE_SHORT]: charge.getIn([PROPERTY_TYPES.CHARGE_LEVEL, 0])
      });
    });
    return result;
  }

  getDateTime = (dateTimeStr) => {
    if (dateTimeStr) {
      const dateTime = moment(dateTimeStr);
      if (dateTime.isValid()) {
        return toISODateTime(dateTime);
      }
    }
    return '';
  }

  onSubmit = () => {
    const { arrestDate, caseDispositionDate, charges } = this.state;
    const caseId = randomUUID();
    const caseEntity = {
      [PROPERTY_TYPES.CASE_ID]: [caseId],
      [PROPERTY_TYPES.FILE_DATE]: [toISODateTime(moment())],
      [PROPERTY_TYPES.NUMBER_OF_CHARGES]: [charges.length]
    };
    if (caseDispositionDate) caseEntity[PROPERTY_TYPES.CASE_DISPOSITION_DATE] = [this.getDateTime(caseDispositionDate)];
    if (arrestDate) caseEntity[PROPERTY_TYPES.ARREST_DATE_TIME] = [this.getDateTime(arrestDate)];

    const chargeEntities = charges.map((charge, index) => {
      const chargeEntity = {
        [PROPERTY_TYPES.CHARGE_ID]: [`${caseId}|${index + 1}`],
        [PROPERTY_TYPES.CHARGE_STATUTE]: [charge[STATUTE]],
        [PROPERTY_TYPES.CHARGE_DESCRIPTION]: [charge[DESCRIPTION]],
        [PROPERTY_TYPES.CHARGE_DEGREE]: [charge[DEGREE]],
        [PROPERTY_TYPES.CHARGE_LEVEL]: [charge[DEGREE_SHORT]]
      };
      if (charge[QUALIFIER]) chargeEntity[PROPERTY_TYPES.QUALIFIER] = [charge[QUALIFIER]];
      return chargeEntity;
    });

    this.props.onSubmit({
      pretrialCase: Immutable.fromJS(caseEntity),
      charges: Immutable.fromJS(chargeEntities)
    });
    this.props.nextPage();
  }

  renderCaseInfo = () => {
    const { arrestDate, caseDispositionDate } = this.state;
    return (
      <CaseDetailsWrapper>
        <hr />
        <SectionHeader>Arrest Details:</SectionHeader>
        <PaddedRow>
          <Col lg={6}>
            <TitleLabel>Arrest Date:</TitleLabel>
            <DateTimePicker
                value={arrestDate}
                onChange={(date) => {
                  this.setState({ arrestDate: date });
                }} />
          </Col>
          <Col lg={6}>
            <TitleLabel>Case Disposition Date:</TitleLabel>
            <DateTimePicker
                value={caseDispositionDate}
                onChange={(date) => {
                  this.setState({ caseDispositionDate: date });
                }} />
          </Col>
        </PaddedRow>
        <hr />
      </CaseDetailsWrapper>
    );
  }

  addCharge = (newChargeInput :Charge) => {
    const newCharge = newChargeInput;
    const { charges, caseDispositionDate } = this.state;
    if (caseDispositionDate) newCharge[DISPOSITION_DATE] = caseDispositionDate;
    charges.push(newCharge);
    this.setState({ charges });
  }

  formatCharge = (charge :Charge) => `${charge.statute} ${charge.description}`;

  formatChargeOptions = () => {
    let options = Immutable.Map();
    AllChargesList.forEach((charge) => {
      options = options.set(this.formatCharge(charge), charge);
    });
    return options;
  }

  formatSelectOptions = (optionValues) => {
    let options = Immutable.Map();
    optionValues.forEach((disposition) => {
      options = options.set(disposition, disposition);
    });
    return options;
  }

  handleChargeInputChange = (e :?Object, index :number, optionalField :?string) => {
    const { charges } = this.state;
    const field = optionalField || e.target.name;
    const value = optionalField ? e : e.target.value;
    const newChargeObj = Object.assign({}, charges[index], { [field]: value });
    charges[index] = newChargeObj;
    this.setState({ charges });
  }

  renderInputField = (charge :Charge, field :string, onChange :(event :Object) => void) => (
    <FormControl
        name={field}
        value={charge[field]}
        onChange={onChange} />
  )

  renderDatePicker = (charge :Charge, field :string, onChange :(event :Object) => void) => (
    <DateTimePicker
        name={field}
        value={charge[field]}
        onChange={onChange} />
  )

  deleteCharge = (index :number) => {
    const { charges } = this.state;
    charges.splice(index, 1);
    this.setState({ charges });
  }

  renderSingleCharge = (charge :Charge, index :number) => {
    const onChange = (e) => {
      this.handleChargeInputChange(e, index);
    };

    const getOnSelect = field => newVal => this.handleChargeInputChange(newVal, index, field);

    const getOnClear = field => () => this.handleChargeInputChange(undefined, index, field);

    return (
      <div key={index}>
        <ChargeWrapper>
          <DeleteButton onClick={() => this.deleteCharge(index)}><FontAwesome name="close" /></DeleteButton>
          <ChargeTitle>{this.formatCharge(charge)}</ChargeTitle>
          <UnpaddedRow>
            <Col lg={3}>
              <TitleLabel>Qualifier</TitleLabel>
              <SearchableSelect
                  onSelect={getOnSelect(QUALIFIER)}
                  options={this.formatSelectOptions(QUALIFIERS)}
                  searchPlaceholder="Select a qualifier"
                  value={charge[QUALIFIER]}
                  onClear={getOnClear(QUALIFIER)}
                  short />
            </Col>
          </UnpaddedRow>
        </ChargeWrapper>
        <ChargeDividerWrapper><ChargeDivider /></ChargeDividerWrapper>
      </div>
    );
  }

  renderCharges = () => {
    const { charges } = this.state;
    const chargeItems = charges.map(this.renderSingleCharge);
    return (
      <CaseDetailsWrapper>
        <SectionHeader>Charges:</SectionHeader>
        {chargeItems}
        <SearchableSelect
            onSelect={this.addCharge}
            options={this.formatChargeOptions()}
            searchPlaceholder="Select a charge" />
        <hr />
      </CaseDetailsWrapper>
    );
  }

  render() {
    return (
      <Container>
        {this.renderCaseInfo()}
        {this.renderCharges()}
        <StyledButton onClick={this.onSubmit}>Confirm Charge Details</StyledButton>
      </Container>
    );
  }
}
