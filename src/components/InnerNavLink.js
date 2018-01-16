import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';


const CustomNavLink = styled(NavLink).attrs({
  activeStyle: {
    borderBottom: '1px solid black'
  }
})`
  border-bottom: 1px solid lightgrey;
  color: inherit;
  font-size: 16px;
  outline: none;
  padding: 0 10px;

  &:hover {
    color: inherit;
    text-decoration: none;
  }

  &:focus {
    outline: none;
    text-decoration: none;
  }
`;


const InnerNavLink = ({ label, path, linkName }) => {
  return (
    <CustomNavLink
        to={path}
        name={linkName}>
      { label }
    </CustomNavLink>
  );
};

InnerNavLink.defaultProps = {
  linkName: ''
};

InnerNavLink.propTypes = {
  label: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  linkName: PropTypes.string
};

export default InnerNavLink;
