/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from 'lattice-ui-kit';

import ManageSubscriptionModal from '../subscription/ManageSubscriptionModal';
import ReleaseConditionsContainer from '../releaseconditions/ReleaseConditionsContainer';
import PersonCard from '../../components/managehearings/PersonCard';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityKeyId } from '../../utils/DataUtils';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { HEARINGS_ACTIONS, HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { PEOPLE_ACTIONS, PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';
import { getReqState, requestIsPending } from '../../utils/consts/redux/ReduxUtils';

import { setManageHearingsDate, setCountyFilter } from './HearingsActions';
import { loadSubcriptionModal } from '../subscription/SubscriptionActions';

const { PEOPLE, SUBSCRIPTION } = APP_TYPES;

const DetailsContainer = styled.div`
  width: 100%;
  overflow-y: scroll;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
`;

const ModalContainer = styled.div`
  width: 0;
  height: 0;
`;

const StyledButton = styled(Button)`
  background: none;
  border: solid 1px ${OL.GREY05};
  border-radius: 3px;
  color: ${OL.GREY15};
  font-weight: 600;
  font-size: 11px;
  height: 28px;
  padding: 5px 10px;
`;

type Props = {
  hearingEKID :string,
  hearingNeighborsById :Map,
  peopleNeighborsById :Map,
  actions :{
  }
};

class ManageHearingsDetails extends React.Component<Props, *> {
  constructor(props :Props) {
    super(props);
    this.state = {
      subscriptionModalOpen: false
    };
  }

  componentDidMount() {
  }

  componentDidUpdate() {
  }

  openSubscriptionModal = () => {
    const { actions, hearingEKID, hearingNeighborsById } = this.props;
    const hearingPerson = hearingNeighborsById.getIn([hearingEKID, PEOPLE], Map());
    const personEntityKeyId = getEntityKeyId(hearingPerson);
    actions.loadSubcriptionModal({ personEntityKeyId });
    this.setState({ subscriptionModalOpen: true });
  };
  closeSubscriptionModal = () => this.setState({ subscriptionModalOpen: false });

  renderManageSubscriptionButton = () => {
    const subscriptionText = ' Manage Subscription';
    return (
      <StyledButton
          onClick={this.openSubscriptionModal}>
        {subscriptionText}
      </StyledButton>
    );
  }

  renderSubscriptionModal = () => {
    const { hearingEKID, hearingNeighborsById } = this.props;
    const hearingPerson = hearingNeighborsById.getIn([hearingEKID, PEOPLE], Map());
    const { subscriptionModalOpen } = this.state;
    return (
      <ManageSubscriptionModal
          person={hearingPerson}
          open={subscriptionModalOpen}
          onClose={this.closeSubscriptionModal} />
    );
  }
  renderPersonDetails = () => {
    const { hearingEKID, hearingNeighborsById, peopleNeighborsById } = this.props;
    const hearingPerson = hearingNeighborsById.getIn([hearingEKID, PEOPLE], Map());
    const personEKID = getEntityKeyId(hearingPerson);
    const personSubscription = peopleNeighborsById.getIn([personEKID, SUBSCRIPTION], Map());
    return (
      <PersonCard
          person={hearingPerson}
          subscription={personSubscription}
          subscriptionButton={this.renderManageSubscriptionButton} />
    );
  }

  renderHearingAndReleaseConditions = () => {
    const { hearingEKID } = this.props;
    return hearingEKID
      ? <ReleaseConditionsContainer hearingEntityKeyId={hearingEKID} />
      : null;
  }


  render() {
    return (
      <>
        <DetailsContainer>
          { this.renderPersonDetails() }
          { this.renderHearingAndReleaseConditions() }
          <ModalContainer>{ this.renderSubscriptionModal() }</ModalContainer>
        </DetailsContainer>
      </>
    );
  }
}

function mapStateToProps(state) {
  const hearings = state.get(STATE.HEARINGS);
  const people = state.get(STATE.PEOPLE);
  const hearingDate = hearings.get(HEARINGS_DATA.MANAGE_HEARINGS_DATE).toISODate();
  const hearingsByTime = hearings.getIn([HEARINGS_DATA.HEARINGS_BY_DATE_AND_TIME, hearingDate], Map());
  return {
    // Hearings
    hearingsByTime,
    loadHearingsForDateReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARINGS_FOR_DATE),
    loadHearingNeighborsReqState: getReqState(hearings, HEARINGS_ACTIONS.LOAD_HEARING_NEIGHBORS),
    [HEARINGS_DATA.HEARINGS_BY_COUNTY]: hearings.get(HEARINGS_DATA.HEARINGS_BY_COUNTY),
    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),

    // People
    getPeopleNeighborsRequestState: getReqState(people, PEOPLE_ACTIONS.GET_PEOPLE_NEIGHBORS),
    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, Map()),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Hearings Actions
    setManageHearingsDate,
    setCountyFilter,
    // Subscriptions Actions
    loadSubcriptionModal
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageHearingsDetails);
