/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBellSlash } from '@fortawesome/pro-solid-svg-icons';

import defaultProfile from '../../assets/svg/profile-placeholder-rectangle-big.svg';
import { OL } from '../../utils/consts/Colors';
import { Data, Field, Header } from '../../utils/Layout';
import { getEntityProperties } from '../../utils/DataUtils';
import { formatDate } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const {
  DOB,
  FIRST_NAME,
  IS_ACTIVE,
  MIDDLE_NAME,
  MUGSHOT,
  LAST_NAME,
  PICTURE
} = PROPERTY_TYPES;

const ListItem = styled.div`
  border-bottom: 1px solid ${OL.GREY11};
  display: grid;
  grid-template-columns: 20% 80%;
  width: 100%;
`;

const ListItemInfo = styled.div`
  display: grid;
  grid-template-columns: auto;
  padding: 20px 30px;
  width: 100%;
`;

const Picture = styled.img`
  width: 100%;
`;

const SubscriptionInfo = styled.div`
  display: flex;
  grid-column-start: 1;
  grid-column-end: 3;
  justify-content: space-between;
  width: 100%;
`;

const SubscriptionText = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 12px;
  padding: 7px 10px 0 0;

  svg {
    margin: 3px;
  }
`;

type Props = {
  person :Map;
  subscription :Map;
  subscriptionButton :() => void;
};

const PersonCard = ({
  person,
  subscription,
  subscriptionButton
} :Props) => {
  if (!person.size) return null;
  const {
    [DOB]: dob,
    [FIRST_NAME]: firstName,
    [MIDDLE_NAME]: middleName,
    [LAST_NAME]: lastName,
    [MUGSHOT]: personMugshot,
    [PICTURE]: personPhoto
  } = getEntityProperties(person, [DOB, FIRST_NAME, MIDDLE_NAME, LAST_NAME, MUGSHOT, PICTURE]);
  const mugshot :string = personMugshot || personPhoto || defaultProfile;
  const formattedDOB :string = formatDate(dob);
  const { [IS_ACTIVE]: subscriptionIsActive } = getEntityProperties(subscription, [IS_ACTIVE]);
  const subscriptionText = subscriptionIsActive
    ? (
      <SubscriptionText>
        <FontAwesomeIcon icon={faBell} />
        Subscribed to court notifications
      </SubscriptionText>
    )
    : (
      <SubscriptionText>
        <FontAwesomeIcon icon={faBellSlash} />
        Not subscribed to court notifications
      </SubscriptionText>
    );

  return (
    <ListItem>
      <Picture src={mugshot} alt="" />
      <ListItemInfo>
        <Field>
          <Header>LAST NAME</Header>
          <Data>{lastName}</Data>
        </Field>
        <Field>
          <Header>FIRST NAME</Header>
          <Data>{firstName}</Data>
        </Field>
        <Field>
          <Header>MIDDLE NAME</Header>
          <Data>{middleName}</Data>
        </Field>
        <Field>
          <Header>DATE OF BIRTH</Header>
          <Data>{formattedDOB}</Data>
        </Field>
        <SubscriptionInfo>
          { subscriptionText }
          { subscriptionButton() }
        </SubscriptionInfo>
      </ListItemInfo>
    </ListItem>
  );
};

export default PersonCard;
