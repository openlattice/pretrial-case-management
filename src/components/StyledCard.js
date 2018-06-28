/*
 * @flow
 */

import styled from 'styled-components';

const StyledCard = styled.div`
  width: 270px;
  height: 70px;
  border-radius: 7px;
  background-color: #ffffff;
  border: solid 1px #e1e1eb;
  margin: 0 30px 20px 0;
  display: flex;
  flex-direction: row;

  &:hover {
    cursor: pointer;
    background: #f8f8fc;
  }
`;

export default StyledCard;
