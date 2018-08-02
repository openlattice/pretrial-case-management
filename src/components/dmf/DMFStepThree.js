/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import DMFTable from './DMFTable';

const StepHeader = styled.div`
  width: 100%;
  font-family: 'Open Sans', sans-serif;
  padding: 30px 30px;
  font-size: 16px;
  font-weight: 600;
  color: #555e6f;
`;

const StepWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 30px 30px 30px;
`;

const StepThree = ({
  shouldRender,
  dmf,
  nca,
  fta,
  context
} :Props) => {
  if (!shouldRender) return null;
  return (
    <div>
      <hr />
      <StepHeader>Step Three</StepHeader>
      <StepWrapper>
        <DMFTable dmf={dmf} nca={nca} fta={fta} context={context} />
      </StepWrapper>
    </div>
  );
};

export default StepThree;
