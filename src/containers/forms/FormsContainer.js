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
import { getJurisdiction } from '../../utils/AppUtils';
import { CONTEXT } from '../../utils/consts/Consts';
import { CONTEXTS, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { OL } from '../../utils/consts/Colors';
import { StyledFormWrapper } from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import * as Routes from '../../core/router/Routes';

const { BOOKING } = CONTEXT;

const FormsWrapper = styled.div`
  display: flex;
  height: 100%;
  flex: 1 1 auto;
  background: ${OL.GREY12};
  flex-direction: column;
  align-items: center;
`;

class FormsContainer extends React.Component<Props, *> {

  getPSAPath = (context) => `${Routes.PSA_FORM}?${qs.stringify({ context })}`;

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
    const jurisdiction = getJurisdiction(selectedOrganizationId);
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
    [APP_DATA.SELECTED_ORG_ID]: app.get(APP_DATA.SELECTED_ORG_ID),
    [APP_DATA.SELECTED_ORG_SETTINGS]: app.get(APP_DATA.SELECTED_ORG_SETTINGS),
    [APP_DATA.SELECTED_ORG_TITLE]: app.get(APP_DATA.SELECTED_ORG_TITLE),
  };
}

export default connect(mapStateToProps, null)(FormsContainer);
