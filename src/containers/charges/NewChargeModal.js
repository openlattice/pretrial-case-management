/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { fromJS, Map, List } from 'immutable';

import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import NewChargeForm from '../../components/managecharges/NewChargeForm';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { Wrapper, TitleWrapper, CloseModalX } from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';
import { EDM } from '../../utils/consts/FrontEndStateConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';

import {
  createCharge,
  CREATE_CHARGE,
  deleteCharge,
  loadCharges,
  updateCharge
} from './ChargeActions';

const MODAL_WIDTH = '800px';

const { ARREST_CHARGE_LIST, COURT_CHARGE_LIST } = APP_TYPES;

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
  actions :{
    createCharge :RequestSequence,
    deleteCharge :RequestSequence,
    loadCharges :RequestSequence,
    updateCharge :RequestSequence
  },
  arrestEntitySetId :string,
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
      if (newValue !== undefined) entityFields[propertyTypeId] = [newValue];
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
      [PROPERTY_TYPES.CHARGE_IS_VIOLENT]: [newIsViolent]
    };
    if (chargeType === CHARGE_TYPES.ARREST) {
      newChargeFields = {
        ...newChargeFields,
        [PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE]: [newDegreeShort],
        [PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL]: [newDegree],
        [PROPERTY_TYPES.CHARGE_DMF_STEP_2]: [newIsStep2],
        [PROPERTY_TYPES.CHARGE_DMF_STEP_4]: [newIsStep4],
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
      actions,
      chargeType,
      entityKeyId,
      onClose,
      existingCharge
    } = this.props;

    if (existingCharge) {
      const entities = this.getChargeUpdate();
      actions.updateCharge({ chargeType, chargeEKID: entityKeyId, entities });
    }
    else {
      const newChargeEntity = this.getChargeFields();
      actions.createCharge({ chargeType, newChargeEntity });
    }
    onClose();
  }

  deleteCharge = () => {
    const {
      actions,
      chargeType,
      entityKeyId,
      onClose,
    } = this.props;
    const charge = fromJS(this.getChargeFields());

    actions.deleteCharge({ charge, chargeEKID: entityKeyId, chargeType });
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
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const edm = state.get(STATE.EDM);
  const orgId = app.get(APP_DATA.SELECTED_ORG_ID, '');
  return {
    // App
    app,
    [APP_DATA.SELECTED_ORG_ID]: orgId,
    arrestEntitySetId: getEntitySetIdFromApp(app, ARREST_CHARGE_LIST),
    courtEntitySetId: getEntitySetIdFromApp(app, COURT_CHARGE_LIST),
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),

    [EDM.FQN_TO_ID]: edm.get(EDM.FQN_TO_ID),

    // Charges
    submitChargeReqState: getReqState(charges, CREATE_CHARGE)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Charge Actions
    createCharge,
    deleteCharge,
    loadCharges,
    updateCharge
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(NewChargeModal);
