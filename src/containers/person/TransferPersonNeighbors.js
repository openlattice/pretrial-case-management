/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence, RequestState } from 'redux-reqseq';
import { Map } from 'immutable';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  IconButton,
  Input,
  CardSegment,
  Modal
} from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt } from '@fortawesome/pro-light-svg-icons';

import { getEntitySetIdFromApp } from '../../utils/AppUtils';
import { getEntityProperties, isUUID } from '../../utils/DataUtils';
import { APP_TYPES, PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { SETTINGS_DATA } from '../../utils/consts/redux/SettingsConsts';
import { PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { getReqState, requestIsPending, requestIsSuccess } from '../../utils/consts/redux/ReduxUtils';

import { transferNeighbors, TRANSFER_NEIGHBORS } from './PersonActions';
import { deleteEntity, DELETE_ENTITY } from '../../utils/data/DataActions';

const { PEOPLE } = APP_TYPES;
const {
  DOB,
  ENTITY_KEY_ID,
  FIRST_NAME,
  LAST_NAME
} = PROPERTY_TYPES;

const transferIcon = <FontAwesomeIcon icon={faExchangeAlt} />;

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 500px;

  svg {
    margin: 10px;
  }
`;

type Props = {
  actions :{
    deleteEntity :RequestSequence;
    transferNeighbors :RequestSequence;
  };
  peopleById :Map;
  deleteEntityRS :RequestState;
  transferNeighborsRS :RequestState;
};

type State = {
  deletePersonModalOpen :boolean;
  person1EKID :string;
  person2EKID :string;
}

const INITIAL_STATE = {
  deletePersonModalOpen: false,
  person1EKID: '',
  person2EKID: ''
};

class TransferPersonDetails extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidUpdate(prevProps :Props) {
    const { deleteEntityRS, transferNeighborsRS } = this.props;
    const { deleteEntityRS: prevDeleteEntityRS, transferNeighborsRS: prevTransferNeighborsRS } = prevProps;

    const deleteWasPending = requestIsPending(prevDeleteEntityRS);
    const deleteSucessful = requestIsSuccess(deleteEntityRS);
    if (deleteWasPending && deleteSucessful) {
      this.setState({ deletePersonModalOpen: false });
    }

    const transferWasPending = requestIsPending(prevTransferNeighborsRS);
    const transferSucessful = requestIsSuccess(transferNeighborsRS);
    if (transferWasPending && transferSucessful) {
      this.setState({ deletePersonModalOpen: true });
    }
  }

  deletePerson1 = () => {
    const { person1EKID } = this.state;
    const { actions, app } = this.props;
    const peopleESID = getEntitySetIdFromApp(app, PEOPLE);
    actions.deleteEntity({ entitySetId: peopleESID, entityKeyIds: [person1EKID] });
  }

  updateInput = (e :SyntheticInputEvent<HTMLInputElement>) => {
    const { target } = e;
    const { name, value } = target;
    this.setState({ [name]: value });
  }

  transferNeighbors = () => {
    const { person1EKID, person2EKID } = this.state;
    const { actions } = this.props;
    actions.transferNeighbors({ person1EKID, person2EKID });
  }

  handleClose = () => this.setState(INITIAL_STATE);

  readytoTransfer = () => {
    const { person1EKID, person2EKID } = this.state;
    return !person1EKID || !person2EKID || !isUUID(person1EKID) || !isUUID(person2EKID);
  }

  render() {
    const { peopleById, transferNeighborsRS } = this.props;
    const { deletePersonModalOpen, person1EKID, person2EKID } = this.state;
    const transferPending = requestIsPending(transferNeighborsRS);
    const person1 = peopleById.get(person1EKID, Map());
    const {
      [DOB]: dob1,
      [FIRST_NAME]: firstName1,
      [LAST_NAME]: lastName1
    } = getEntityProperties(person1, [DOB, ENTITY_KEY_ID, FIRST_NAME, LAST_NAME]);
    const person2 = peopleById.get(person2EKID, Map());
    const {
      [DOB]: dob2,
      [FIRST_NAME]: firstName2,
      [LAST_NAME]: lastName2
    } = getEntityProperties(person2, [DOB, ENTITY_KEY_ID, FIRST_NAME, LAST_NAME]);
    return (
      <CardSegment vertical>
        <h1>Transfer Person Neighbors</h1>
        <Wrapper>
          <h5>Person 1 EKID</h5>
          <div />
          <h5>Person 2 EKID</h5>
          <Input
              invalid={person1EKID.length && !isUUID(person1EKID)}
              name="person1EKID"
              onChange={this.updateInput}
              value={person1EKID} />
          <IconButton
              disabled={this.readytoTransfer() || transferPending}
              icon={transferIcon}
              mode="secondary"
              onClick={this.transferNeighbors} />
          <Input
              invalid={person2EKID.length && !isUUID(person2EKID)}
              name="person2EKID"
              onChange={this.updateInput}
              value={person2EKID} />
        </Wrapper>
        <Modal
            isVisible={deletePersonModalOpen}
            onClickPrimary={this.deletePerson1}
            onClickSecondary={this.handleClose}
            onClose={this.handleClose}
            shouldStretchButtons
            textPrimary="Yes"
            textSecondary="No"
            textTitle="Would you like to delete person 1?">
          <ModalBody>
            <div>{`${person1EKID}: ${firstName1} ${lastName1} (${dob1})`}</div>
            { transferIcon }
            <div>{`${person2EKID}: ${firstName2} ${lastName2} (${dob2})`}</div>
          </ModalBody>
        </Modal>
      </CardSegment>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);
  const data = state.get(STATE.DATA);
  const people = state.get(STATE.PEOPLE);
  const person = state.get(STATE.PERSON);
  const settings = state.get(STATE.SETTINGS);
  return {
    app,
    /* Data */
    deleteEntityRS: getReqState(data, DELETE_ENTITY),
    /* People */
    peopleById: people.get(PEOPLE_DATA.PEOPLE_BY_ID, Map()),
    /* Person */
    transferNeighborsRS: getReqState(person, TRANSFER_NEIGHBORS),
    /* Settings */
    settings: settings.get(SETTINGS_DATA.APP_SETTINGS)
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Data Actions
    deleteEntity,
    // People Actions
    transferNeighbors
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(TransferPersonDetails);
