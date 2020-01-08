import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { OL } from '../../utils/consts/Colors';

const InfoLink = styled(Link)`
  width: 180px;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${OL.PURPLE02};
  margin-left: 20px;
  color: ${OL.WHITE};
  font-family: 'Open Sans', sans-serif;

  &:hover {
    background-color: ${OL.PURPLE03};
    cursor: pointer;
  }

  &:active {
    background-color: ${OL.PURPLE01};
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: ${OL.GREY08};
    color: ${OL.GREY03};
    border: none;

    &:hover {
      cursor: default;
    }
  }
`;

export default InfoLink;
