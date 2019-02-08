/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Constants } from 'lattice';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/pro-light-svg-icons';

import ManageSubscriptionModal from '../../containers/subscription/ManageSubscriptionModal';
import StyledButton from '../buttons/StyledButton';
import { OL } from '../../utils/consts/Colors';
import { formatPeopleInfo } from '../../utils/PeopleUtils';

const { OPENLATTICE_ID_FQN } = Constants;

const Row = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 62.5% 37.5%;
  border-bottom: 1px solid ${OL.GREY11};

  &:last-child {
    border-bottom: none;
  }
`;

const BodyElement = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  color: ${OL.GREY15};
  text-align: left;
  padding: 5px;
`;

const ManageSubscriptionButton = styled(StyledButton)`
  width: 100%;
  padding: 5px 0;
  font-size: 12px;
`;

class PersonSubscriptionRow extends React.Component<Props, State> {
  constructor(props :Props) {
    super(props);
    this.state = {
      manageSubscriptionModalOpen: false
    };
  }
  openManageSubscriptionModal = () => {
    const { person, loadNeighbors } = this.props;
    const personId = person.getIn([OPENLATTICE_ID_FQN, 0], '');
    loadNeighbors({ personId });
    this.setState({ manageSubscriptionModalOpen: true });
  };

  onClose = () => {
    const { onClose } = this.props;
    this.setState({ manageSubscriptionModalOpen: false });
    onClose();
  };

  renderManageSubscriptionModal = () => {
    const { manageSubscriptionModalOpen } = this.state;
    const { person } = this.props;
    return (
      <ManageSubscriptionModal
          person={person}
          open={manageSubscriptionModalOpen}
          onClose={this.onClose} />
    );
  }

  renderManageSubscriptionButton = () => (
    <ManageSubscriptionButton onClick={this.openManageSubscriptionModal}>
      <FontAwesomeIcon icon={faCog} height="12px" />
      {' Settings'}
    </ManageSubscriptionButton>
  )

  render() {
    const { person } = this.props;
    const { lastFirstMid } = formatPeopleInfo(person);
    return (
      <Row>
        <BodyElement>
          {lastFirstMid}
          { this.renderManageSubscriptionModal() }
        </BodyElement>
        <BodyElement>
          {this.renderManageSubscriptionButton()}
        </BodyElement>
      </Row>
    );
  }
}

export default PersonSubscriptionRow;
