import styled from 'styled-components';

const BasicButton = styled.button`
  width: 108px;
  height: 29px;
  border: none;
  border-radius: 3px;
  background-color: #f0f0f7;
  color: #8e929b;
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;

  &:hover {
    background-color: #dcdce7;
  }

  &:active {
    background-color: #b6bbc7;
    color: #ffffff;
  }
`;

export default BasicButton;
