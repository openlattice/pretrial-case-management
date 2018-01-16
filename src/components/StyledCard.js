/*
 * @flow
 */

import styled from 'styled-components';

const StyledCard = styled.div`
  align-items: center;
  background-color: #fefefe;
  border: 1px solid #c5d5e5;
  border-radius: 4px;
  box-shadow: 0 2px 8px -2px rgba(17, 51, 85, 0.15);
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: normal;
  height: 250px;
  margin: 0 10px;
  padding: 20px;
  text-align: center;
  width: 180px;
  h1 {
    font-size: 22px;
    font-weight: 600;
    margin: 0 0 10px 0;
    padding: 0;
  }
  h2 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 10px 0;
    padding: 0;
  }
  h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px 0;
    padding: 0;
  }
  p {
    margin: 0;
    padding: 0;
  }
  section {
    display: flex;
    flex-direction: column;
    margin-left: 10px;
    margin-top: 10px;
  }
  &:hover {
    cursor: pointer;
    background: #dcdcdc;
  }
`;

export default StyledCard;
