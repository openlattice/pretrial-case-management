/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';
import { Map } from 'immutable';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import NewChargeForm from '../../components/managecharges/NewChargeForm';
import { arrestChargeConfig, courtChargeConfig } from '../../config/formconfig/ChargeConfig';
import { CHARGE_TYPES } from '../../utils/consts/ChargeConsts';
import { APP_TYPES_FQNS, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { Wrapper, TitleWrapper, CloseModalX } from '../../utils/Layout';
import {
  APP,
  STATE,
  CHARGES,
  SUBMIT
} from '../../utils/consts/FrontEndStateConsts';

import * as OverrideClassNames from '../../utils/styleoverrides/OverrideClassNames';
import * as SubmitActionFactory from '../../utils/submit/SubmitActionFactory';
import * as DataActionFactory from '../../utils/data/DataActionFactory';
import * as ChargesActionFactory from './ChargesActionFactory';

const {
  ARREST_CHARGE_LIST,
  COURT_CHARGE_LIST
} = APP_TYPES_FQNS;

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
  arrestEntitySetsByOrganization :Map<*, *>,
  chargeType :string,
  courtEntitySetsByOrganization :Map<*, *>,
  creatingNew :boolean,
  description :string,
  degree :string,
  degreeShort :string,
  existingCharge :boolean,
  entityKeyId :string,
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

class NewChargeModal extends React.Component<Props, State> {

  static defaultProps = {
    onSubmit: () => {}
  }

  constructor(props :Props) {
    super(props);
    this.state = {
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
      [PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE]: degree,
      [PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL]: degreeShort,
      [PROPERTY_TYPES.CHARGE_IS_VIOLENT]: isViolent,
      [PROPERTY_TYPES.CHARGE_DMF_STEP_2]: isStep2,
      [PROPERTY_TYPES.CHARGE_DMF_STEP_4]: isStep4,
      [PROPERTY_TYPES.BHE]: isBHE,
      [PROPERTY_TYPES.BRE]: isBRE
    });
  }

  updateChargeCallback = () => {
    const {
      actions,
      chargeType,
      entityKeyId,
      selectedOrganizationId
    } = this.props;
    const { updateCharge } = actions;
    let entity = this.getChargeFields();
    entity = Object.assign({}, entity, { [OPENLATTICE_ID_FQN]: [entityKeyId] });
    const chargePropertyType = (chargeType === CHARGE_TYPES.COURT) ? CHARGES.COURT : CHARGES.ARREST;
    updateCharge({
      entity,
      entityKeyId,
      selectedOrganizationId,
      chargePropertyType
    });
  }

  getChargeFields = () => {
    const { state } = this;
    const { chargeType } = this.props;
    const newStatute = state[PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE];
    const newDescription = state[PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION];
    const newDegree = state[PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE];
    const newDegreeShort = state[PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL];
    const newIsViolent = state[PROPERTY_TYPES.CHARGE_IS_VIOLENT];
    const newIsStep2 = state[PROPERTY_TYPES.CHARGE_DMF_STEP_2];
    const newIsStep4 = state[PROPERTY_TYPES.CHARGE_DMF_STEP_4];
    const newIsBHE = state[PROPERTY_TYPES.BHE];
    const newIsBRE = state[PROPERTY_TYPES.BRE];
    let newChargeFields = {
      [PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE]: [newStatute],
      [PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION]: [newDescription],
      [PROPERTY_TYPES.CHARGE_IS_VIOLENT]: [newIsViolent],
    };
    if (chargeType === CHARGE_TYPES.ARREST) {
      newChargeFields = Object.assign({}, newChargeFields, {
        [PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE]: [newDegree],
        [PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL]: [newDegreeShort],
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
      arrestEntitySetsByOrganization,
      courtEntitySetsByOrganization,
      chargeType,
      selectedOrganizationId
    } = this.props;
    let entitySetId;
    if (chargeType === CHARGE_TYPES.COURT) {
      entitySetId = courtEntitySetsByOrganization.get(selectedOrganizationId, '');
    }
    if (chargeType === CHARGE_TYPES.ARREST) {
      entitySetId = arrestEntitySetsByOrganization.get(selectedOrganizationId, '');
    }
    return entitySetId;
  }

  reloadChargesCallback = () => {
    const {
      actions,
      arrestEntitySetsByOrganization,
      courtEntitySetsByOrganization,
      selectedOrganizationId
    } = this.props;
    const arrestChargesEntitySetId = arrestEntitySetsByOrganization.get(selectedOrganizationId, '');
    const courtChargesEntitySetId = courtEntitySetsByOrganization.get(selectedOrganizationId, '');
    if (arrestChargesEntitySetId && courtChargesEntitySetId) {
      actions.loadCharges({
        arrestChargesEntitySetId,
        courtChargesEntitySetId,
        selectedOrgId: selectedOrganizationId
      });
    }
  }

  updateCharge = () => {
    const {
      actions,
      chargeType,
      entityKeyId,
      onClose,
      existingCharge
    } = this.props;
    const { replaceEntity, submit } = actions;
    const entitySetId = this.getChargeListEntitySetId();
    let config;
    // TODO: We propbably want to change the name of these entity sets so that they capture county and state
    if (chargeType === CHARGE_TYPES.COURT) {
      config = courtChargeConfig(entitySetId);
    }
    if (chargeType === CHARGE_TYPES.ARREST) {
      config = arrestChargeConfig(entitySetId);
    }

    const newChargeFields = this.getChargeFields();

    if (existingCharge) {
      replaceEntity({
        entityKeyId,
        entitySetId,
        values: newChargeFields,
        callback: this.updateChargeCallback
      });
    }
    else {
      submit({
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
      chargePropertyType
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
    const { state } = this;
    const statute = state[PROPERTY_TYPES.REFERENCE_CHARGE_STATUTE];
    const description = state[PROPERTY_TYPES.REFERENCE_CHARGE_DESCRIPTION];
    return !!(statute && description);
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
    return (
      <Wrapper>
        <Modal
            show={open}
            onHide={onClose}
            dialogClassName={OverrideClassNames.PSA_REVIEW_MODAL}>
          <Modal.Body>
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
                  degree={state[PROPERTY_TYPES.REFERENCE_CHARGE_DEGREE]}
                  degreeShort={state[PROPERTY_TYPES.REFERENCE_CHARGE_LEVEL]}
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
                  modal />
            </Body>
          </Modal.Body>
        </Modal>
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  const submit = state.get(STATE.SUBMIT);
  const app = state.get(STATE.APP);

  return {
    // App
    arrestEntitySetsByOrganization: app.getIn([ARREST_CHARGE_LIST.toString(), APP.ENTITY_SETS_BY_ORG], Map()),
    courtEntitySetsByOrganization: app.getIn([COURT_CHARGE_LIST.toString(), APP.ENTITY_SETS_BY_ORG], Map()),
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_TITLE]: app.get(APP.SELECTED_ORG_TITLE),

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
