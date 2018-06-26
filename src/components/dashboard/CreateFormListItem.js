/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import FormListItemIcon from './FormListItemIcon';


const ItemWrapper = styled(Link)`
  align-items: center;
  background: white;
  color: inherit;
  display: flex;
  height: 55px;
  padding: 8px;
  width: 100%;

  &:hover {
    background: #dcdcdc;
    color: inherit;
    text-decoration: none;
  }
`;

const StyledName = styled.div`
  color: #727272;
  font-size: 18px;
`;

type Props = {
  path :string,
  name :string,
  icon? :string
};

const CreateFormListItem = (props :Props) => (
  <ItemWrapper to={props.path}>
    <FormListItemIcon icon={props.icon} />
    <StyledName>{props.name}</StyledName>
  </ItemWrapper>
);

export default CreateFormListItem;
