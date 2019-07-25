/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { formatValue, formatDateList } from '../../utils/FormattingUtils';
import { PersonPicture, PersonMugshot } from '../../utils/Layout';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const Content = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-weight: normal;
  color: ${OL.GREY15};
`;

const ContentBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const PersonCardWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 10% 20% 20% 20% 30%;
`;

const Label = styled.div`
  font-family: 'Open Sans',sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${OL.GREY02};
`;

const MugShot = styled(PersonMugshot)`
  width: 36px;
`;


export default ({ person } :Props) => {
  const firstName = formatValue(person.get(PROPERTY_TYPES.FIRST_NAME, ''));
  const middleName = formatValue(person.get(PROPERTY_TYPES.MIDDLE_NAME, ''));
  const lastName = formatValue(person.get(PROPERTY_TYPES.LAST_NAME, ''));
  const dob = formatDateList(person.get(PROPERTY_TYPES.DOB, ''));
  const mugshot :string = person.getIn([PROPERTY_TYPES.MUGSHOT, 0])
    || person.getIn([PROPERTY_TYPES.PICTURE, 0])
    || defaultUserIcon;
  const generalContent = [
    {
      label: 'First Name',
      content: firstName
    },
    {
      label: 'Middle Name',
      content: middleName
    },
    {
      label: 'Last Name',
      content: lastName
    },
    {
      label: 'Date of Birth',
      content: dob
    }
  ];

  const content = generalContent.map(item => (
    <ContentBlock>
      <Label>{ item.label }</Label>
      <Content>{ item.content }</Content>
    </ContentBlock>
  ));

  return (
    <PersonCardWrapper>
      <MugShot>
        <PersonPicture src={mugshot} alt="" />
      </MugShot>
      {content}
    </PersonCardWrapper>
  );
};
