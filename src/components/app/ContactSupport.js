import React from 'react';
import styled from 'styled-components';

import supportIcon from '../../assets/svg/support-icon.svg';
import { OL } from '../../utils/consts/Colors';

const SupportButton = styled.a`
  width: 139px;
  height: 37px;
  border-radius: 5px;
  background-color: white;
  border: solid 1px ${OL.GREY11};
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
    background-color: ${OL.GREY14};
  }

  span {
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    color: ${OL.GREY02};
    margin-left: 5px;
  }
`;

const ContactSupport = () => (
  <SupportButton href="https://openlattice.atlassian.net/servicedesk/customer/portals">
    <img src={supportIcon} alt="" />
    <span>Contact Support</span>
  </SupportButton>
);

export default ContactSupport;
