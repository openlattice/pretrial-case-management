/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

const StyledImageWrapper = styled.div`
  align-items: center;
  border-radius: 50%;
  display: flex;
  height: ${props => (props.size ? `${props.size}px` : '100px')};
  justify-content: center;
  margin-bottom: 20px;
  overflow: hidden;
  width: ${props => (props.size ? `${props.size}px` : '100px')};

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
  const photoSrc = photo ? `data:image/jpeg;base64,${photo}` : '';

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
