/*
 * @flow
 */

import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { OL } from '../../utils/consts/Colors';

const ViewMoreLink = styled(Link)`
  background-color: transparent;
  border: none;
  color: ${OL.PURPLE02};
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  outline: none;
  padding: ${(props) => (props.noPadding ? '10px 0 ' : '10px 20px')};
  text-align: right;

  &:hover {
    text-decoration: underline;
  }
`;

export default ViewMoreLink;
