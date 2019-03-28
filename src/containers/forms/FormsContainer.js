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
import { CONTEXT } from '../../utils/consts/Consts';
import { CONTEXTS, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { ORG_IDS } from '../../utils/consts/DataModelConsts';
import { OL } from '../../utils/consts/Colors';
import { StyledFormWrapper } from '../../utils/Layout';
import * as Routes from '../../core/router/Routes';

const {
  BOOKING,
  COURT_MINN,
  COURT_PENN,
  COURT_SHELBY,
  DEMO_ORG,
  PCM_DEMO_ORG
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

  renderBookingContext = () => {
    const { selectedOrganizationSettings } = this.props;
    const includeBooking = selectedOrganizationSettings.getIn([SETTINGS.CONTEXTS, CONTEXTS.BOOKING], '');
    if (includeBooking) {
      return (
        <CreateFormListItem
            name="Public Safety Assessment (Booking)"
            path={this.getPSAPath(BOOKING)}
            icon={psaIcon} />
      );
    }
    return null;
  }

  renderCourtContext = (jurisdiction) => {
    const { selectedOrganizationSettings } = this.props;
    const includeCourt = selectedOrganizationSettings.getIn([SETTINGS.CONTEXTS, CONTEXTS.COURT], '');
    if (includeCourt) {
      return (
        <CreateFormListItem
            name="Public Safety Assessment (Court)"
            path={this.getPSAPath(jurisdiction)}
            icon={psaIcon} />
      );
    }
    return null;
  }

  render() {
    const { selectedOrganizationTitle, selectedOrganizationId } = this.props;
    // TODO: This is yucky. We will want to rework once we phase out different contexts for different orgs.
    let jurisdiction;
    switch (selectedOrganizationId) {
      case ORG_IDS.DEMO_ORG:
        jurisdiction = DEMO_ORG;
        break;
      case ORG_IDS.PCM_DEMO_ORG:
        jurisdiction = DEMO_ORG;
        break;
      case ORG_IDS.PENNINGTON_SD:
        jurisdiction = COURT_PENN;
        break;
      case ORG_IDS.MINNEHAHA_SD:
        jurisdiction = COURT_MINN;
        break;
      case ORG_IDS.SHELBY_TN:
        jurisdiction = COURT_SHELBY;
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
                  { this.renderBookingContext() }
                  { this.renderCourtContext(jurisdiction) }
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
    [APP.SELECTED_ORG_SETTINGS]: app.get(APP.SELECTED_ORG_SETTINGS),
    [APP.SELECTED_ORG_TITLE]: app.get(APP.SELECTED_ORG_TITLE),
  };
}

export default connect(mapStateToProps, null)(FormsContainer);
