/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';
import randomUUID from 'uuid/v4';

import BasicButton from '../../../components/buttons/BasicButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import SearchableSelect from '../../../components/controls/SearchableSelect';
import DateTimePicker from '../../../components/datetime/DateTimePicker';
import MinnehahaChargesList from '../../../utils/consts/MinnehahaChargesList';
import PenningtonChargesList from '../../../utils/consts/PenningtonChargesList';
import QUALIFIERS from '../../../utils/consts/QualifierConsts';
import { CHARGE } from '../../../utils/consts/Consts';
import type { Charge } from '../../../utils/consts/Consts';
import { PROPERTY_TYPES } from '../../../utils/consts/DataModelConsts';
import { DOMAIN } from '../../../utils/consts/ReportDownloadTypes';
import { toISODateTime } from '../../../utils/FormattingUtils';
import { OL } from '../../../utils/consts/Colors';

import {
  StyledFormWrapper,
  Title
} from '../../../utils/Layout';

const {
  STATUTE,
  DESCRIPTION,
  DEGREE,
  DEGREE_SHORT,
  DISPOSITION_DATE,
  QUALIFIER,
  NUMBER_OF_COUNTS
} = CHARGE;

const Container = styled(StyledFormWrapper)`
  text-align: left;
  background-color: ${OL.WHITE};
  padding: 30px;
  border-radius: 5px;
  border: 1px solid ${OL.GREY11};
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

const CountsInput = styled.input.attrs({
  type: 'number',
  min: 1
})`
  height: 45px;
  width: 286px;
  border: 1px solid ${OL.GREY05};
  border-radius: 3px;
  color: ${OL.BLUE03};
  font-size: 14px;
  align-items: center;
  padding-left: 20px;
`;

const StyledTitle = styled(Title)`
  font-size: 18px;
  display: inline-flex;
`;

const SectionHeader = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  color: ${OL.GREY01};
  margin-bottom: 20px;
`;

const InputLabel = styled.div`
  font-size: 14px;
  margin-bottom: 10px;
`;

const CaseDetailsWrapper = styled.div`
  text-align: start;
  margin-bottom: 30px;
  display: grid;
  grid-template-columns: 45% 45%;
  grid-gap: 10%;
`;

const ChargeSearch = styled(SearchableSelect)`
  margin-top: 30px;
`;

const ChargeWrapper = styled.div`
  padding: 30px 0;
  border-bottom: 1px solid ${OL.GREY11};
`;

const ChargeOptionsWrapper = styled.div`
  text-align: start;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
  button {
    height: 100%;
  }
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
  color: ${OL.GREY15};
  display: inline-block;
`;

const CaseInfoWrapper = styled.div`
  width: 100%;
`

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
      caseDispositionDate: moment(),
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
        [DEGREE_SHORT]: charge.getIn([PROPERTY_TYPES.CHARGE_LEVEL, 0]),
        [NUMBER_OF_COUNTS]: 1
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
    const { onSubmit, nextPage } = this.props;
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
      const counts = charge.counts ? charge.counts : 1;
      const chargeEntity = {
        [PROPERTY_TYPES.CHARGE_ID]: [`${caseId}|${index + 1}`],
        [PROPERTY_TYPES.CHARGE_STATUTE]: [charge[STATUTE]],
        [PROPERTY_TYPES.CHARGE_DESCRIPTION]: [charge[DESCRIPTION]],
        [PROPERTY_TYPES.CHARGE_DEGREE]: [charge[DEGREE]],
        [PROPERTY_TYPES.CHARGE_LEVEL]: [charge[DEGREE_SHORT]],
        [PROPERTY_TYPES.NUMBER_OF_COUNTS]: counts
      };
      if (charge[QUALIFIER]) chargeEntity[PROPERTY_TYPES.QUALIFIER] = [charge[QUALIFIER]];
      return chargeEntity;
    });

    onSubmit({
      pretrialCase: Immutable.fromJS(caseEntity),
      charges: Immutable.fromJS(chargeEntities)
    });
    nextPage();
  }

  renderCaseInfo = () => {
    const { arrestDate, caseDispositionDate } = this.state;
    return (
      <CaseInfoWrapper>
        <SectionHeader>Arrest Details:</SectionHeader>
        <CaseDetailsWrapper>
          <InputLabel>
            Arrest Date
            <DateTimePicker
                name="arrestDate"
                value={arrestDate}
                onChange={(arrdate) => {
                  this.setState({ arrestDate: arrdate });
                }} />
          </InputLabel>
          <InputLabel>
            Case Disposition Date
            <DateTimePicker
                name="caseDispositionDate"
                value={caseDispositionDate}
                onChange={(date) => {
                  this.setState({ caseDispositionDate: date });
                }} />
          </InputLabel>
        </CaseDetailsWrapper>
      </CaseInfoWrapper>
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
    const { county } = this.props;
    let options = Immutable.Map();
    (county === DOMAIN.PENNINGTON ? PenningtonChargesList : MinnehahaChargesList).forEach((charge) => {
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
    <CountsInput
        placeholder="Number of Counts"
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
      <ChargeWrapper key={`${charge.statute}-${charge.qualifier}-${index}`}>
        <ChargeTitle>{this.formatCharge(charge)}</ChargeTitle>
        <ChargeOptionsWrapper>
          <SearchableSelect
              onSelect={getOnSelect(QUALIFIER)}
              options={this.formatSelectOptions(QUALIFIERS)}
              searchPlaceholder="Select a qualifier"
              value={charge[QUALIFIER]}
              onClear={getOnClear(QUALIFIER)} />
          {this.renderInputField(charge, NUMBER_OF_COUNTS, onChange)}
          <DeleteButton onClick={() => this.deleteCharge(index)}>Remove</DeleteButton>
        </ChargeOptionsWrapper>
      </ChargeWrapper>
    );
  }

  renderCharges = () => {
    const { charges } = this.state;
    const chargeItems = charges.map(this.renderSingleCharge);
    return (
      <div>
        <SectionHeader>Charges</SectionHeader>
        {chargeItems}
        <ChargeSearch
            scrollVisible
            onSelect={this.addCharge}
            options={this.formatChargeOptions()}
            searchPlaceholder="Select a charge"
            openAbove />
        <hr />
      </div>
    );
  }

  renderHeader = () => (
    <HeaderWrapper>
      <StyledTitle>Add/Edit Arrest Charges</StyledTitle>
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
