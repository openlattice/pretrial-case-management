/*
 * @flow
 */

import * as React from 'react';
import styled from 'styled-components';

const StyledSectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.div`
  font-size: 24px;
  margin-bottom: 18px;
`;

type Props = {
  children :React.Node,
  header :string
};

const DashboardMainSection = (props :Props) => {
  const { children, header } = props;
  return (
    <StyledSectionWrapper>
      { header ? <StyledHeader>{header}</StyledHeader> : null }
      {children}
    </StyledSectionWrapper>
  );
};

export default DashboardMainSection;
