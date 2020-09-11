/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { bindActionCreators } from 'redux';
import { fromJS, List, Map } from 'immutable';
import { Button, Checkbox, Input } from 'lattice-ui-kit';

import ConfirmationModal from '../../components/ConfirmationModal';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { EDM } from '../../utils/consts/FrontEndStateConsts';
import { CHARGE_TYPES, CHARGE_HEADERS } from '../../utils/consts/ChargeConsts';
import { CONFIRMATION_ACTION_TYPES, CONFIRMATION_OBJECT_TYPES } from '../../utils/consts/Consts';
import { OL } from '../../utils/consts/Colors';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import {
  InputRow,
  InputGroup,
  InputLabel
} from '../../components/person/PersonFormTags';

import {
  CREATE_CHARGE,
  DELETE_CHARGE,
  UPDATE_CHARGE,
  createCharge,
  deleteCharge,
  updateCharge
} from './ChargeActions';

// Redux State Imports
import { getReqState, requestIsPending, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';
import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';

const { ARREST_CHARGE_LIST, COURT_CHARGE_LIST } = APP_TYPES;

const {
  ENTITY_KEY_ID,
  REFERENCE_CHARGE_STATUTE,
  REFERENCE_CHARGE_DESCRIPTION,
  REFERENCE_CHARGE_LEVEL,
  REFERENCE_CHARGE_DEGREE,
  CHARGE_IS_VIOLENT,
  CHARGE_RCM_STEP_2,
  CHARGE_RCM_STEP_4,
  BHE,
  BRE
} = PROPERTY_TYPES;

const ModalBody = styled.div`
  height: max-content;
  padding-bottom: 30px;
  width: 100%;
`;

const ButtonContainer = styled.div`
  margin: 30px 0;
  width: fit-content;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  button {
    margin-right: 10px;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 30px 0 0;

  label {
    width: 100%;
    font-size: 14px;
    color: ${OL.GREY02};
  }
`;

type Props = {
  actions :{
    createCharge :RequestSequence;
    deleteCharge :RequestSequence;
    updateCharge :RequestSequence;
  };
  arrestEntitySetId :string;
  charge :Map;
  chargeType :string;
  confirmViolentCharge :boolean;
  courtEntitySetId :string;
  createChargeReqState :RequestState;
  creatingNew :boolean;
  deleteCharge :() => void;
  deleteChargeReqState :RequestState;
  fqnToIdMap :Map;
  onClose :() => void;
  settings :Map;
  updateChargeReqState :RequestState;
}

const INITIAL_STATE :Object = {
  editing: true,
  chargeEKID: '',
  confirmationModalOpen: false,
  confirmViolentCharge: false,
  [REFERENCE_CHARGE_STATUTE]: '',
  [REFERENCE_CHARGE_DESCRIPTION]: '',
  [REFERENCE_CHARGE_DEGREE]: '',
  [REFERENCE_CHARGE_LEVEL]: '',
  [CHARGE_IS_VIOLENT]: false,
  [CHARGE_RCM_STEP_2]: false,
  [CHARGE_RCM_STEP_4]: false,
  [BHE]: false,
  [BRE]: false
};

type State = {
  chargeEKID:string;
  confirmationModalOpen :boolean;
  confirmViolentCharge :boolean,
  editing :boolean;
  'ol.id' :string;
  'ol.name' :string;
  'ol.level' :string;
  'ol.levelstate' :string;
  'ol.violent' :boolean;
  'ol.dmfstep2indicator' :boolean;
  'ol.dmfstep4indicator' :boolean;
  'ol.bheindicator' :boolean;
  'ol.breindicator' :boolean;
};

class NewChargeForm extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidMount() {
    const { charge } = this.props;
    if (charge.size) {
      this.mapChargeToState();
    }
  }

  componentDidUpdate(prevProps :Props) {
    const {
      charge,
      onClose,
      createChargeReqState,
      deleteChargeReqState,
      updateChargeReqState
    } = this.props;
    const {
      charge: prevCharge,
      createChargeReqState: prevCreateChargeReqState,
      deleteChargeReqState: prevDeleteChargeReqState,
      updateChargeReqState: prevUpdateChargeReqState,
    } = prevProps;
    const creationWasPending = requestIsPending(prevCreateChargeReqState);
    const creationIsSuccess = requestIsSuccess(createChargeReqState);
    const deletionWasPending = requestIsPending(prevDeleteChargeReqState);
    const deletionIsSuccess = requestIsSuccess(deleteChargeReqState);
    const updateWasPending = requestIsPending(prevUpdateChargeReqState);
    const updateIsSuccess = requestIsSuccess(updateChargeReqState);
    if (!prevCharge.size && charge.size) {
      this.mapChargeToState();
    }
    if (deletionWasPending && deletionIsSuccess) {
      onClose();
    }
    if ((creationWasPending && creationIsSuccess) || (updateWasPending && updateIsSuccess)) {
      this.setState({ editing: false });
    }
  }

  chargeRequestPending = () => {
    const {
      createChargeReqState,
      deleteChargeReqState,
      updateChargeReqState
    } = this.props;
    return requestIsPending(createChargeReqState)
      || requestIsPending(deleteChargeReqState)
      || requestIsPending(updateChargeReqState);
  }

  mapChargeToState = () => {
    const { charge } = this.props;
    const {
      [ENTITY_KEY_ID]: chargeEKID,
      [REFERENCE_CHARGE_STATUTE]: statute,
      [REFERENCE_CHARGE_DESCRIPTION]: description,
      [CHARGE_IS_VIOLENT]: isViolent,
      [REFERENCE_CHARGE_DEGREE]: degree,
      [REFERENCE_CHARGE_LEVEL]: degreeShort,
      [CHARGE_RCM_STEP_2]: rcmMaxIncrease,
      [CHARGE_RCM_STEP_4]: rcmSingleIncrease,
      [BHE]: bhe,
      [BRE]: bre,
    } = getEntityProperties(charge, [
      ENTITY_KEY_ID,
      REFERENCE_CHARGE_STATUTE,
      REFERENCE_CHARGE_DESCRIPTION,
      REFERENCE_CHARGE_LEVEL,
      REFERENCE_CHARGE_DEGREE,
      CHARGE_IS_VIOLENT,
      CHARGE_RCM_STEP_2,
      CHARGE_RCM_STEP_4,
      BHE,
      BRE
    ]);
    this.setState({
      chargeEKID,
      editing: !charge.size,
      [REFERENCE_CHARGE_STATUTE]: statute,
      [REFERENCE_CHARGE_DESCRIPTION]: description,
      [CHARGE_IS_VIOLENT]: isViolent || false,
      [REFERENCE_CHARGE_DEGREE]: degree,
      [REFERENCE_CHARGE_LEVEL]: degreeShort,
      [CHARGE_RCM_STEP_2]: rcmMaxIncrease || false,
      [CHARGE_RCM_STEP_4]: rcmSingleIncrease || false,
      [BHE]: bhe || false,
      [BRE]: bre || false,
    });
  }

  getChargeUpdate = () => {
    const { state } = this;
    const { chargeEKID } = this.state;
    const { fqnToIdMap } = this.props;
    const chargePropertyTypes = List.of(
      PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE,
      PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION,
      PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL,
      PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE,
      PROPERTY_TYPES.CHARGE_IS_VIOLENT,
      PROPERTY_TYPES.CHARGE_RCM_STEP_2,
      PROPERTY_TYPES.CHARGE_RCM_STEP_4,
      PROPERTY_TYPES.BHE,
      PROPERTY_TYPES.BRE,
    );
    const entityFields = {};
    chargePropertyTypes.forEach((propertyType) => {
      const newValue = state[propertyType];
      const propertyTypeId = fqnToIdMap.get(propertyType, '');
      if (newValue !== undefined) entityFields[propertyTypeId] = [newValue];
    });
    return { [chargeEKID]: entityFields };
  }

  getChargeFields = () => {
    const { state } = this;
    const { chargeType } = this.props;
    const newStatute = state[PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE];
    const newDescription = state[PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION];
    const newDegree = state[PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL];
    const newDegreeShort = state[PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE];
    const newIsViolent = state[PROPERTY_TYPES.CHARGE_IS_VIOLENT];
    const newIsStep2 = state[PROPERTY_TYPES.CHARGE_RCM_STEP_2];
    const newIsStep4 = state[PROPERTY_TYPES.CHARGE_RCM_STEP_4];
    const newIsBHE = state[PROPERTY_TYPES.BHE];
    const newIsBRE = state[PROPERTY_TYPES.BRE];
    let newChargeFields = {
      [PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE]: [newStatute],
      [PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION]: [newDescription],
      [PROPERTY_TYPES.CHARGE_IS_VIOLENT]: [newIsViolent],
      [PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE]: [newDegreeShort],
      [PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL]: [newDegree],
      [PROPERTY_TYPES.CHARGE_RCM_STEP_2]: [newIsStep2],
      [PROPERTY_TYPES.CHARGE_RCM_STEP_4]: [newIsStep4],
    };
    if (chargeType === CHARGE_TYPES.ARREST) {
      newChargeFields = {
        ...newChargeFields,
        [PROPERTY_TYPES.BHE]: [newIsBHE],
        [PROPERTY_TYPES.BRE]: [newIsBRE]
      };
    }
    return newChargeFields;
  }

  getChargeListEntitySetId = () => {
    const {
      arrestEntitySetId,
      courtEntitySetId,
      chargeType
    } = this.props;
    let entitySetId;
    if (chargeType === CHARGE_TYPES.ARREST) {
      entitySetId = arrestEntitySetId;
    }
    if (chargeType === CHARGE_TYPES.COURT) {
      entitySetId = courtEntitySetId;
    }
    return entitySetId;
  }

  submitCharge = () => {
    const {
      actions,
      charge,
      chargeType
    } = this.props;
    const { chargeEKID } = this.state;

    if (charge.size) {
      const entities = this.getChargeUpdate();
      actions.updateCharge({ chargeType, chargeEKID, entities });
    }
    else {
      const newChargeEntity = this.getChargeFields();
      actions.createCharge({ chargeType, newChargeEntity });
    }
    this.cancelEditCharge();
  }

  deleteCharge = () => {
    const { actions, chargeType } = this.props;
    const { chargeEKID } = this.state;
    if (chargeEKID) {
      const charge = fromJS(this.getChargeFields());
      actions.deleteCharge({ charge, chargeEKID, chargeType });
      this.closeConfirmationModal();
    }
  }

  isReadyToSubmit = () :boolean => {
    const { confirmViolentCharge } = this.state;
    const { state } = this;
    const statute = state[PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE];
    const description = state[PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION];
    return !!(statute && description && confirmViolentCharge);
  }

  onInputChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleCheckboxChange = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    this.setState({
      [value]: checked
    });
  }

  editCharge = () => (this.setState({ editing: true }));
  cancelEditCharge = () => (this.setState({ editing: false }))

  openConfirmationModal = () => this.setState({ confirmationModalOpen: true });
  closeConfirmationModal = () => this.setState({ confirmationModalOpen: false });

  renderButtons = () => {
    const { editing } = this.state;
    const { creatingNew } = this.props;
    let modifyButtons;
    if (!creatingNew && !editing) {
      modifyButtons = (
        <ButtonContainer>
          <Button color="primary" onClick={this.editCharge}>Edit Charge</Button>
          <Button color="error" onClick={this.openConfirmationModal}>Delete</Button>
        </ButtonContainer>
      );
    }
    else {
      modifyButtons = (
        <ButtonContainer>
          <Button color="primary" disabled={!this.isReadyToSubmit()} onClick={this.submitCharge}>Submit</Button>
          <Button color="secondary" onClick={this.cancelEditCharge}>Cancel</Button>
        </ButtonContainer>
      );
    }
    return modifyButtons;
  }

  renderInput = (name :string, value :string) => {
    const { editing } = this.state;
    const { charge } = this.props;
    let input;
    if (editing || !charge.size) {
      input = (
        <Input
            disabled={this.chargeRequestPending()}
            name={name}
            value={value}
            onChange={this.onInputChange} />
      );
    }
    else {
      input = <div>{value}</div>;
    }
    return input;
  }

  renderCheckboxInput = (
    name :string,
    value :string,
    checked :boolean
  ) => {
    const { editing } = this.state;
    const { charge } = this.props;
    const disabled = !charge.size ? false : !editing;
    const label = this.formatBooleanLabel(checked);
    return (
      <Checkbox
          mode="button"
          name={name}
          value={value}
          checked={checked}
          onChange={this.handleCheckboxChange}
          disabled={disabled || this.chargeRequestPending()}
          label={label} />
    );
  }

  formatBooleanLabel = (boolean :boolean) => (boolean ? 'Yes' : 'No');

  renderConfirmationModal = () => {
    const { confirmationModalOpen } = this.state;

    return (
      <ConfirmationModal
          confirmationType={CONFIRMATION_ACTION_TYPES.DELETE}
          objectType={CONFIRMATION_OBJECT_TYPES.CHARGE}
          onClose={this.closeConfirmationModal}
          open={confirmationModalOpen}
          confirmationAction={this.deleteCharge} />
    );
  }

  render() {
    const { chargeType, confirmViolentCharge, settings } = this.props;
    const arrestsIntegrated = settings.get(SETTINGS.ARRESTS_INTEGRATED, false);
    const courtCasesIntegrated = settings.get(SETTINGS.COURT_CASES_INTEGRATED, false);
    const includeLevelIncreases = settings.get(SETTINGS.STEP_INCREASES, false);
    const includeSecondaryBookingCharges = settings.get(SETTINGS.SECONDARY_BOOKING_CHARGES, false);
    const integratedArrestCharges = (chargeType === CHARGE_TYPES.ARREST) && arrestsIntegrated;
    const integratedCourtCharges = (chargeType === CHARGE_TYPES.COURT) && courtCasesIntegrated;
    const {
      editing,
      [REFERENCE_CHARGE_STATUTE]: statute,
      [REFERENCE_CHARGE_DESCRIPTION]: description,
      [CHARGE_IS_VIOLENT]: isViolent,
      [REFERENCE_CHARGE_DEGREE]: degreeShort,
      [REFERENCE_CHARGE_LEVEL]: degree,
      [CHARGE_RCM_STEP_2]: rcmMaxIncrease,
      [CHARGE_RCM_STEP_4]: rcmSingleIncrease,
      [BHE]: bhe,
      [BRE]: bre,
    } = this.state;

    const confirmViolentText = isViolent
      ? 'CHARGE IS VIOLENT'
      : 'CHARGE IS NOT VIOLENT';

    const confirmViolentDisabled = !(statute && description);

    return (
      <ModalBody>
        <InputRow numColumns={3}>
          <InputGroup>
            <InputLabel>Statute</InputLabel>
            {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE, statute) }
          </InputGroup>
          <InputGroup>
            <InputLabel>Degree</InputLabel>
            {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL, degree) }
          </InputGroup>
          {
            (integratedArrestCharges || integratedCourtCharges) && (
              <InputGroup>
                <InputLabel>Degree (Short)</InputLabel>
                {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE, degreeShort) }
              </InputGroup>
            )
          }
        </InputRow>
        <InputRow numColumns={1}>
          <InputGroup>
            <InputLabel>Description</InputLabel>
            {this.renderInput(PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION, description) }
          </InputGroup>
        </InputRow>
        <InputRow numColumns={5}>
          <InputGroup>
            <InputLabel>Violent</InputLabel>
            {this.renderCheckboxInput(CHARGE_HEADERS.VIOLENT, PROPERTY_TYPES.CHARGE_IS_VIOLENT, isViolent)}
          </InputGroup>
          {
            includeLevelIncreases
              && (
                <>
                  <InputGroup>
                    <InputLabel>Max Increase</InputLabel>
                    {this.renderCheckboxInput(CHARGE_HEADERS.STEP_2, PROPERTY_TYPES.CHARGE_RCM_STEP_2, rcmMaxIncrease)}
                  </InputGroup>
                  <InputGroup>
                    <InputLabel>Single Increase</InputLabel>
                    {this.renderCheckboxInput(
                      CHARGE_HEADERS.STEP_4,
                      PROPERTY_TYPES.CHARGE_RCM_STEP_4,
                      rcmSingleIncrease
                    )}
                  </InputGroup>
                </>
              )
          }
          {
            (chargeType === CHARGE_TYPES.ARREST) && includeSecondaryBookingCharges
              && (
                <>
                  <InputGroup>
                    <InputLabel>BHE</InputLabel>
                    {this.renderCheckboxInput(CHARGE_HEADERS.BHE, PROPERTY_TYPES.BHE, bhe)}
                  </InputGroup>
                  <InputGroup>
                    <InputLabel>BRE</InputLabel>
                    {this.renderCheckboxInput(CHARGE_HEADERS.BRE, PROPERTY_TYPES.BRE, bre)}
                  </InputGroup>
                </>
              )
          }
        </InputRow>
        {
          editing
            ? (
              <InputRow>
                <CheckboxContainer>
                  <Checkbox
                      name="confirmViolentCharge"
                      label={confirmViolentText}
                      checked={confirmViolentCharge}
                      value="confirmViolentCharge"
                      onChange={this.handleCheckboxChange}
                      disabled={confirmViolentDisabled || this.chargeRequestPending() || !editing} />
                </CheckboxContainer>
              </InputRow>
            ) : null
        }
        { this.renderButtons() }
        { this.renderConfirmationModal() }
      </ModalBody>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const edm = state.get(STATE.EDM);
  const settings = state.get(STATE.SETTINGS);

  const arrestEntitySetId = getEntitySetIdFromApp(app, ARREST_CHARGE_LIST);
  const courtEntitySetId = getEntitySetIdFromApp(app, COURT_CHARGE_LIST);
  return {
    arrestEntitySetId,
    courtEntitySetId,
    createChargeReqState: getReqState(charges, CREATE_CHARGE),
    deleteChargeReqState: getReqState(charges, DELETE_CHARGE),
    updateChargeReqState: getReqState(charges, UPDATE_CHARGE),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),

    settings: settings.get(SETTINGS_DATA.APP_SETTINGS, Map())
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    createCharge,
    deleteCharge,
    updateCharge
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(NewChargeForm);
