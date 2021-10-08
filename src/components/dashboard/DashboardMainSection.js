/*
 * @flow
 */

import * as React from 'react';
import styled from 'styled-components';

import { OL } from '../../utils/consts/Colors';

const StyledSectionWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledHeader = styled.div`
  color: ${OL.GREY01};
  font-weight: bold;
  font-size: 26px;
  line-height: 35px;
  margin-bottom: 30px;
`;

type Props = {
  children :React.Node,
  header ?:string
};

const DashboardMainSection = ({ children, header } :Props) => (
  <StyledSectionWrapper>
    { header && <StyledHeader>{header}</StyledHeader> }
    {children}
  </StyledSectionWrapper>
);

DashboardMainSection.defaultProps = {
  header: ''
};

export default DashboardMainSection;
