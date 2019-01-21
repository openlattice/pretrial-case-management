/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimesCircle } from '@fortawesome/pro-light-svg-icons';

import { formatPeopleInfo } from '../../utils/PeopleUtils';
import StyledCheckbox from '../controls/StyledCheckbox';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import {
  FormSection,
  InputRow,
  PaddedRow,
  SubHeader
} from '../person/PersonFormTags';

const Status = styled(InputRow)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  margin: 0;
`;

const StatusText = styled.div`
  font-size: 16px;
  font-weight: 600;
  padding: 5px 10px;
`;

const SubStatusText = styled.div`
  font-size: 14px;
  font-weight: 400;
  padding: 5px 10px;
`;

const StatusIconContainer = styled.div`
  margin: 5px 0;
`;

const StyledFormSection = styled(FormSection)`
  border-bottom: ${props => (props.modal ? 'none' : `border-bottom: 1px solid ${OL.GREY11}`)};
  margin-bottom: 0 !important;
`;

type Props = {
  person :Map<*, *>,
  subscription :Map<*, *>,
  modal :boolean
}

class SubscriptionInfo extends React.Component<Props, *> {

  renderHeader = () => {
    const { modal } = this.props;
    return modal
      ? null
      : (
        <PaddedRow>
          <SubHeader>Court Notifications</SubHeader>
        </PaddedRow>
      );
  }

  renderSubscriptionStatus = () => {
    const { person, subscription } = this.props;
    const { firstName, middleName, lastName } = formatPeopleInfo(person);
    const midName = middleName ? ` ${middleName}` : '';
    const name = `${firstName}${midName} ${lastName}`;
    // isSubscriped will come from the subscription
    const isSubscribed = false;
    const subscriptionIcon = isSubscribed
      ? <StatusIconContainer><FontAwesomeIcon color="green" icon={faCheck} /></StatusIconContainer>
      : <StatusIconContainer><FontAwesomeIcon color="red" icon={faTimesCircle} /></StatusIconContainer>;
    const isSubscribedText = isSubscribed
      ? 'is subscribed to court notifications'
      : 'is not subscribed to court notifications';
    const subscriptionText = isSubscribed
      ? `Unsubscribe ${name}?`
      : `Subscribe ${name}?`;
    return (
      <Status>
        <Status>
          { subscriptionIcon }
          <StatusText>{`${name} ${isSubscribedText}`}</StatusText>
        </Status>
        <Status>
          <SubStatusText>{`${subscriptionText}`}</SubStatusText>
          <StyledCheckbox />
        </Status>
      </Status>
    );
  }

  render() {
    const {
      modal
    } = this.props;
    return (
      <StyledFormSection modal={modal}>
        { this.renderSubscriptionStatus() }
      </StyledFormSection>
    );
  }
}

export default SubscriptionInfo;
