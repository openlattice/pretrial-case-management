/*
 * @flow
 */

import * as React from 'react';
import styled from 'styled-components';

const SectionWrapper = styled.div`
  padding: 40px 0;
  border-bottom: 1px solid lightgray;
`;

export const Header = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  color: #37454A;
  font-weight: bold;
`;

type Props = {
  header :string,
  children :React.ChildrenArray<*>
};

const SectionView = ({ header, children } :Props) => (
  <SectionWrapper>
    <Header>{header}</Header>
    <div>{children}</div>
  </SectionWrapper>
);

export default SectionView;
