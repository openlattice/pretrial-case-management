/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import FormListItemIcon from './FormListItemIcon';
import { OL } from '../../utils/consts/Colors';

const ItemWrapper = styled(Link)`
  align-items: center;
  background: ${OL.WHITE};
  color: inherit;
  display: flex;
  height: 55px;
  padding: 8px;
  margin: 10px 0;
  width: 100%;
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;

  &:hover {
    background: ${OL.GREY25};
    color: inherit;
    text-decoration: none;
  }
`;

const StyledName = styled.div`
  color: ${OL.GREY26};
  font-size: 18px;
`;

type Props = {
  path :string,
  name :string,
  icon :string
};


const CreateFormListItem = (props :Props) => {
  const { icon, name, path } = props;
  return (
    <ItemWrapper to={path}>
      <FormListItemIcon icon={icon} />
      <StyledName>{name}</StyledName>
    </ItemWrapper>
  );
};

export default CreateFormListItem;
