/*
 * @flow
 */

import React from 'react';
import Immutable, { Map, List, fromJS } from 'immutable';
import styled from 'styled-components';
import randomUUID from 'uuid/v4';
import { Select } from 'lattice-ui-kit';
import { DateTime } from 'luxon';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/pro-light-svg-icons';

import BasicButton from '../../../components/buttons/BasicButton';
import SecondaryButton from '../../../components/buttons/SecondaryButton';
import DateTimePicker from '../../../components/datetime/DateTimePicker';
import QUALIFIERS from '../../../utils/consts/QualifierConsts';
import { CHARGE } from '../../../utils/consts/Consts';
import { CASE_CONTEXTS } from '../../../utils/consts/AppSettingConsts';
import { PROPERTY_TYPES } from '../../../utils/consts/DataModelConsts';
import { getFirstNeighborValue, getEntityProperties } from '../../../utils/DataUtils';
import { OL } from '../../../utils/consts/Colors';

import { STATE } from '../../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../../utils/consts/redux/AppConsts';
import { CHARGE_DATA } from '../../../utils/consts/redux/ChargeConsts';

import {
  StyledFormWrapper,
  Title
} from '../../../utils/Layout';

const {
  ARREST_DATE_TIME,
  ARRESTING_AGENCY,
  CASE_NUMBER,
  ID,
  NAME
} = PROPERTY_TYPES;

