import React from 'react';
import styled from 'styled-components';

import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import CreateFormListItem from '../../components/dashboard/CreateFormListItem';
import psaIcon from '../../assets/svg/public-safety-icon.svg';
import * as Routes from '../../core/router/Routes';
import { StyledFormWrapper } from '../../utils/Layout';

const FormsWrapper = styled.div`
  display: flex;
  height: 100%;
  flex: 1 1 auto;
  background: #f7f8f9;
  flex-direction: column;
  align-items: center;
`;

class FormsContainer extends React.Component {
  render() {
    return (
      <StyledFormWrapper>
        <DashboardMainSection header="Assessments">
          <FormsWrapper>
            <CreateFormListItem name="Public Safety Assessment" path={Routes.PSA_FORM} icon={psaIcon} />
          </FormsWrapper>
        </DashboardMainSection>
      </StyledFormWrapper>
    );
  }
}

export default FormsContainer;
