/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';

import ContentBlock from '../ContentBlock';
import ContentSection from '../ContentSection';
import CONTENT_CONSTS from '../../utils/consts/ContentConsts';
import defaultUserIcon from '../../assets/svg/profile-placeholder-round.svg';
import { formatValue, formatDateList } from '../../utils/FormattingUtils';
import { OL } from '../../utils/consts/Colors';
import { PROPERTY_TYPES } from '../../utils/consts/DataModelConsts';

const PersonCardWrapper = styled.div`
  width: 100%;
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
      label: 'Last Name',
      content: [lastName]
    },
    {
      label: 'First Name',
      content: [firstName]
    },
    {
      label: 'Middle Name',
      content: [middleName]
    },
    {
      label: 'Date of Birth',
      content: [dob]
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
          photo={mugshot}
          header="Person"
          firstName={firstName}
          middleName={middleName}
          lastName={lastName}>
        {content}
      </ContentSection>
    </PersonCardWrapper>
  );
};
