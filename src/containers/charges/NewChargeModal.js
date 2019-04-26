/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';
import { Map, List } from 'immutable';

import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import NewChargeForm from '../../components/managecharges/NewChargeForm';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { arrestChargeConfig, courtChargeConfig } from '../../config/formconfig/ChargeConfig';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';
import { ID_FIELD_NAMES } from '../../utils/consts/Consts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { Wrapper, TitleWrapper, CloseModalX } from '../../utils/Layout';
import {
  APP,
  CHARGES,
  EDM,
  STATE,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';

import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as ChargesActionFactory from './ChargesActionFactory';

const MODAL_WIDTH = '800px';

const { ARREST_CHARGE_LIST, COURT_CHARGE_LIST } = APP_TYPES;

const { OPENLATTICE_ID_FQN } = Constants;

const Body = styled.div`
  border: none;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  margin: 0 -15px;
  width: calc(100% + 30px);
`;

type Props = {
  arrestEntitySetId :string,
  app :Map<*, *>,
  chargeType :string,
  courtEntitySetId :string,
  creatingNew :boolean,
  description :string,
  degree :string,
  degreeShort :string,
  existingCharge :boolean,
  entityKeyId :string,
  fqnToIdMap :Map<*, *>,
  isViolent :boolean,
  isStep2 :boolean,
  isStep4 :boolean,
  isBHE :boolean,
  isBRE :boolean,
  onClose :() => void,
  open :boolean,
  statute :string,
  selectedOrganizationId :string,
  actions :{
    deleteCharge :(values :{
      entityKeyId :string,
      selectedOrganizationId :string,
      chargePropertyType :string,
    }) => void,
    deleteEntity :(values :{
      entityKeyId :string,
      entitySetId :string,
      entitySetName :string,
    }) => void,
    updateEntity :(values :{
      entitySetId :string,
      entities :string,
      updateType :string,
      callback :() => void
    }) => void,
    updateCharge :(values :{
      entityKeyId :string,
      selectedOrganizationId :string,
      chargePropertyType :string,
    }) => void,
    submit :(values :{
      config :Map<*, *>,
      values :Map<*, *>,
      callback :() => void
    }) => void,
    replaceEntity :(value :{ entitySetName :string, entityKeyId :string, values :Object }) => void,
  },
}

const INITIAL_STATE = {
  confirmViolentCharge: false,
  [PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE]: '',
  [PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION]: '',
  [PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE]: '',
  [PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL]: '',
  [PROPERTY_TYPES.CHARGE_IS_VIOLENT]: false,
  [PROPERTY_TYPES.CHARGE_DMF_STEP_2]: false,
  [PROPERTY_TYPES.CHARGE_DMF_STEP_4]: false,
  [PROPERTY_TYPES.BHE]: false,
  [PROPERTY_TYPES.BRE]: false
};

class NewChargeModal extends React.Component<Props, State> {

  static defaultProps = {
    onSubmit: () => {}
  }

  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidMount() {
    const {
      statute,
      description,
      degree,
      degreeShort,
      existingCharge,
      isViolent,
      isStep2,
      isStep4,
      isBHE,
      isBRE
    } = this.props;
    if (existingCharge) {
      this.updateState(
        statute,
        description,
        degree,
        degreeShort,
        isViolent,
        isStep2,
        isStep4,
        isBHE,
        isBRE
      );
    }
  }

  clearState = () => {
    this.setState(INITIAL_STATE);
  }

  updateState = (
    statute,
    description,
    degree,
    degreeShort,
    isViolent,
    isStep2,
    isStep4,
    isBHE,
    isBRE
  ) => {
    this.setState({
      [PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE]: statute,
      [PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION]: description,
      [PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL]: degree,
      [PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE]: degreeShort,
      [PROPERTY_TYPES.CHARGE_IS_VIOLENT]: isViolent,
      [PROPERTY_TYPES.CHARGE_DMF_STEP_2]: isStep2,
      [PROPERTY_TYPES.CHARGE_DMF_STEP_4]: isStep4,
      [PROPERTY_TYPES.BHE]: isBHE,
      [PROPERTY_TYPES.BRE]: isBRE
    });
  }

  getChargeUpdate = () => {
    const { state } = this;
    const { entityKeyId, fqnToIdMap } = this.props;
    const chargePropertyTypes = List.of(
      PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE,
      PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION,
      PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL,
      PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE,
      PROPERTY_TYPES.CHARGE_IS_VIOLENT,
      PROPERTY_TYPES.CHARGE_DMF_STEP_2,
      PROPERTY_TYPES.CHARGE_DMF_STEP_4,
      PROPERTY_TYPES.BHE,
      PROPERTY_TYPES.BRE,
    );
    const entityFields = {};
    chargePropertyTypes.forEach((propertyType) => {
      const newValue = state[propertyType];
      const propertyTypeId = fqnToIdMap.get(propertyType, '');
      if (newValue) entityFields[propertyTypeId] = [newValue];
    });
    return { [entityKeyId]: entityFields };
  }

  getChargeFields = () => {
    const { state } = this;
    const { chargeType } = this.props;
    const newStatute = state[PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE];
    const newDescription = state[PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION];
    const newDegree = state[PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL];
    const newDegreeShort = state[PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE];
    const newIsViolent = state[PROPERTY_TYPES.CHARGE_IS_VIOLENT];
    const newIsStep2 = state[PROPERTY_TYPES.CHARGE_DMF_STEP_2];
    const newIsStep4 = state[PROPERTY_TYPES.CHARGE_DMF_STEP_4];
    const newIsBHE = state[PROPERTY_TYPES.BHE];
    const newIsBRE = state[PROPERTY_TYPES.BRE];
    let newChargeFields = {
      [PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE]: [newStatute],
      [PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION]: [newDescription],
      [PROPERTY_TYPES.CHARGE_IS_VIOLENT]: [newIsViolent],
      [ID_FIELD_NAMES.CHARGE_ID]: [`${newStatute}|${newDescription}`],
    };
    if (chargeType === CHARGE_TYPES.ARREST) {
      newChargeFields = Object.assign({}, newChargeFields, {
        [PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE]: [newDegreeShort],
        [PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL]: [newDegree],
        [PROPERTY_TYPES.CHARGE_DMF_STEP_2]: [newIsStep2],
        [PROPERTY_TYPES.CHARGE_DMF_STEP_4]: [newIsStep4],
        [PROPERTY_TYPES.BHE]: [newIsBHE],
        [PROPERTY_TYPES.BRE]: [newIsBRE]
      });
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

  reloadChargesCallback = () => {
    const {
      actions,
      selectedOrganizationId,
      arrestEntitySetId,
      courtEntitySetId
    } = this.props;
    actions.loadCharges({
      selectedOrgId: selectedOrganizationId,
      arrestChargesEntitySetId: arrestEntitySetId,
      courtChargesEntitySetId: courtEntitySetId
    });
    this.clearState();
  }

  updateCharge = () => {
    const {
      app,
      actions,
      chargeType,
      onClose,
      existingCharge
    } = this.props;
    const { updateEntity, submit } = actions;
    const entitySetId = this.getChargeListEntitySetId();
    let config;
    // TODO: We propbably want to change the name of these entity sets so that they capture county and state
    if (chargeType === CHARGE_TYPES.COURT) {
      config = courtChargeConfig();
    }
    if (chargeType === CHARGE_TYPES.ARREST) {
      config = arrestChargeConfig();
    }


    if (existingCharge) {
      const entities = this.getChargeUpdate();
      updateEntity({
        entitySetId,
        entities,
        updateType: 'PartialReplace',
        callback: this.reloadChargesCallback
      });
    }
    else {
      const newChargeFields = this.getChargeFields();
      submit({
        app,
        config,
        values: newChargeFields,
        callback: this.reloadChargesCallback
      });
    }
    onClose();
  }

  deleteChargeCallback = () => {
    const {
      actions,
      chargeType,
      entityKeyId,
      selectedOrganizationId
    } = this.props;
    const { deleteCharge } = actions;
    const chargePropertyType = (chargeType === CHARGE_TYPES.COURT) ? CHARGES.COURT : CHARGES.ARREST;
    deleteCharge({
      entityKeyId,
      selectedOrganizationId,
      chargePropertyType,
      callback: this.reloadChargesCallback
    });
  }

  deleteCharge = () => {
    const {
      actions,
      entityKeyId,
      onClose,
    } = this.props;
    const { deleteEntity } = actions;
    const entitySetId = this.getChargeListEntitySetId();

    deleteEntity({ entityKeyId, entitySetId, callback: this.deleteChargeCallback });
    onClose();
  }

  isReadyToSubmit = () :boolean => {
    const { confirmViolentCharge } = this.state;
    const { state } = this;
    const statute = state[PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE];
    const description = state[PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION];
    return !!(statute && description && confirmViolentCharge);
  }

  onInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    this.setState({
      [value]: checked
    });
  }

  render() {
    const {
      open,
      onClose,
      chargeType,
      creatingNew,
      existingCharge
    } = this.props;
    const { state } = this;
    const { confirmViolentCharge } = this.state;
    return (
      <Wrapper>
        <ModalTransition>
          {
            open
            && (
              <Modal
                  scrollBehavior="outside"
                  onClose={() => onClose()}
                  width={MODAL_WIDTH}
                  shouldCloseOnOverlayClick
                  stackIndex={1}>
                <TitleWrapper>
                  <h1>{ creatingNew ? 'Create New Charge' : 'Update Charge'}</h1>
                  <div>
                    <CloseModalX onClick={onClose} />
                  </div>
                </TitleWrapper>
                <Body>
                  <NewChargeForm
                      statute={state[PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE]}
                      chargeType={chargeType}
                      creatingNew={creatingNew}
                      deleteCharge={this.deleteCharge}
                      description={state[PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION]}
                      degree={state[PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL]}
                      degreeShort={state[PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE]}
                      existingCharge={existingCharge}
                      isViolent={state[PROPERTY_TYPES.CHARGE_IS_VIOLENT]}
                      isStep2={state[PROPERTY_TYPES.CHARGE_DMF_STEP_2]}
                      isStep4={state[PROPERTY_TYPES.CHARGE_DMF_STEP_4]}
                      isBHE={state[PROPERTY_TYPES.BHE]}
                      isBRE={state[PROPERTY_TYPES.BRE]}
                      handleCheckboxChange={this.handleCheckboxChange}
                      handleOnChangeInput={this.onInputChange}
                      onSubmit={this.updateCharge}
                      readyToSubmit={this.isReadyToSubmit()}
                      confirmViolentCharge={confirmViolentCharge}
                      modal />
                </Body>
              </Modal>
            )
          }
        </ModalTransition>
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const submit = state.get(STATE.SUBMIT);
  const app = state.get(STATE.APP);
  const edm = state.get(STATE.EDM);
  const orgId = app.get(APP.SELECTED_ORG_ID, '');
  return {
    // App
    app,
    [APP.SELECTED_ORG_ID]: orgId,
    arrestEntitySetId: getEntitySetIdFromApp(app, ARREST_CHARGE_LIST),
    courtEntitySetId: getEntitySetIdFromApp(app, COURT_CHARGE_LIST),
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_TITLE]: app.get(APP.SELECTED_ORG_TITLE),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),

    // Submit
    [SUBMIT.SUBMITTING]: submit.get(SUBMIT.SUBMITTING, false)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(ChargesActionFactory).forEach((action :string) => {
    actions[action] = ChargesActionFactory[action];
  });

  Object.keys(DataActionFactory).forEach((action :string) => {
    actions[action] = DataActionFactory[action];
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

export default connect(mapStateToProps, mapDispatchToProps)(NewChargeModal);
