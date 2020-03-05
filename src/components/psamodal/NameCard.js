/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import { formatValue, formatDateList } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';
import {
  Content,
  ContentBlock,
  ContentLabel
} from '../../utils/Layout';

const PersonCardWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 25% 25% 25% 30%;
`;

type Props = {
  person :Map;
};

export default ({ person } :Props) => {
  const firstName = formatValue(person.get(PROPERTY_TYPES.FIRST_NAME, ''));
  const middleName = formatValue(person.get(PROPERTY_TYPES.MIDDLE_NAME, ''));
  const lastName = formatValue(person.get(PROPERTY_TYPES.LAST_NAME, ''));
  const dob = formatDateList(person.get(PROPERTY_TYPES.DOB, ''));
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

  const content = generalContent.map((item) => (
    <ContentBlock key={item.label}>
      <ContentLabel>{ item.label }</ContentLabel>
      <Content>{ item.content }</Content>
    </ContentBlock>
  ));

  return (
    <PersonCardWrapper>
      {content}
    </PersonCardWrapper>
  );
};
