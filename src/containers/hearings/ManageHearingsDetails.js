import React from 'react';
import styled from 'styled-components';
import type { Dispatch } from 'redux';
import type { RequestSequence } from 'redux-reqseq';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button } from 'lattice-ui-kit';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/pro-light-svg-icons';

import ManageSubscriptionModal from '../subscription/ManageSubscriptionModal';
import ReleaseConditionsContainer from '../releaseconditions/ReleaseConditionsContainer';
import PersonCard from '../../components/managehearings/PersonCard';
import { OL } from '../../utils/consts/Colors';
import { APP_TYPES } from '../../utils/consts/DataModelConsts';
import { getEntityKeyId } from '../../utils/DataUtils';
import { hearingIsCancelled } from '../../utils/HearingUtils';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { HEARINGS_DATA } from '../../utils/consts/redux/HearingsConsts';
import { PEOPLE_DATA } from '../../utils/consts/redux/PeopleConsts';

import { loadSubcriptionModal } from '../subscription/SubscriptionActions';

const { PEOPLE, SUBSCRIPTION } = APP_TYPES;

const DetailsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
`;

const DetailsInnerWrapper = styled.div`
  flex-basis: content;
`;

const SelectAPerson = styled.div`
  height: 100%;
  font-size: 30px;
  color: ${OL.GREY02};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 100px;

  svg {
    font-size: 60px;
    margin: 5px;
  }
`;

const ModalContainer = styled.div`
  width: 0;
  height: 0;
  text-align: center;
`;

type Props = {
  actions :{
    loadSubcriptionModal :RequestSequence;
  };
  hearingsById :Map;
  hearingsByTime :Map;
  hearingEKID :string;
  hearingNeighborsById :Map;
  peopleNeighborsById :Map;
  selectHearing :() => void;
};

class ManageHearingsDetails extends React.Component<Props, *> {
  constructor(props :Props) {
    super(props);
    this.state = {
      subscriptionModalOpen: false
    };
  }

  componentDidUpdate() {
    const { hearingsById, hearingEKID, selectHearing } = this.props;
    const hearing = hearingsById.get(hearingEKID, Map());
    if (hearingIsCancelled(hearing)) {
      selectHearing('');
    }
  }

  componentWillUnmount() {
    const { selectHearing } = this.props;
    selectHearing('');
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
    const subscriptionText = 'Manage Subscription';
    return (
      <Button
          onClick={this.openSubscriptionModal}>
        {subscriptionText}
      </Button>
    );
  }

  renderSubscriptionModal = () => {
    const { hearingEKID, hearingNeighborsById } = this.props;
    const hearingPerson = hearingNeighborsById.getIn([hearingEKID, PEOPLE], Map());
    const { subscriptionModalOpen } = this.state;
    return (
      <ManageSubscriptionModal
          person={hearingPerson}
          isOpen={subscriptionModalOpen}
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
    const { hearingEKID, hearingsByTime } = this.props;
    return (
      <>
        <DetailsContainer>
          {
            hearingEKID
              ? (
                <DetailsInnerWrapper>
                  { this.renderPersonDetails() }
                  { this.renderHearingAndReleaseConditions() }
                </DetailsInnerWrapper>
              )
              : (
                <DetailsInnerWrapper>
                  <SelectAPerson>
                    <FontAwesomeIcon icon={faUsers} />
                    {
                      hearingsByTime.size
                        ? 'Select a Hearing' : 'There are no hearings scheduled on the selected date.'
                    }
                  </SelectAPerson>
                </DetailsInnerWrapper>
              )
          }
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
    [HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID]: hearings.get(HEARINGS_DATA.HEARING_NEIGHBORS_BY_ID),
    [HEARINGS_DATA.HEARINGS_BY_ID]: hearings.get(HEARINGS_DATA.HEARINGS_BY_ID),

    // People
    [PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID]: people.get(PEOPLE_DATA.PEOPLE_NEIGHBORS_BY_ID, Map()),
  };
}

const mapDispatchToProps = (dispatch :Dispatch<any>) => ({
  actions: bindActionCreators({
    // Subscriptions Actions
    loadSubcriptionModal
  }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageHearingsDetails);