const {
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

const GeneralInputField = styled.input`
  width: 100%;
  height: 44px;
  padding: 2px 8px;
  background: ${OL.GREY38};
  border: none;
`;

const CountsInput = styled.input.attrs({
  type: 'number',
  min: 1
})`
  height: 40px;
  width: 100%;
  border: 1px solid ${OL.GREY05};
  border-radius: 3px;
  color: ${OL.BLUE03};
  font-size: 14px;
  align-items: center;
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

const ChargeWrapper = styled.div`
  padding: 30px 0;
  border-bottom: 1px solid ${OL.GREY11};
`;

const ChargeOptionsWrapper = styled.div`
  align-items: center;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(3, 1fr);
  text-align: start;

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
  display: flex;
  flex-direction: row;
  padding-bottom: 10px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: ${(props :Object) => (props.notify ? OL.RED01 : OL.GREY15)};
  display: inline-block;
`;

const CaseInfoWrapper = styled.div`
  width: 100%;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

type Props = {
  arrestingAgencies :Map;
  chargeOptions :Map;
  chargeList :List;
  caseContext :string;
  defaultArrest :Map;
  defaultCharges :List;
  nextPage :() => void;
  onSubmit :(pretrialCase :Map, charges :List) => void;
};

type State = {
  arrestAgency :string;
  arrestDate :?Object;
  arrestTrackingNumber :string;
  caseContext :string;
  caseDispositionDate :?string;
  charges :Map;
  courtCaseNumber :string;
};

class SelectChargesContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    const { [ARREST_DATE_TIME]: arrestTimeString } = getEntityProperties(props.defaultArrest, [ARREST_DATE_TIME]);
    let arrestDatetime = DateTime.fromISO(arrestTimeString);
    if (!arrestDatetime.isValid) arrestDatetime = DateTime.local();
    this.state = {
      caseContext: props.caseContext,
      courtCaseNumber: '',
      arrestTrackingNumber: '',
      arrestAgency: '',
      arrestDate: arrestDatetime,
      caseDispositionDate: '',
      charges: this.formatChargeList(props.defaultCharges)
    };
  }


  static getDerivedStateFromProps(nextProps :Props) {
    const { defaultArrest } = nextProps;
    if (defaultArrest.size) {
      let {
        [CASE_NUMBER]: arrestTrackingNumber,
        [ARRESTING_AGENCY]: arrestAgency
      } = getEntityProperties(defaultArrest, [CASE_NUMBER, ARRESTING_AGENCY]);
      arrestTrackingNumber = arrestTrackingNumber || '';
      arrestAgency = arrestAgency || '';
      if (arrestTrackingNumber || arrestAgency) {
        return {
          arrestTrackingNumber,
          arrestAgency
        };
      }
    }
    return null;
  }

  formatChargeList = (chargeList :Immutable.List<*>) :Object[] => {
    const result = [];
    chargeList.forEach((charge) => {
      result.push(
        fromJS(
          {
            [PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE]: [
              charge.getIn(
                [PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0],
                charge.getIn([PROPERTY_TYPES.CHARGE_STATUTE, 0], '[no statute]')
              )
            ],
            [PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION]: [
              charge.getIn(
                [PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0],
                charge.getIn([PROPERTY_TYPES.CHARGE_DESCRIPTION, 0], '[no description]')
              )
            ],
            [PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE]: [
              charge.getIn(
                [PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE, 0],
                charge.getIn([PROPERTY_TYPES.CHARGE_DEGREE, 0])
              )
            ],
            [PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL]: [
              charge.getIn(
                [PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL, 0],
                charge.getIn([PROPERTY_TYPES.CHARGE_LEVEL, 0])
              )
            ],
            [NUMBER_OF_COUNTS]: 1
          }
        )
      );
    });
    return fromJS(result);
  }

  getDateTime = (dateTimeStr :string) => {
    if (dateTimeStr) {
      const dateTime = DateTime.fromISO(dateTimeStr);
      if (dateTime.isValid) {
        return dateTime.toISO();
      }
    }
    return '';
  }

  onSubmit = () => {
    const { onSubmit, nextPage, defaultArrest } = this.props;
    const {
      arrestAgency,
      arrestDate,
      arrestTrackingNumber,
      caseDispositionDate,
      charges,
      courtCaseNumber
    } = this.state;
    const caseId = randomUUID();
    const caseEntity :Object = {
      [PROPERTY_TYPES.CASE_ID]: [caseId],
      [PROPERTY_TYPES.FILE_DATE]: [DateTime.local().toISO()],
      [PROPERTY_TYPES.NUMBER_OF_CHARGES]: [charges.size]
    };
    if (caseDispositionDate) caseEntity[PROPERTY_TYPES.CASE_DISPOSITION_DATE] = [this.getDateTime(caseDispositionDate)];
    if (arrestDate) caseEntity[PROPERTY_TYPES.ARREST_DATE_TIME] = [this.getDateTime(arrestDate)];
    if (courtCaseNumber) caseEntity[PROPERTY_TYPES.CASE_NUMBER] = [courtCaseNumber];
    if (!defaultArrest.size && arrestTrackingNumber) caseEntity[PROPERTY_TYPES.CASE_NUMBER] = [arrestTrackingNumber];
    if (arrestAgency) caseEntity[PROPERTY_TYPES.ARRESTING_AGENCY] = [arrestAgency];

    const chargeEntities = charges.map((charge, index) => {
      const statute = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], '');
      const description = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], '');
      const degree = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE, 0], '');
      const degreeShort = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL, 0], '');
      const qualifier = charge.get(QUALIFIER, '');
      const counts = charge.get(NUMBER_OF_COUNTS, 1);
      const chargeEntity :Object = {
        [PROPERTY_TYPES.CHARGE_ID]: [`${caseId}|${index + 1}`],
        [PROPERTY_TYPES.CHARGE_STATUTE]: [statute],
        [PROPERTY_TYPES.CHARGE_DESCRIPTION]: [description],
        [PROPERTY_TYPES.CHARGE_DEGREE]: [degree],
        [PROPERTY_TYPES.CHARGE_LEVEL]: [degreeShort],
        [PROPERTY_TYPES.NUMBER_OF_COUNTS]: counts
      };
      if (qualifier) chargeEntity[PROPERTY_TYPES.QUALIFIER] = [qualifier];
      return fromJS(chargeEntity);
    });

    onSubmit({
      pretrialCase: Immutable.fromJS(caseEntity),
      charges: Immutable.fromJS(chargeEntities)
    });
    nextPage();
  }

  onInputChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  onOptionSelect = (option :Object) => {
    const { name, value } = option;
    this.setState({ [name]: value });
  }

  renderArrestAgencySelection = () => {
    const { defaultArrest } = this.props;
    const { arrestAgency } = this.state;
    const {
      [ARRESTING_AGENCY]: arrestAgencyFromSelectedArrest
    } = getEntityProperties(defaultArrest, [ARRESTING_AGENCY]);
    const agencyOptions = this.formatArrestingAgencyList();
    const agencyInput = (
      <Select
          value={{ name: 'arrestAgency', label: arrestAgency, value: arrestAgency }}
          disabled={!!arrestAgencyFromSelectedArrest.length}
          placeholder="Select Arrest Agency"
          onChange={this.onOptionSelect}
          options={agencyOptions} />
    );

    return agencyOptions.size || arrestAgency.length
      ? (
        <InputLabel>
          Arresting Agency
          { agencyInput }
        </InputLabel>
      ) : null;
  }

  renderArrestAndCourtCaseNumberInput = () => {
    const { arrestTrackingNumber, courtCaseNumber } = this.state;
    return (
      <>
        <InputLabel>
          Arrest Tracking Number
          <GeneralInputField
              name="arrestTrackingNumber"
              value={arrestTrackingNumber}
              onChange={this.onInputChange} />
        </InputLabel>
        { this.renderArrestAgencySelection() }
        <InputLabel>
          Court Case Number
          <GeneralInputField
              name="courtCaseNumber"
              value={courtCaseNumber}
              onChange={this.onInputChange} />
        </InputLabel>
      </>
    );
  }

  onSelect = (name :string) => {
    this.setState({ arrestAgency: name });
  }

  formatArrestingAgencyList = () => {
    const { arrestingAgencies } = this.props;
    let agencyOptions = List();
    arrestingAgencies.valueSeq().forEach((agency) => {
      const {
        [NAME]: agencyName,
        [ID]: angencyNameShort
      } = getEntityProperties(agency, [NAME, ID]);
      agencyOptions = agencyOptions.push({
        name: 'arrestAgency',
        value: angencyNameShort,
        label: `${angencyNameShort} - ${agencyName}`
      });
    });
    return agencyOptions;
  }

  formatQualifiers = () => {
    let qualifierOptions = List();
    QUALIFIERS.forEach((qualifier) => {
      qualifierOptions = qualifierOptions.push({
        target: {
          name: QUALIFIER,
          value: qualifier
        },
        label: qualifier
      });
    });
    return qualifierOptions;
  }


  renderArrestInfoInput = () => {
    const { defaultArrest } = this.props;
    const { arrestTrackingNumber } = this.state;
    const {
      [CASE_NUMBER]: caseIdFromSelectedArrest
    } = getEntityProperties(defaultArrest, [CASE_NUMBER, ARRESTING_AGENCY]);
    return (
      <>
        <InputLabel>
          Arrest Tracking Number
          <GeneralInputField
              disabled={!!caseIdFromSelectedArrest}
              name="arrestTrackingNumber"
              value={arrestTrackingNumber}
              onChange={this.onInputChange} />
        </InputLabel>
        { this.renderArrestAgencySelection() }
      </>
    );
  }

  renderDispositionOrCourtCaseNumberInput = () => {
    const { caseContext } = this.state;
    return (caseContext === CASE_CONTEXTS.ARREST)
      ? this.renderArrestInfoInput()
      : this.renderArrestAndCourtCaseNumberInput();
  }

  renderCaseInfo = () => {
    const { arrestDate, caseContext } = this.state;
    const isArrest = (caseContext === CASE_CONTEXTS.ARREST);
    return (
      <CaseInfoWrapper>
        <SectionHeader>{ isArrest ? 'Arrest Details:' : 'Court Details:'}</SectionHeader>
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
          { this.renderDispositionOrCourtCaseNumberInput() }
        </CaseDetailsWrapper>
      </CaseInfoWrapper>
    );
  }

  addCharge = (newChargeInput :Map) => {
    let { charges } = this.state;
    let { value: charge } = newChargeInput;
    const { caseDispositionDate } = this.state;
    if (caseDispositionDate) charge = charge.set(DISPOSITION_DATE, caseDispositionDate);
    charges = charges.push(charge);
    this.setState({ charges });
  }

  formatCharge = (charge :Map) => (
    `${
      charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], '')
    } ${
      charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], '')
    }`
  );

  formatSelectOptions = (optionValues :string[]) => {
    let options = Immutable.Map();
    optionValues.forEach((disposition) => {
      options = options.set(disposition, disposition);
    });
    return options;
  }

  handleChargeInputChange = (e :SyntheticInputEvent<HTMLInputElement>, index :number, optionalField :?string) => {
    let { charges } = this.state;
    const field = optionalField || e.target.name;
    const value = optionalField ? e : e.target.value;
    const newChargeObj = charges.get(index).set(field, value);
    charges = charges.set(index, newChargeObj);
    this.setState({ charges });
  }

  renderInputField = (charge :Map, field :string, onChange :(event :Object) => void) => (
    <CountsInput
        placeholder="Number of Counts"
        name={field}
        value={charge.getIn([field], 1)}
        onChange={onChange} />
  )


  deleteCharge = (index :number) => {
    let { charges } = this.state;
    charges = charges.splice(index, 1);
    this.setState({ charges });
  }

  renderSingleCharge = (charge :Map, index :number) => {
    const { caseContext, chargeOptions } = this.props;
    const statute = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, 0], '');
    const description = charge.getIn([PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, 0], '');
    const qualifier = charge.get(QUALIFIER, '');
    const onChange = (e) => {
      this.handleChargeInputChange(e, index);
    };
    const chargeText = `${statute} ${description}`;

    const noRecordOfCharge = !chargeOptions.get(chargeText);

    const getOnSelect = (field) => (newVal) => this.handleChargeInputChange(newVal, index, field);

    return (
      <ChargeWrapper key={`${statute}-${qualifier}-${index}`}>
        <TitleWrapper>
          {
            noRecordOfCharge
              ? (
                <ChargeTitle notify={noRecordOfCharge}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  { noRecordOfCharge ? ' [CHARGE UNRECOGNIZED - WILL NOT BE APPLIED TO AUTOFILL]' : null }
                </ChargeTitle>
              ) : null
          }
          <ChargeTitle>
            {chargeText}
          </ChargeTitle>
        </TitleWrapper>
        <ChargeOptionsWrapper>
          {
            (caseContext === CASE_CONTEXTS.ARREST)
              ? (
                <Select
                    autoFocus
                    onChange={getOnSelect()}
                    options={this.formatQualifiers()}
                    placeholder={qualifier || 'Select a qualifier'} />
              )
              : <div />
          }
          {this.renderInputField(charge, NUMBER_OF_COUNTS, onChange)}
          <DeleteButton onClick={() => this.deleteCharge(index)}>Remove</DeleteButton>
        </ChargeOptionsWrapper>
      </ChargeWrapper>
    );
  }

  handleFilterRequest = (chargeList :List, searchQuery :string) => {
    let matchesStatute;
    let matchesDescription;
    let nextCharges = chargeList;
    if (searchQuery) {
      nextCharges = nextCharges.filter((charge :Object) => {
        const statute = getFirstNeighborValue(charge.value, PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE);
        const description = getFirstNeighborValue(charge.value, PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION);
        if (statute) {
          matchesStatute = statute.toLowerCase().includes(searchQuery.toLowerCase());
        }
        if (description) {
          matchesDescription = description.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return matchesStatute || matchesDescription;
      });
    }
    return nextCharges;
  }

  renderCharges = () => {
    const { chargeList } = this.props;
    const { charges } = this.state;
    const chargeItems = charges.map(this.renderSingleCharge);
    return (
      <div>
        <SectionHeader>Charges</SectionHeader>
        {chargeItems}
        <Select
            value={null}
            placeholder="Select a charge"
            classNamePrefix="lattice-select"
            onChange={this.addCharge}
            options={chargeList}
            filterFn={this.handleFilterRequest} />
        <hr />
      </div>
    );
  }

  renderHeader = () => {
    return (
      <HeaderWrapper>
        <StyledTitle>Charge Details</StyledTitle>
        <SecondaryButton onClick={this.onSubmit}>Confirm Charges</SecondaryButton>
      </HeaderWrapper>
    );
  }

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

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);

  return {
    // App
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),

    // Charges
    [CHARGE_DATA.ARRESTING_AGENCIES]: charges.get(CHARGE_DATA.ARRESTING_AGENCIES),
  };
}

// $FlowFixMe
export default connect(mapStateToProps, null)(SelectChargesContainer);
