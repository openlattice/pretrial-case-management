import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
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


const getSections = (pages, formPath) => {
  return pages.map((Page, index) => {
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
};

const ReviewForm = ({ pages, formPath }) => {
  return (
    <div>
      <div>
        <SectionHeader>Review</SectionHeader>
        {getSections(pages, formPath)}
      </div>
    </div>
  );
};

ReviewForm.propTypes = {
  pages: PropTypes.array.isRequired,
  formPath: PropTypes.string.isRequired
};

export default ReviewForm;
