/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import defaultUserIcon from '../../assets/svg/profile-placeholder-rectangle-big.svg';
import { formatValue, formatDateList } from '../../utils/FormattingUtils';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const PersonCardWrapper = styled.div`
  width: 100%;
  border-right: solid 1px #eeeeee;
`;

export default ({ person } :Props) => {
  const firstName = formatValue(person.get(PROPERTY_TYPES.FIRST_NAME, ''));
  const middleName = formatValue(person.get(PROPERTY_TYPES.MIDDLE_NAME, ''));
  const lastName = formatValue(person.get(PROPERTY_TYPES.LAST_NAME, ''));
  const dob = formatDateList(person.get(PROPERTY_TYPES.DOB, ''));
  const sex = formatValue(person.get(PROPERTY_TYPES.SEX, ''));
  const race = formatValue(person.get(PROPERTY_TYPES.RACE, ''));
  const generalContent = [
    {
      label: 'Last Name',
      content: [lastName]
    },
    {
      label: 'Middle Name',
      content: [middleName]
    },
    {
      label: 'First Name',
      content: [firstName]
    },
    {
      label: 'Date of Birth',
      content: [dob]
    },
    {
      label: 'Gender',
      content: [sex]
    },
    {
      label: 'Race',
      content: [race]
    }
  ];

  const content = generalContent.map(item => (
    <ContentBlock
        component={CONTENT_CONSTS.SUMMARY}
        contentBlock={item}
        key={item.label} />
  ));

  return (
    <PersonCardWrapper>
      <ContentSection
          component={CONTENT_CONSTS.SUMMARY}
          photo={defaultUserIcon}
          header="Person"
          firstName={firstName}
          middleName={middleName}
          lastName={lastName} >
        {content}
      </ContentSection>
    </PersonCardWrapper>
  );
};
