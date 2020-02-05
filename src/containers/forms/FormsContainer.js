/*
 * @flow
 */
import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { faAddressCard, faFilePlus, faSearch } from '@fortawesome/pro-light-svg-icons';

import DashboardMainSection from '../../components/dashboard/DashboardMainSection';
import CreateFormListItem from '../../components/dashboard/CreateFormListItem';
import { getJurisdiction } from '../../utils/AppUtils';
import { CONTEXT } from '../../utils/consts/Consts';
import { CONTEXTS, SETTINGS } from '../../utils/consts/AppSettingConsts';
import { StyledFormWrapper } from '../../utils/Layout';

import { STATE } from '../../utils/consts/redux/SharedConsts';
import { APP_DATA } from '../../utils/consts/redux/AppConsts';

import * as Routes from '../../core/router/Routes';

const { BOOKING } = CONTEXT;

const FormsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 30px;
  height: 100%;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
`;

class FormsContainer extends React.Component<Props, *> {

  getPSAPath = (context) => `${Routes.PSA_FORM_BASE}/${context}`;

  render() {
    const { selectedOrganizationTitle, selectedOrganizationId, selectedOrganizationSettings } = this.props;
    // TODO: This is yucky. We will want to rework once we phase out different contexts for different orgs.
    const jurisdiction = getJurisdiction(selectedOrganizationId);
    const includeBooking = selectedOrganizationSettings.getIn([SETTINGS.CONTEXTS, CONTEXTS.BOOKING], false);
    const includeCourt = selectedOrganizationSettings.getIn([SETTINGS.CONTEXTS, CONTEXTS.COURT], false);
    return (
      <StyledFormWrapper>
        <DashboardMainSection header={`${selectedOrganizationTitle} Public Safety Assessment`}>
          {
            jurisdiction
              ? (
                <FormsWrapper>
                  {
                    includeBooking && (
                      <CreateFormListItem
                          name="Create New PSA (Booking)"
                          path={this.getPSAPath(BOOKING)}
                          icon={faFilePlus} />
                    )
                  }
                  {
                    includeCourt && (
                      <CreateFormListItem
                          name="Create New PSA (Court)"
                          path={this.getPSAPath(jurisdiction)}
                          icon={faFilePlus} />
                    )
                  }
                  <CreateFormListItem
                      name="Search Person"
                      path={Routes.REVIEW_REPORTS}
                      icon={faAddressCard} />
                  <CreateFormListItem
                      name="Search Reports"
                      path={Routes.SEARCH_FORMS}
                      icon={faSearch} />
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
