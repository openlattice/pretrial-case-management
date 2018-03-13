/*
 * @flow
 */

import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { SectionHeader } from '../../utils/Layout';

const StyledSectionHeaderWrapper = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const EditLink = styled(Link)`
  font-size: 16px;
  position: absolute;
  right: 0;
  top: 10px;
`;

const StyledSection = styled.div`
  margin-bottom: 60px;
`;


const getSections = (pages, formPath) => pages.map((Page, index) => {
  const sectionKey = `section-${index}`;
  return (
    <StyledSection key={sectionKey}>
      <StyledSectionHeaderWrapper>
        <EditLink to={`${formPath}/${index + 2}`}>edit</EditLink>
      </StyledSectionHeaderWrapper>
      <Page />
    </StyledSection>
  );
});

type Props = {
  pages :React.ComponentType<*>[],
  formPath :string
};

const ReviewForm = ({ pages, formPath } :Props) => (
  <div>
    <div>
      <SectionHeader>Review</SectionHeader>
      {getSections(pages, formPath)}
    </div>
  </div>
);

export default ReviewForm;
