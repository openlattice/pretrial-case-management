import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import FormListItemIcon from './FormListItemIcon';


const ItemWrapper = styled(Link)`
  align-items: center;
  background: white;
  color: inherit;
  display: flex;
  height: 55px;
  padding: 8px;
  width: 100%;

  &:hover {
    background: #dcdcdc;
    color: inherit;
    text-decoration: none;
  }
`;

const StyledName = styled.div`
  color: #727272;
  font-size: 18px;
`;

const CreateFormListItem = props => (
  <ItemWrapper to={props.path}>
    <FormListItemIcon />
    <StyledName>{props.name}</StyledName>
  </ItemWrapper>
);

CreateFormListItem.propTypes = {
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired
};

export default CreateFormListItem;
