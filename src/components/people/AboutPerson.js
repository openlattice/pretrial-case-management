/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

import { PERSON_FQNS } from '../../utils/consts/Consts';
import Headshot from '../Headshot';
import ContentSection from '../ContentSection';

const Wrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  height: 100%;
`;

const StyledColumnLeft = styled.div`
  display: flex;
  flex: 0 0 224px;
  flex-direction: column;
  margin-right: 30px;
  overflow: auto;
`;

const StyledColumnRight = styled.div`
  display: flex;
  flex: 1 1 564px;
  flex-direction: column;
  overflow: auto;
`;

type Props = {
  selectedPersonData :Immutable.Map<*, *>
};

const AboutPerson = ({ selectedPersonData } :Props) => {

  // TODO: Replace hardcoded contactInfoContent w/ real data
  const contactInfoContent = [
    {
      label: 'Email',
      content: ['katherine@openlattice.com']
    },
    {
      label: 'Phone',
      content: ['(444) 444-4444']
    },
    {
      label: 'Address',
      content: ['222 Blue Street', 'Redwood City, CA 94059']
    }
  ];

  const aboutContent = [
    {
      label: 'Date of Birth',
      content: [selectedPersonData.get(PERSON_FQNS.DOB)]
    },
    {
      label: 'Gender',
      content: [selectedPersonData.get(PERSON_FQNS.SEX)]
    },
    {
      label: 'SSN',
      content: [selectedPersonData.get(PERSON_FQNS.SSN)]
    }
  ];

  return (
    <Wrapper>
      <StyledColumnLeft>
        <Headshot
            photo={selectedPersonData.get(PERSON_FQNS.PHOTO)}
            size="180" />
        <ContentSection title="Contact Info" content={contactInfoContent} vertical />
      </StyledColumnLeft>
      <StyledColumnRight>
        <ContentSection title="About" content={aboutContent} />
      </StyledColumnRight>
    </Wrapper>
  );
};

export default AboutPerson;
