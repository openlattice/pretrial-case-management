import React from 'react';
import styled from 'styled-components';

import supportIcon from '../../assets/svg/support-icon.svg';

const SupportButton = styled.a`
  width: 139px;
  height: 37px;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #e1e1eb;
  box-shadow: none;
  position: fixed;
  bottom: 30px;
  right: 16px;
  text-decoration: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  &:hover {
    text-decoration: none;
    background-color: #f8f8fc;
  }

  span {
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    color: #8e929b;
    margin-left: 5px;
  }
`;

const ContactSupport = () => {

  return (
    <SupportButton href="https://support.openlattice.com/servicedesk/customer/portal/1">
      <img src={supportIcon} role="presentation" />
      <span>Contact Support</span>
    </SupportButton>
  );
};

export default ContactSupport;
