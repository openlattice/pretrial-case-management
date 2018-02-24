/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';


const StyledWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
`;

const StyledSpinner = styled.svg`
  align-self: center;
`;

type Props = {
  size? :?number
};

export default function(props :Props) {

  const size = props.size || 50;

  // https://github.com/SamHerbert/SVG-Loaders
  return (
    <StyledWrapper>
      <StyledSpinner
          stroke="#455a64"
          width={size}
          height={size}
          viewBox="0 0 38 38"
          xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd">
          <g transform="translate(1 1)" strokeWidth="2">
            <circle strokeOpacity=".25" cx="18" cy="18" r="18" />
            <path d="M36 18c0-9.94-8.06-18-18-18">
              <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur=".75s"
                  repeatCount="indefinite" />
            </path>
          </g>
        </g>
      </StyledSpinner>
    </StyledWrapper>
  );
}
