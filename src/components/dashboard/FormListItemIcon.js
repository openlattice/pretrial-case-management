/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import FontAwesome from 'react-fontawesome';

const StyledIconWrapper = styled.div`
  height: 40px;
  margin-right: 8px;
  padding: 5px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type Props = {
  icon? :string
};

const CreateFormListItem = ({ icon } :Props) => (
  <StyledIconWrapper>
    {icon ? <img src={icon} role="presentation" /> : <FontAwesome name="book" size="2x" />}
  </StyledIconWrapper>
);

export default CreateFormListItem;
