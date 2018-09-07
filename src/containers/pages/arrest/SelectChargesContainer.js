/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';
import randomUUID from 'uuid/v4';
import { FormControl, Col } from 'react-bootstrap';

import BasicButton from '../../../components/buttons/BasicButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import SearchableSelect from '../../../components/controls/SearchableSelect';
import DateTimePicker from '../../../components/controls/StyledDateTimePicker';
import MinnehahaChargesList from '../../../utils/consts/MinnehahaChargesList';
import PenningtonChargesList from '../../../utils/consts/PenningtonChargesList';
import QUALIFIERS from '../../../utils/consts/QualifierConsts';
import { CHARGE } from '../../../utils/consts/Consts';
import type { Charge } from '../../../utils/consts/Consts';
import { PROPERTY_TYPES } from '../../../utils/consts/DataModelConsts';
import { DOMAIN } from '../../../utils/consts/ReportDownloadTypes';
import { toISODateTime } from '../../../utils/FormattingUtils';

import {
  PaddedRow,
  StyledFormWrapper,
  TitleLabel,
  UnpaddedRow,
  Title
} from '../../../utils/Layout';

const {
  STATUTE,
  DESCRIPTION,
  DEGREE,
  DEGREE_SHORT,
  DISPOSITION_DATE,
  QUALIFIER
} = CHARGE;

const Container = styled(StyledFormWrapper)`
  text-align: center;
  background-color: #ffffff;
  padding: 30px;
  border-radius: 5px;
  border: 1px solid #e1e1eb;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 45px;

  button {
    width: 220px;
    margin: 20px 0;
  }
`;

const StyledTitle = styled(Title)`
  font-size: 18px;
  display: inline-flex;
`;

const SectionHeader = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: #555e6f;
  margin-bottom: 20px;
`;

const InputLabel = styled(TitleLabel)`
  font-size: 14px;
  margin-bottom: 10px;
`;

const CaseDetailsWrapper = styled.div`
  text-align: start;
`;

const ChargeWrapper = styled.div`
  text-align: start;
  padding: 30px 0;
  border-bottom: 1px solid #e1e1eb;
`;

const DeleteButton = styled(BasicButton)`
  width: 100%;
  height: 39px;
  font-size: 14px;
  font-weight: 600;
`;

const ChargeTitle = styled.div`
  padding-bottom: 10px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #2e2e34;
  display: inline-block;
`;

type Props = {
  defaultArrest :Immutable.Map<*, *>,
  defaultCharges :Immutable.List<*>,
  onSubmit :(pretrialCase :Immutable.Map<*, *>, charges :Immutable.List<*>) => void,
  nextPage :() => void,
  prevPage :() => void,
  county :string
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
        [STATUTE]: charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '[no statute]'),
        [DESCRIPTION]: charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '[no description]'),
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
        <SectionHeader>Arrest Details:</SectionHeader>
        <PaddedRow>
          <Col lg={6}>
            <InputLabel>Arrest Date:</InputLabel>
            <DateTimePicker
                timeFormat="HH:mm"
                value={arrestDate}
                onChange={(date) => {
                  this.setState({ arrestDate: date });
                }} />
          </Col>
          <Col lg={6}>
            <InputLabel>Case Disposition Date:</InputLabel>
            <DateTimePicker
                value={caseDispositionDate}
                onChange={(date) => {
                  this.setState({ caseDispositionDate: date });
                }} />
          </Col>
        </PaddedRow>
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
    (this.props.county === DOMAIN.PENNINGTON ? PenningtonChargesList : MinnehahaChargesList).forEach((charge) => {
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
          <ChargeTitle>{this.formatCharge(charge)}</ChargeTitle>
          <UnpaddedRow>
            <Col lg={6}>
              <SearchableSelect
                  onSelect={getOnSelect(QUALIFIER)}
                  options={this.formatSelectOptions(QUALIFIERS)}
                  searchPlaceholder="Select a qualifier"
                  value={charge[QUALIFIER]}
                  onClear={getOnClear(QUALIFIER)} />
            </Col>
            <Col lg={3} />
            <Col lg={3}>
              <DeleteButton onClick={() => this.deleteCharge(index)}>Remove</DeleteButton>
            </Col>
          </UnpaddedRow>
        </ChargeWrapper>
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
            searchPlaceholder="Select a charge"
            openAbove />
        <hr />
      </CaseDetailsWrapper>
    );
  }

  renderHeader = () => (
    <HeaderWrapper>
      <StyledTitle>Add/Edit arrest charges</StyledTitle>
      <SecondaryButton onClick={this.onSubmit}>Confirm Charge Details</SecondaryButton>
    </HeaderWrapper>
  )

  render() {
    return (
      <Container>
        {this.renderHeader()}
        {this.renderCaseInfo()}
        {this.renderCharges()}
      </Container>
    );
  }
}
