/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { AuthUtils } from 'lattice-auth';

import { OL } from '../../utils/consts/Colors';

const StyledWrapper = styled.div`
  min-height: 100px;
  overflow: auto;
  text-align: center;
  width: 140px;
`;

const StyledName = styled.div`
  color: ${OL.GREY27};
  font-size: 16px;
  word-wrap: break-word; /* not ideal */
`;

const UserInfoBlock = () => {

  let name = '';
  const userInfo = AuthUtils.getUserInfo();
  if (userInfo.email && userInfo.email.length > 0) {
    name = userInfo.email;
  }

  return (
    <StyledWrapper>
      <StyledName>{ name }</StyledName>
    </StyledWrapper>
  );
};

export default UserInfoBlock;
