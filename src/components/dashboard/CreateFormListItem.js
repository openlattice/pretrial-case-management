/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { OL } from '../../utils/consts/Colors';

const ItemWrapper = styled(Link)`
  align-items: center;
  background: ${OL.WHITE};
  color: ${OL.GREY03};
  display: flex;
  flex-direction: column;
  height: 180px;
  margin: 15px auto;
  width: 100%;
  border: 1px solid ${OL.GREY11};
  border-radius: 5px;

  &:hover {
    color: ${OL.GREY25};
    color: inherit;
    text-decoration: none;
  }

  svg {
    padding: 40px 0 30px;
    height: 65%;
    width: 100%;
  }
`;

const StyledName = styled.div`
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
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
      <FontAwesomeIcon icon={icon} size="3x" />
      <StyledName>{name}</StyledName>
    </ItemWrapper>
  );
};

export default CreateFormListItem;
