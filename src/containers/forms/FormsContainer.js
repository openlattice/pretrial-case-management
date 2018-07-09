import React from 'react';
import styled from 'styled-components';
import qs from 'query-string';

import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import CreateFormListItem from '../../components/dashboard/CreateFormListItem';
import psaIcon from '../../assets/svg/public-safety-icon.svg';
import { CONTEXT } from '../../utils/consts/Consts';
import { StyledFormWrapper } from '../../utils/Layout';
import * as Routes from '../../core/router/Routes';

const {
  BOOKING,
  COURT_MINN,
  COURT_PENN
} = CONTEXT;

const FormsWrapper = styled.div`
  display: flex;
  height: 100%;
  flex: 1 1 auto;
  background: #f7f8f9;
  flex-direction: column;
  align-items: center;
`;

const getPSAPath = context => `${Routes.PSA_FORM}?${qs.stringify({ context })}`;

class FormsContainer extends React.Component {
  render() {
    return (
      <StyledFormWrapper>
        <DashboardMainSection header="Assessments">
          <FormsWrapper>
            <CreateFormListItem
                name="Public Safety Assessment (Pennington Booking)"
                path={getPSAPath(BOOKING)}
                icon={psaIcon} />
            <CreateFormListItem
                name="Public Safety Assessment (Pennington Court)"
                path={getPSAPath(COURT_PENN)}
                icon={psaIcon} />
            <CreateFormListItem
                name="Public Safety Assessment (Minnehaha Court)"
                path={getPSAPath(COURT_MINN)}
                icon={psaIcon} />
          </FormsWrapper>
        </DashboardMainSection>
      </StyledFormWrapper>
    );
  }
}

export default FormsContainer;
