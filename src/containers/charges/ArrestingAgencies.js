import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Button,
  CardSegment,
  Input,
  Modal,
  CheckboxSelect
} from 'lattice-ui-kit';

import ArrestingAgenciesTable from '../../components/arrestingagencies/ArrestingAgenciesTable';
import { SETTINGS } from '../../utils/consts/AppSettingConsts';
import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityProperties } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';
import { CHARGE_DATA } from '../../utils/consts/redux/ChargeConsts';
import { COUNTIES_DATA } from '../../utils/consts/redux/CountiesConsts';
import { getReqState, requestIsPending, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';

import { addArrestingAgency, ADD_ARRESTING_AGENCY, LOAD_ARRESTING_AGENCIES } from './ChargeActions';
import { deleteEntity } from '../../utils/data/DataActions';

const { PREFERRED_COUNTY } = SETTINGS;

const { ARRESTING_AGENCIES } = APP_TYPES;
const {
  ENTITY_KEY_ID,
  GENERAL_ID,
  ID,
  NAME
} = PROPERTY_TYPES;

const CardSegmentStyled = styled(CardSegment)`
  margin-bottom: 30px;
`;

const Header = styled.div`
  align-items: baseline;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  width: 600px;

  svg {
    margin: 10px;
  }
`;

const TableWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 30px;
`;

const Wrapper = styled.div`
  width: 100%;
  align-items: flex-end;
  padding-bottom: 30px;

  button {
    height: max-content;
    min-width: 100px;
    margin-top: 30px;
  }

  input {
    min-width: 220px;
  }

  > div {
    display: flex;
    flex-direction: column;
    margin-right: 10px;
  }
`;

type Props = {
  actions :{
    addArrestingAgency :RequestSequence;
    deleteEntity :RequestSequence;
  };
  app :Map;
  addArrestingAgencyRS :RequestState;
  countyOptions :Object[];
  editing :boolean;
  formattedArrestingAgencies :Object[];
  loadArrestingAgencyRS :RequestState;
};

type State = {
  abbreviation :string;
  agency :string;
  createArrestingAgencyModal :boolean;
  jurisdictions :Map[];
}

const INITIAL_STATE = {
  abbreviation: '',
  agency: '',
  createArrestingAgencyModal: false,
  jurisdictions: []
};

class ArrestingAgencies extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidUpdate(prevProps :Props) {
    const { addArrestingAgencyRS: prevAddArrestingAgencyRS } = prevProps;
    const { addArrestingAgencyRS } = this.props;

    const addArrestingAgencyWasPending = requestIsPending(prevAddArrestingAgencyRS);
    const addArrestingAgencySuccessful = requestIsSuccess(addArrestingAgencyRS);
    if (addArrestingAgencyWasPending && addArrestingAgencySuccessful) {
      this.setState({ createArrestingAgencyModal: false });
      this.handleClose();
    }
  }

  updateInput = (e :SyntheticInputEvent<HTMLInputElement> | Object) => {
    const { target } = e;
    if (!target) {
      this.setState({ jurisdictions: e });
    }
    else {
      const { name, value } = target;
      this.setState({ [name]: value });
    }
  }

  addAgency = () => {
    const { abbreviation, agency, jurisdictions } = this.state;
    const { actions } = this.props;
    actions.addArrestingAgency({ abbreviation, agency, jurisdictions });
  }

  handleClose = () => this.setState(INITIAL_STATE);

  openCreateAgencyModal = () => this.setState({ createArrestingAgencyModal: true });

  deleteAgency = (agencyEKID :UUID) => {
    const { actions, app } = this.props;
    const arrestAgenciesESID = getEntitySetIdFromApp(app, ARRESTING_AGENCIES);
    actions.deleteEntity({
      entityKeyIds: [agencyEKID],
      entitySetId: arrestAgenciesESID
    });
  }

  readyToSubmit = () => {
    const { abbreviation, agency, jurisdictions } = this.state;
    return abbreviation.length && agency.length && jurisdictions.length;
  }

  render() {
    const { agency, abbreviation, createArrestingAgencyModal } = this.state;
    const {
      addArrestingAgencyRS,
      countyOptions,
      editing,
      formattedArrestingAgencies,
      loadArrestingAgencyRS
    } = this.props;
    const addArrestingAgencyIsPending = requestIsPending(addArrestingAgencyRS);
    const loadArrestingAgencyIsPending = requestIsPending(loadArrestingAgencyRS);
    return (
      <CardSegmentStyled vertical>
        <TableWrapper>
          <Header>
            <h4>Arresting Agencies</h4>
            <Button color="secondary" onClick={this.openCreateAgencyModal}>Add Agency</Button>
          </Header>
          <ArrestingAgenciesTable
              agencies={formattedArrestingAgencies}
              deleteFn={this.deleteAgency}
              editing={editing}
              loading={loadArrestingAgencyIsPending} />
        </TableWrapper>
        <Modal
            isVisible={createArrestingAgencyModal}
            onClose={this.handleClose}
            textTitle="Add Arresting Agency">
          <ModalBody>
            <Wrapper>
              <div>
                <h5>Agency</h5>
                <Input
                    name="agency"
                    onChange={this.updateInput}
                    value={agency} />
              </div>
              <div>
                <h5>Abvreviation</h5>
                <Input
                    name="abbreviation"
                    onChange={this.updateInput}
                    value={abbreviation} />
              </div>
              <div>
                <h5>Jurisdictions</h5>
                <CheckboxSelect
                    name="jurisdictions"
                    options={countyOptions}
                    onChange={this.updateInput} />
              </div>
              <Button
                  disabled={!this.readyToSubmit() || addArrestingAgencyIsPending}
                  color="secondary"
                  onClick={this.addAgency}>
                Submit
              </Button>
            </Wrapper>
          </ModalBody>
        </Modal>
      </CardSegmentStyled>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const charges = state.get(STATE.CHARGES);
  const counties = state.get(STATE.COUNTIES);

  const preferredCountyEKID = app.getIn([APP_DATA.SELECTED_ORG_SETTINGS, PREFERRED_COUNTY], '');
  const countiesById = counties.get(COUNTIES_DATA.COUNTIES_BY_ID, Map());
  const preferredCounty = countiesById.get(preferredCountyEKID, Map());
  const countyOptions = countiesById.valueSeq().map((county) => {
    const {
      [ENTITY_KEY_ID]: countyEKID,
      [GENERAL_ID]: countyId,
      [NAME]: label
    } = getEntityProperties(county, [ENTITY_KEY_ID, GENERAL_ID, NAME]);
    return { label, value: { countyEKID, countyId, key: countyEKID }, key: countyEKID };
  }).toJS();
  const formattedArrestingAgencies = charges.get(CHARGE_DATA.ARRESTING_AGENCIES, Map()).valueSeq().map((agency) => {
    const {
      [ENTITY_KEY_ID]: agencyEKID,
      [ID]: abbreviation,
      [NAME]: name
    } = getEntityProperties(agency, [ENTITY_KEY_ID, ID, NAME]);
    return {
      id: agencyEKID,
      agencyEKID,
      abbreviation,
      name
    };
  });

  return {
    app,
    /* Charges */
    loadArrestingAgencyRS: getReqState(charges, LOAD_ARRESTING_AGENCIES),
    addArrestingAgencyRS: getReqState(charges, ADD_ARRESTING_AGENCY),
    formattedArrestingAgencies,
    /* Counties */
    countyOptions,
    preferredCounty
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Charge Actions
    addArrestingAgency,
    // Data Actions
    deleteEntity
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(ArrestingAgencies);
