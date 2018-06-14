import React from 'react';
import styled from 'styled-components';

import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import CreateFormListItem from '../../components/dashboard/CreateFormListItem';
import * as Routes from '../../core/router/Routes';

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
      <DashboardMainSection header="Assessments">
        <FormsWrapper>
          <CreateFormListItem name="Public Safety Assessment" path={Routes.PSA_FORM} />
        </FormsWrapper>
      </DashboardMainSection>
    );
  }
}

export default FormsContainer;
