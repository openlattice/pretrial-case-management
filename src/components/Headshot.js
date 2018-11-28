/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import defaultProfile from '../assets/svg/profile-placeholder-avatar.svg';

const StyledImageWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  overflow: hidden;
  display: inline-flex;

  & > img {
    flex-shrink: 0;
    max-width: ${props => (props.size ? `${props.size * 1.4}px` : '140px')};
  }
`;

type Props = {
  photo? :string,
  size? :string
};

const Headshot = ({ photo, size } :Props) => {
  const photoSrc = photo || defaultProfile;

  return (
    <StyledImageWrapper size={size}>
      <img src={photoSrc} alt="" />
    </StyledImageWrapper>
  );
};

Headshot.defaultProps = {
  photo: '',
  size: ''
};

export default Headshot;
