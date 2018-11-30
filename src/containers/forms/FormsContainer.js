/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import qs from 'query-string';
import { connect } from 'react-redux';

import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import CreateFormListItem from '../../components/dashboard/CreateFormListItem';
import psaIcon from '../../assets/svg/public-safety-icon.svg';
import { APP, STATE } from '../../utils/consts/FrontEndStateConsts';
import { CONTEXT, ORG_TITLES } from '../../utils/consts/Consts';
import { OL } from '../../utils/consts/Colors';
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
  background: ${OL.GREY12};
  flex-direction: column;
  align-items: center;
`;

class FormsContainer extends React.Component<Props, *> {

  getPSAPath = context => `${Routes.PSA_FORM}?${qs.stringify({ context })}`;

  render() {
    const { selectedOrganizationTitle } = this.props;
    // TODO: This is yucky. We will want to rework once we phase out different contexts for different orgs.
    let jurisdiction;
    switch (selectedOrganizationTitle) {
      case ORG_TITLES.PENNINGTON_SD:
        jurisdiction = COURT_PENN;
        break;
      case ORG_TITLES.MINNEHAHA_SD:
        jurisdiction = COURT_MINN;
        break;
      default:
        break;
    }
    return (
      <StyledFormWrapper>
        <DashboardMainSection header={`Assessments for ${selectedOrganizationTitle}`}>
          {
            jurisdiction
              ? (
                <FormsWrapper>
                  <CreateFormListItem
                      name="Public Safety Assessment (Booking)"
                      path={this.getPSAPath(BOOKING)}
                      icon={psaIcon} />
                  <CreateFormListItem
                      name="Public Safety Assessment (Court)"
                      path={this.getPSAPath(jurisdiction)}
                      icon={psaIcon} />
                </FormsWrapper>
              )
              : null
          }
        </DashboardMainSection>
      </StyledFormWrapper>
    );
  }
}

function mapStateToProps(state) {
  const app = state.get(STATE.APP);

  return {
    // App
    [APP.SELECTED_ORG_ID]: app.get(APP.SELECTED_ORG_ID),
    [APP.SELECTED_ORG_TITLE]: app.get(APP.SELECTED_ORG_TITLE),
  };
}

export default connect(mapStateToProps, null)(FormsContainer);
