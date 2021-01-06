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
  background: ${OL.GREY39};
  border-radius: 5px;
  color: ${OL.GREY01};
  display: flex;
  flex-direction: column;
  height: 300px;
  justify-content: center;
  margin: 15px auto;
  text-decoration: none;
  width: 100%;

  &:hover {
    color: white;
    text-decoration: none;
  }
`;

const IconWrapper = styled.div`
  align-items: center;
  background: white;
  border-radius: 50%;
  color: ${OL.PURPLE03};
  display: flex;
  justify-content: center;
  margin: 0 auto 15px;
  padding: 20px;
  height: 105px;
  width: 105px;
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
      <IconWrapper>
        <FontAwesomeIcon icon={icon} size="3x" />
      </IconWrapper>
      <StyledName>{name}</StyledName>
    </ItemWrapper>
  );
};

export default CreateFormListItem;
